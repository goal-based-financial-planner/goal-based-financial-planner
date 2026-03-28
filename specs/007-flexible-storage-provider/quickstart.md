# Developer Quickstart: Flexible Storage Provider

**Feature**: 007-flexible-storage-provider
**Branch**: `007-flexible-storage-provider`

---

## Prerequisites

- Node.js 22+ (as set in CI)
- A Google Cloud project with an OAuth 2.0 Client ID configured for "Web application" type

---

## Local Development Setup

### 1. Install new dependency

```bash
npm install idb-keyval
```

### 2. Configure Google OAuth

Create a `.env.local` file in the project root (gitignored):

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

In the Google Cloud Console for your project:
- Go to **APIs & Services → Credentials**
- Edit your OAuth 2.0 Client ID
- Add to **Authorized JavaScript origins**: `http://localhost:5173`
- Enable the **Google Drive API** for your project

### 3. Start the dev server

```bash
npm run dev
```

The app will open at `http://localhost:5173`. On first load you will see the new welcome screen instead of the planner directly.

---

## New File Locations

| File | Purpose |
|---|---|
| `src/util/storage/storageProvider.ts` | `StorageProvider` interface, `SaveStatus` type, `StorageSaveError`, `StorageLoadError` |
| `src/util/storage/localFileProvider.ts` | FSAA-based implementation; IndexedDB session persistence via `idb-keyval` |
| `src/util/storage/googleDriveProvider.ts` | Google Drive REST API implementation; GIS token model |
| `src/util/storage/sessionPersistence.ts` | Helpers: IndexedDB key/value wrappers, sessionStorage helpers, `pagehide` listener registration |
| `src/util/storage/index.ts` | Re-exports: `StorageProvider`, `SaveStatus`, `StorageSaveError`, `StorageLoadError` |
| `src/hooks/useAutosave.ts` | Debounced autosave hook; owns `SaveStatus` state lifecycle |
| `src/context/StorageProviderContext.tsx` | React context; holds active provider, exposes `initProvider` / `clearProvider` |
| `src/components/StorageProviderPicker/` | Reusable dialog: choose "Local Computer" or "Google Drive" |
| `src/pages/WelcomePage/` | Entry page; shown when no active session; hosts "New Plan" / "Open Plan" flows |

### Retired / Modified

| File | Change |
|---|---|
| `src/util/storage.ts` | `setPlannerData` / `getPlannerData` removed; non-plan flags (`isTourTaken`, `disclaimerAccepted`) remain |
| `src/pages/Home/index.tsx` | Direct `useEffect` autosave removed; replaced by consuming `StorageProviderContext` |

---

## Architecture Overview

```
WelcomePage
  └── StorageProviderPicker (component)
        └── calls context.initProvider(type, mode)

StorageProviderContext
  ├── holds: provider (LocalFileProvider | GoogleDriveProvider | null)
  └── holds: saveStatus, lastSavedAt, lastError

useAutosave(plannerData, provider)
  ├── 2-second debounce on plannerData changes
  ├── calls provider.save(plannerData)
  └── updates saveStatus: idle → saving → saved | error

LocalFileProvider
  ├── showSaveFilePicker / showOpenFilePicker (FSAA)
  ├── FileSystemFileHandle → createWritable() → write JSON
  └── idb-keyval: persist/restore handle; delete on pagehide

GoogleDriveProvider
  ├── GIS: google.accounts.oauth2.initTokenClient (drive.appdata scope)
  ├── Drive REST API: files.list, files.create, files.get, files.update
  └── sessionStorage: persist/restore fileId; token in JS memory only
```

---

## Running Tests

```bash
npm test
```

Key test files introduced by this feature:

- `src/util/storage/localFileProvider.test.ts` — save/load with mocked `FileSystemFileHandle`
- `src/util/storage/googleDriveProvider.test.ts` — save/load with mocked `fetch` (Drive API calls)
- `src/hooks/useAutosave.test.ts` — debounce timing, status transitions, error handling
- `src/context/StorageProviderContext.test.tsx` — provider init, restore, clear flows

---

## Key Development Notes

### File System Access API requires a user gesture
`showOpenFilePicker`, `showSaveFilePicker`, and `requestPermission` MUST be called from within a `click` handler (or other user gesture). Never call from `useEffect` — browsers will silently reject with `SecurityError`.

### `FileSystemFileHandle` cannot be stored in `sessionStorage`
It is structured-cloneable but not JSON-serializable. Use `idb-keyval` (IndexedDB). See `src/util/storage/sessionPersistence.ts`.

### Token security
The Google Drive access token is stored in a module-level variable in `googleDriveProvider.ts` only. It MUST NOT be written to `sessionStorage`, `localStorage`, or any React state that could be serialized.

### Fallback mode (Firefox / Safari)
`LocalFileProvider` checks `'showOpenFilePicker' in window` on instantiation. In fallback mode, `save()` triggers a download and `load()` requires an `<input type="file">` interaction. The provider signals `fallbackMode: true`; `StorageProviderContext` surfaces this so `WelcomePage` can display an informational banner.

### Environment variable
`VITE_GOOGLE_CLIENT_ID` must be set in `.env.local` for Google Drive to work locally. The app renders a disabled "Google Drive" option with a tooltip if the variable is missing.
