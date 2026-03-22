# Research: Flexible Storage Provider

**Feature**: 007-flexible-storage-provider
**Date**: 2026-03-19
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: Local Computer Storage — File System Access API

**Decision**: Use the browser File System Access API (FSAA) with `showSaveFilePicker` for new files and `showOpenFilePicker` for existing files. Store the resulting `FileSystemFileHandle` in IndexedDB (via `idb-keyval`) for session-scoped persistence.

**Rationale**: FSAA is the only browser API that gives the user a real, named file in their chosen location that they can back up, email, or open in other tools. `showSaveFilePicker` provides a native OS save dialog — semantically correct for "create new file." `showOpenFilePicker` provides a native open dialog — semantically correct for "open existing file."

**Handle persistence**: `FileSystemFileHandle` is structured-cloneable but not JSON-serializable. IndexedDB is the only browser storage mechanism that accepts structured-cloneable objects. The `idb-keyval` package (~300 bytes brotli) wraps IndexedDB with a key/value API. Handles must be deleted on tab close (`pagehide` event) to enforce the session boundary, because IndexedDB persists across browser restarts by default.

**Permission re-grant after refresh**: Permissions are not automatically re-granted after a page reload. On session restore, the app calls `handle.queryPermission({ mode: 'readwrite' })` — if not already granted, `handle.requestPermission()` is called, but only from within a user gesture (button click). The app shows a "Resume editing" prompt rather than calling `requestPermission` on mount.

**TypeScript types**: `@types/wicg-file-system-access` with `skipLibCheck: true` in `tsconfig.json`. This package covers the full API surface including `queryPermission` and `requestPermission`.

**New dependency**: `idb-keyval` (~300 bytes brotli). No other new dependencies required for local file storage.

**Alternatives considered**:

| Alternative | Why Rejected |
|---|---|
| Origin Private File System (OPFS) | Invisible to user; user cannot manage the file in their OS file browser. Poor UX for portable financial data. |
| `browser-fs-access` library (Google Chrome Labs) | Useful abstraction over FSAA + `<input>` fallback, but adds a dependency with its own abstraction surface. The fallback pattern is simple enough to implement directly. |
| `showDirectoryPicker` + `getFileHandle` | Requires two user interactions (pick folder, then file). `showSaveFilePicker` is the semantic-correct single-step alternative. |
| `localStorage` / `sessionStorage` | 5 MB limit, not a real user-managed file, no portability. |

---

## Decision 2: Unsupported Browser Fallback (Local Computer)

**Decision**: Feature-detect FSAA at runtime. If unavailable (Firefox, Safari, mobile), fall back to `<input type="file" accept=".json">` for opening and programmatic download (`URL.createObjectURL` + `<a download>`) for saving. Show a visible notification to users on unsupported browsers explaining the limitation.

**Browser support context**: FSAA (`showOpenFilePicker`, `showSaveFilePicker`) is supported in Chromium-based browsers only (Chrome 86+, Edge 86+, Opera 72+). Firefox and Safari have no support as of early 2026. Global usage coverage is approximately 32–33%.

