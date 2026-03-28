# Data Model: Flexible Storage Provider

**Feature**: 007-flexible-storage-provider
**Date**: 2026-03-19

---

## Overview

This feature introduces a storage abstraction layer on top of the existing `PlannerData` domain model. No changes are made to `PlannerData`, `FinancialGoal`, `SIPEntry`, or any other existing domain entities. The new entities below describe the storage layer only.

---

## Entities

### 1. `StorageProvider` (interface)

The common contract implemented by all storage backends. Lives in `src/util/storage/storageProvider.ts`.

| Field / Method | Type | Description |
|---|---|---|
| `id` | `'local-file' \| 'google-drive'` | Discriminant for the provider type |
| `save(data)` | `(data: PlannerData) => Promise<void>` | Write the full plan to the backing store |
| `load()` | `() => Promise<PlannerData \| null>` | Read the plan from the backing store; `null` if no file exists |
| `persistSession()` | `() => Promise<void>` | Persist whatever session state is needed to survive a page refresh (handle to IndexedDB, file ID to sessionStorage) |
| `restoreSession()` | `() => Promise<StorageProvider \| null>` | Attempt to restore from persisted session state; returns `null` if nothing stored, permission denied, or file missing |
| `clearSession()` | `() => Promise<void>` | Delete all persisted session state (called on tab close or explicit disconnect) |

**Validation rules**:
- `save()` MUST throw a typed `StorageSaveError` on failure (not a raw `Error`)
- `load()` MUST throw a typed `StorageLoadError` on failure; returning `null` is reserved for "file not found / no session" only
- `restoreSession()` MUST NOT throw — swallow errors and return `null`

---

### 2. `LocalFileProvider`

Implements `StorageProvider` using the File System Access API.

| Field | Type | Description |
|---|---|---|
| `id` | `'local-file'` | Fixed discriminant |
| `fileHandle` | `FileSystemFileHandle \| null` | The handle to the user-selected `.json` file; `null` until a file is picked or session is restored |
| `permissionState` | `'unknown' \| 'granted' \| 'denied'` | Current permission state; must be `'granted'` before `save()` or `load()` is called |

**State transitions**:
```
null (no handle)
  → [user picks file via showSaveFilePicker/showOpenFilePicker]
  → handle acquired, permissionState = 'granted'
  → [page refresh]
  → handle restored from IndexedDB, permissionState = 'unknown'
  → [user clicks "Resume editing"]
  → requestPermission() called, permissionState = 'granted' or 'denied'
```

**Session persistence**:
- Key in IndexedDB: `'localFileHandle'`
- Deleted on `pagehide` event (tab/window close) to enforce session boundary

**Fallback behavior** (browser does not support FSAA):
- `save()` triggers a JSON download via `URL.createObjectURL` + `<a download>` (manual save only; autosave not available)
- `load()` is driven by an `<input type="file">` element
- `persistSession()` and `restoreSession()` are no-ops (no handle to persist)
- Provider signals `fallbackMode: true` so the UI can display the limitation warning

---

### 3. `GoogleDriveProvider`

Implements `StorageProvider` using the Google Drive REST API with `appDataFolder` scope.

| Field | Type | Description |
|---|---|---|
| `id` | `'google-drive'` | Fixed discriminant |
| `fileId` | `string \| null` | Drive file ID of the active plan file; persisted in `sessionStorage` |
| `accessToken` | `string \| null` | Short-lived OAuth2 access token; stored in JS memory only (never persisted) |
| `tokenExpiresAt` | `number \| null` | Unix ms timestamp when the access token expires |
| `authStatus` | `'unauthorized' \| 'authorizing' \| 'authorized' \| 'expired'` | Current auth lifecycle state |

**State transitions**:
```
unauthorized
  → [user clicks "Connect Google Drive"]
  → authorizing (GIS popup shown)
  → authorized (token received, fileId resolved or created)
  → [token expires after ~1 hour]
  → expired
  → [silent re-auth with prompt:'']
  → authorized
  → [user revokes access or closes tab]
  → unauthorized / session cleared
```

