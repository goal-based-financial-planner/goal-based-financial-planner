# Contract: StorageProvider Interface

**Type**: TypeScript interface contract (internal module boundary)
**Location**: `src/util/storage/storageProvider.ts`
**Consumers**: `useAutosave` hook, `StorageProviderContext`, `WelcomePage`

---

## Purpose

This contract defines the boundary between the app's UI/state layer and any storage backend. Any component or hook that reads or writes plan data MUST go through this interface. Direct calls to `localStorage`, IndexedDB, or the Drive API from UI components are prohibited.

---

## TypeScript Interface

```typescript
export type StorageProviderId = 'local-file' | 'google-drive';
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type PermissionState = 'unknown' | 'granted' | 'denied';

export interface StorageProvider {
  readonly id: StorageProviderId;

  /**
   * Write the complete plan state to the backing store.
   * Throws StorageSaveError on failure.
   */
  save(data: PlannerData): Promise<void>;

  /**
   * Read the plan from the backing store.
   * Returns null if no file exists yet (new plan, empty session).
   * Throws StorageLoadError on failure (not null — null = "no file", throw = "error reading file").
   */
  load(): Promise<PlannerData | null>;

  /**
   * Persist session state needed to survive a page refresh within the same browser session.
   * For LocalFileProvider: write FileSystemFileHandle to IndexedDB.
   * For GoogleDriveProvider: write fileId to sessionStorage (token is never persisted).
   */
  persistSession(): Promise<void>;

  /**
   * Attempt to restore provider state from a previous session (page refresh).
   * Returns this provider if restore succeeded; returns null if no prior session exists,
   * permission was denied, or the file is no longer available.
   * MUST NOT throw — callers rely on null to mean "show welcome screen".
   */
  restoreSession(): Promise<StorageProvider | null>;

  /**
   * Delete all persisted session state.
   * Called on tab close (pagehide) and when the user explicitly opens/creates a new plan.
   */
  clearSession(): Promise<void>;
}
```

---

## Error Types

```typescript
export type StorageSaveReason =
  | 'permission-denied'
  | 'file-not-found'
  | 'network-error'
  | 'quota-exceeded'
  | 'unknown';

export type StorageLoadReason =
  | 'permission-denied'
  | 'file-not-found'
  | 'invalid-format'
  | 'network-error'
  | 'unknown';

export class StorageSaveError extends Error {
  readonly provider: StorageProviderId;
  readonly reason: StorageSaveReason;
  readonly retryable: boolean;
}

export class StorageLoadError extends Error {
  readonly provider: StorageProviderId;
  readonly reason: StorageLoadReason;
}
```

---

## Behavioral Contract

### `save(data)`

- MUST be idempotent: calling `save` twice with the same data MUST produce the same result as calling it once
- MUST complete the full write before resolving (no fire-and-forget)
- MUST throw `StorageSaveError` (not a generic `Error`) on any failure
- MUST NOT modify `data` in any way

### `load()`

- MUST return `null` (not throw) when no file/session exists
- MUST throw `StorageLoadError` when a file exists but cannot be read or parsed
- MUST reconstruct a valid `PlannerData` instance (not a plain object) — callers depend on `PlannerData` methods being available

### `restoreSession()`

- MUST NOT throw under any circumstance
- MUST return `null` for: no prior session, IndexedDB unavailable, permission denied, file deleted, Drive API unreachable
- A returned non-null provider MAY still require a user interaction before `save()` or `load()` can succeed (e.g., `LocalFileProvider` needing permission re-grant); the provider MUST surface this via a `permissionState` or equivalent signal

### `clearSession()`

- MUST be safe to call multiple times (idempotent)
- MUST NOT throw
- SHOULD complete synchronously where possible (it is called from `pagehide`)

---

## StorageProviderContext Contract

```typescript
export interface StorageProviderContextValue {
  provider: StorageProvider | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  lastError: StorageSaveError | null;
  /**
   * Initialize a provider for a given action.
   * Triggers the appropriate picker flow (FSAA dialog or GIS OAuth popup).
   * On success, sets `provider` and begins the autosave lifecycle.
   * On cancel/failure, leaves `provider` unchanged (null if first session).
   */
  initProvider(type: StorageProviderId, mode: 'new' | 'open'): Promise<void>;
  /**
   * Tear down the active provider, clear its session, and return to the welcome screen.
   */
  clearProvider(): Promise<void>;
}
```

---

## What This Contract Does NOT Define

- Internal implementation details of how LocalFileProvider or GoogleDriveProvider work
- Which React component renders the file picker UI (that is a UI concern)
- The autosave debounce timer (that is a `useAutosave` hook concern)
- Any Google API client IDs or OAuth configuration (environment-level config)