**Fallback trade-off**: The fallback provides functional save/load but loses autosave capability (you cannot write back to a file handle you don't have). Users on unsupported browsers who choose "Local Computer" will be informed that autosave is unavailable and must manually save via a download. Google Drive remains fully available on all browsers as an autosave-capable alternative.

**Rationale**: Blocking Firefox/Safari users from using the app entirely would be overly restrictive. The degraded-but-functional fallback with clear communication is the right balance.

---

## Decision 3: Google Drive Auth Flow

**Decision**: Use the **Google Identity Services (GIS) Token Model** (`google.accounts.oauth2.initTokenClient`). Load the GIS library via a `<script>` tag. Request only the `https://www.googleapis.com/auth/drive.appdata` scope.

**Rationale**: The classic `gapi.auth2` implicit flow is deprecated by Google. Authorization Code + PKCE requires a backend to exchange the code securely — not viable for a pure frontend SPA. The GIS Token Model is the current Google-recommended approach for no-backend SPAs: it delivers a short-lived access token via popup with no client secret required, no backend involved, and supports re-issuance with `prompt: ''` (silent re-auth when the user has an active Google session).

**Scope choice — `drive.appdata`**: This scope provides access only to a hidden app-specific folder in the user's Drive. The user's other files are completely inaccessible to the app. This scope is classified as "non-sensitive" by Google, meaning no OAuth consent screen security review is required — a significant practical advantage for a personal-use app.

**Token storage**: Access token stored in JavaScript memory only (module-level variable or React context ref). NOT `sessionStorage` or `localStorage` — both are readable by any JS on the page (XSS risk). The file ID (not sensitive) is stored in `sessionStorage` for session persistence. Token lifetime is 3,600 seconds (1 hour); before each API call, expiry is checked with a 60-second buffer, and `requestAccessToken({ prompt: '' })` is called silently if needed.

**No refresh tokens**: GIS Token Model does not issue refresh tokens. Re-authorization relies on the user's active Google session cookie, making silent re-auth (`prompt: ''`) succeed without visible UI in most cases.

**Alternatives considered**:

| Alternative | Why Rejected |
|---|---|
| Classic `gapi.auth2` | Deprecated — will stop working |
| Authorization Code + PKCE | Requires a backend server |
| `drive.file` scope | Allows app to access any file the user opened with it — broader than necessary |
| `drive` (full access) | Far too broad; triggers consent screen security review |

---

## Decision 4: Google Drive File Operations

**Decision**: Use the Google Drive REST API directly via `fetch`. Manage a single file per plan named `planner-<timestamp>.json` stored in `appDataFolder`.

**Key endpoints**:
- **List**: `GET /drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)`
- **Create**: `POST /upload/drive/v3/files?uploadType=multipart` with `parents: ["appDataFolder"]`
- **Read**: `GET /drive/v3/files/{fileId}?alt=media`
- **Update**: `PATCH /upload/drive/v3/files/{fileId}?uploadType=media`

**File ID caching**: After creating or opening a file, the Drive file ID is stored in `sessionStorage` so subsequent saves use the update endpoint directly without re-listing. On session restore, the cached file ID is used immediately; if the API returns 404, the session cache is cleared and the user is prompted to re-open.

**CORS**: All Drive REST API endpoints support CORS for browser requests. No proxy required.

---

## Decision 5: Autosave Trigger

**Decision**: Debounced autosave using `useEffect` + `setTimeout`/`clearTimeout` — 2-second delay after the last change.

**Rationale**: File system writes and network calls (Drive API) are expensive relative to localStorage writes. Debouncing batches rapid consecutive edits (typing, toggling) into a single write. The 2-second delay is short enough that users never feel at risk of data loss, while reducing write frequency by an order of magnitude for active editing sessions. This is the standard approach used by Notion, Google Docs, and Figma.

**Race condition guard**: A `useRef` flag (`isMountedRef`) prevents stale async saves from updating state after component unmount. The `clearTimeout` cleanup in `useEffect` cancels any pending debounce timer on dependency change.

**No external library needed**: The standard `useEffect` cleanup pattern is sufficient. Adding `use-debounce` would be over-engineering for a single use case.

---

## Decision 6: Save Status Model

**Decision**: Four states — `'idle' | 'saving' | 'saved' | 'error'`. Exposed via a `useAutosave` custom hook that also returns `lastSavedAt: Date | null` and `lastError: Error | null`.

**State transitions**:
- `idle` → `saving`: synchronously when debounce fires (before `await` resolves)
- `saving` → `saved`: after successful write
- `saving` → `error`: after failed write
- `saved` → `idle`: 3 seconds after save completes (auto-clear)
- `error` → `saving`: on next debounce trigger (retry on next edit)

**Unsaved changes guard**: `beforeunload` event listener registered only when `saveStatus === 'saving'` (dirty + in-flight). Removed when `saved` or `idle`. This avoids the Firefox bfcache penalty from persistent `beforeunload` listeners.

---

## Decision 7: Storage Provider Abstraction

**Decision**: Define a common `StorageProvider` TypeScript interface implemented by both `LocalFileProvider` and `GoogleDriveProvider`. A React context (`StorageProviderContext`) holds the active provider and the `initProvider` function used by the welcome screen and in-app New/Open flows.

**Interface operations**: `save(data)`, `load()`, `persistSession()`, `restoreSession()`, `clearSession()`. The autosave hook calls only `provider.save(data)` — it is completely unaware of whether the destination is a local file or Drive.

**Session restore flow on page refresh**:
1. On mount, each provider class calls `restoreSession()`.
2. `LocalFileProvider.restoreSession()`: reads IndexedDB for a stored handle; if found, returns the provider in a "needs permission re-grant" state.
3. `GoogleDriveProvider.restoreSession()`: reads `sessionStorage` for `{ fileId }`; if found, returns the provider in a "needs token" state (token is never persisted).
4. If restore succeeds, the app renders the plan without showing the welcome screen.
5. If restore fails (no session data, permission denied, missing file), the welcome screen is shown.

---

## New Dependencies Summary

| Package | Size | Purpose | Required for |
|---|---|---|---|
| `idb-keyval` | ~300B brotli | IndexedDB key/value storage for `FileSystemFileHandle` | Local Computer provider |
| GIS (`accounts.google.com/gsi/client`) | CDN script | Google Identity Services token model | Google Drive provider |

No backend, no new build tools, no additional test utilities required.