**Session persistence**:
- `sessionStorage` key: `'gdriveSession'`
- Value: `{ fileId: string }` (token is NOT persisted — security requirement)
- On restore: `fileId` is recovered, but `accessToken` is `null`; token is silently re-requested before the first save/load

---

### 4. `SaveStatus`

Tracks the current persistence state of the open plan. Lives in `src/util/storage/storageProvider.ts`.

```typescript
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
```

| State | Meaning | UI indicator |
|---|---|---|
| `idle` | No pending changes; last save was successful | No indicator (or "All changes saved" faded) |
| `saving` | Debounce fired; write in progress | Spinner + "Saving..." |
| `saved` | Write completed successfully | Checkmark + "Saved" (auto-clears to `idle` after 3 seconds) |
| `error` | Write failed | Warning icon + "Save failed – click to retry" |

---

### 5. `StorageSaveError` / `StorageLoadError`

Typed error classes for distinguishing storage failures from unexpected runtime errors.

**`StorageSaveError`**:

| Field | Type | Description |
|---|---|---|
| `provider` | `'local-file' \| 'google-drive'` | Which provider failed |
| `reason` | `'permission-denied' \| 'file-not-found' \| 'network-error' \| 'quota-exceeded' \| 'unknown'` | Specific failure cause |
| `retryable` | `boolean` | Whether the operation can be retried without user interaction |

**`StorageLoadError`**:

| Field | Type | Description |
|---|---|---|
| `provider` | `'local-file' \| 'google-drive'` | Which provider failed |
| `reason` | `'permission-denied' \| 'file-not-found' \| 'invalid-format' \| 'network-error' \| 'unknown'` | Specific failure cause |

---

### 6. `ActiveSession`

The runtime state held in `StorageProviderContext`. Not persisted directly — reconstructed from each provider's `restoreSession()` on mount.

| Field | Type | Description |
|---|---|---|
| `provider` | `StorageProvider \| null` | The active provider instance; `null` when no session (welcome screen shown) |
| `saveStatus` | `SaveStatus` | Current save state |
| `lastSavedAt` | `Date \| null` | Timestamp of last successful save |
| `lastError` | `StorageSaveError \| null` | Last save error, if any |
| `initProvider` | `(type: 'local-file' \| 'google-drive', mode: 'new' \| 'open') => Promise<void>` | Called by welcome screen / in-app New/Open to configure a provider |
| `clearProvider` | `() => Promise<void>` | Tears down the active provider and shows the welcome screen |

---

## Relationships

```
ActiveSession
  └── provider: StorageProvider (interface)
        ├── LocalFileProvider
        │     └── fileHandle: FileSystemFileHandle (stored in IndexedDB)
        └── GoogleDriveProvider
              ├── fileId (stored in sessionStorage)
              └── accessToken (JS memory only)

ActiveSession
  └── operates on: PlannerData (existing — unchanged)
```

---

## Unchanged Entities

The following existing entities are **not modified** by this feature:

- `PlannerData` — structure unchanged; it is what gets serialized to JSON for storage
- `FinancialGoal` — unchanged
- `SIPEntry` — unchanged
- `InvestmentAllocationsType` — unchanged
- `plannerDataReducer` — unchanged (still produces `PlannerData` on each action)
- `src/util/storage.ts` — **retired**: replaced by `src/util/storage/` directory; existing localStorage functions removed once the new system is in place

---

## localStorage Retirement

The existing `setPlannerData` / `getPlannerData` functions in `src/util/storage.ts` are retired by this feature. The `localStorage` key `plannerData` is no longer written. Existing data in localStorage is left in place but is no longer read by the app (per clarification Q5: no migration).

The non-plan flags — `isTourTaken`, `disclaimerAccepted` — are **not** part of the storage provider feature and remain in `src/util/storage.ts` untouched.
