# Tasks: Flexible Storage Provider

**Input**: Design documents from `specs/007-flexible-storage-provider/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not explicitly requested in spec — no test tasks generated. Core logic (useAutosave, providers) should have tests but are not enumerated here as separate tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new dependencies and configuration required by the storage layer.

- [x] T001 Install `idb-keyval` runtime dependency and `@types/wicg-file-system-access` dev dependency via `npm install idb-keyval` and `npm install --save-dev @types/wicg-file-system-access`
- [x] T002 Update `tsconfig.json` — add `"skipLibCheck": true` to `compilerOptions` to resolve the known lib.dom.d.ts / @types/wicg-file-system-access conflict
- [x] T003 [P] Add Google Identity Services (GIS) CDN script tag to `index.html` — insert `<script src="https://accounts.google.com/gsi/client" async></script>` before `</body>`
- [x] T004 [P] Create `.env.example` at project root with `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com` placeholder; update `.gitignore` to confirm `.env.local` is already ignored

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core storage abstraction layer — MUST be complete before any user story work begins.

**⚠️ CRITICAL**: No user story can be implemented until this phase is complete.

- [x] T005 Create `src/util/storage/storageProvider.ts` — define `StorageProviderId` type, `SaveStatus` type (`'idle' | 'saving' | 'saved' | 'error'`), `StorageProvider` interface (`save`, `load`, `persistSession`, `restoreSession`, `clearSession`), `StorageSaveError` class (provider, reason, retryable), `StorageLoadError` class (provider, reason) — per `contracts/storage-provider-interface.md`
- [x] T006 [P] Create `src/util/storage/sessionPersistence.ts` — export `saveFileHandle(handle: FileSystemFileHandle): Promise<void>` and `loadFileHandle(): Promise<FileSystemFileHandle | null>` using `idb-keyval` (key: `'localFileHandle'`); export `saveDriveSession(fileId: string): void` and `loadDriveSession(): { fileId: string } | null` using `sessionStorage` (key: `'gdriveSession'`); export `registerPagehideCleanup(onClose: () => void): void` that adds a `window` `pagehide` listener
- [x] T007 [P] Create `src/util/storage/localFileProvider.ts` — implement `LocalFileProvider` class satisfying `StorageProvider`; detect FSAA support via `'showOpenFilePicker' in window` and expose `readonly fallbackMode: boolean`; implement `save()` and `load()` as stubs (throw `StorageSaveError` with reason `'unknown'` until `initNew`/`initOpen` are called in Phase 3); implement `persistSession` (save handle via sessionPersistence), `restoreSession` (load handle from IDB → return null if missing), `clearSession` (delete IDB handle + sessionStorage); expose `permissionState: PermissionState` field
- [x] T008 [P] Create `src/util/storage/googleDriveProvider.ts` — implement `GoogleDriveProvider` class satisfying `StorageProvider`; declare module-level `accessToken: string | null` and `tokenExpiresAt: number | null`; implement `ensureToken(): Promise<void>` using `google.accounts.oauth2.initTokenClient` with `scope: 'https://www.googleapis.com/auth/drive.appdata'`; implement Drive REST fetch helpers `driveList()`, `driveCreate(data)`, `driveRead(fileId)`, `driveUpdate(fileId, data)` using `fetch` with `Authorization: Bearer` header; implement `persistSession` (write `fileId` to sessionStorage), `restoreSession` (load fileId from sessionStorage → token is null, returns provider in 'unauthorized' state with fileId set), `clearSession`
- [x] T009 Create `src/util/storage/index.ts` — re-export: `StorageProvider`, `StorageProviderId`, `SaveStatus`, `StorageSaveError`, `StorageLoadError` from `./storageProvider`; `LocalFileProvider` from `./localFileProvider`; `GoogleDriveProvider` from `./googleDriveProvider`
- [x] T010 Create `src/context/StorageProviderContext.tsx` — define `StorageProviderContextValue` interface (provider, saveStatus, lastSavedAt, lastError, initProvider, clearProvider); create `StorageProviderContext` with React `createContext`; implement `StorageProviderContextProvider` component that: (a) on mount attempts `LocalFileProvider.restoreSession()` then `GoogleDriveProvider.restoreSession()` and sets active provider if found, (b) exposes `initProvider(type, mode)` stub (to be filled in Phase 3), (c) exposes `clearProvider()` that calls `provider.clearSession()` and sets provider to null; wrap in `src/App.tsx`

**Checkpoint**: Storage layer foundation ready — types, providers scaffolded, context exists. User story work can begin.

---

## Phase 3: User Stories 1, 2, 3 — Welcome Screen + New/Open Flows (Priority: P1) 🎯 MVP

**Goal**: On every new session, show a welcome screen with "New Plan" and "Open Plan" buttons. Each button opens the appropriate storage picker and completes the new/open flow for both Local Computer and Google Drive.

**Independent Test**: Open the app in a new Chrome tab → welcome screen appears → "New Plan" → "Local Computer" → OS save dialog → pick location → planner loads empty → repeat with "Open Plan" and "Google Drive".

### Implementation

- [x] T011 [P] [US1] Create `src/components/StorageProviderPicker/index.tsx` — MUI Dialog with two option cards: "Local Computer" (shows FSAA unavailability warning when `LocalFileProvider.fallbackMode === true`) and "Google Drive" (disabled with tooltip when `import.meta.env.VITE_GOOGLE_CLIENT_ID` is falsy); accepts `mode: 'new' | 'open'` and `onSelect(type: StorageProviderId): void` props; renders cancel button
- [x] T012 [P] [US1] Create `src/pages/WelcomePage/components/WelcomeCard/index.tsx` — MUI Card with app name/logo, "New Plan" and "Open Plan" MUI Buttons; accepts `onNew: () => void` and `onOpen: () => void` props
- [x] T013 [US1] Create `src/pages/WelcomePage/index.tsx` — renders `WelcomeCard`; on "New Plan" click opens `StorageProviderPicker` with `mode='new'`; on "Open Plan" click opens `StorageProviderPicker` with `mode='open'`; on provider selection calls `context.initProvider(type, mode)`; shows loading state while `initProvider` is in progress; shows error snackbar if `initProvider` rejects
- [x] T014 [US1] Update `src/App.tsx` — wrap existing app tree with `StorageProviderContextProvider`; conditionally render `<WelcomePage />` when `context.provider === null`, otherwise render existing planner shell (`<Home />`)
- [x] T015 [US2] Add `initNew(type: StorageProviderId): Promise<void>` to `src/context/StorageProviderContext.tsx` — for `'local-file'`: call `LocalFileProvider.initNew()`, set as active provider, call `persistSession()`; for `'google-drive'`: call `GoogleDriveProvider.initNew()`, set as active provider, call `persistSession()`
- [x] T016 [US2] Add `initNew(): Promise<void>` to `src/util/storage/localFileProvider.ts` — call `window.showSaveFilePicker({ suggestedName: 'financial-plan.json', types: [{ accept: { 'application/json': ['.json'] } }] })`; write initial empty `PlannerData` JSON via `createWritable()`; store handle in `this.fileHandle`; set `permissionState = 'granted'`; on `AbortError` return without throwing
- [x] T017 [US3] Add `initOpen(): Promise<void>` to `src/util/storage/localFileProvider.ts` — call `window.showOpenFilePicker({ types: [{ accept: { 'application/json': ['.json'] } }] })`; read file text via `handle.getFile().text()`; validate and parse as `PlannerData` (throw `StorageLoadError` with `reason: 'invalid-format'` if invalid); store handle; on `AbortError` return without throwing
- [x] T018 [US2] Add `initNew(): Promise<void>` to `src/util/storage/googleDriveProvider.ts` — call `this.ensureToken()`; POST to `/upload/drive/v3/files?uploadType=multipart` with `parents: ["appDataFolder"]`, `name: 'financial-plan.json'`, and initial empty `PlannerData` JSON body; store returned `fileId` in `this.fileId`; call `persistSession()`
- [x] T019 [US3] Add `initOpen(): Promise<void>` to `src/util/storage/googleDriveProvider.ts` — call `this.ensureToken()`; GET `/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)` to list files; return file list to caller (store as `this.availableFiles`); caller selects a file (via `selectFile(fileId)` method); GET `/drive/v3/files/{fileId}?alt=media`; validate and parse as `PlannerData`; store `fileId`; call `persistSession()`; add `DriveFilePicker` sub-component to `src/pages/WelcomePage/index.tsx` that renders the list for user selection
- [x] T020 [US3] Implement `LocalFileProvider.load()` and `GoogleDriveProvider.load()` fully in their respective files — `LocalFileProvider.load()`: verify permission, call `this.fileHandle.getFile().text()`, parse JSON; `GoogleDriveProvider.load()`: call `ensureToken()`, GET `files/{fileId}?alt=media`, parse JSON — both throw typed `StorageLoadError` on failure, return `null` only when no handle/fileId set

**Checkpoint**: Welcome screen fully functional. New Plan and Open Plan flows work for both providers. Planner loads after selection. Refresh within same session restores provider without showing welcome screen.

---

## Phase 4: User Stories 4, 5 — Autosave (Priority: P2)

**Goal**: After setup, any change to plan data autosaves within 4 seconds using the active storage provider. A save status indicator is always visible.

**Independent Test** (US4): Open with Local Computer → add a goal → wait ~2s → verify the `.json` file on disk has updated (check file modification time or reopen). **Independent Test** (US5): Open with Google Drive → add a goal → wait → re-open the file from Drive in another browser tab and confirm data is present.

### Implementation

- [x] T021 Create `src/hooks/useAutosave.ts` — accepts `(data: PlannerData, provider: StorageProvider | null)` and returns `{ saveStatus: SaveStatus, lastSavedAt: Date | null, lastError: StorageSaveError | null, triggerManualSave: () => void }`; implement 2-second `useEffect` + `setTimeout` debounce; use `useRef` for mounted guard and active timer; `SaveStatus` state machine: start `'idle'`, set `'saving'` synchronously before `await provider.save(data)`, set `'saved'` on success (auto-revert to `'idle'` after 3s), set `'error'` on `StorageSaveError`; register `beforeunload` listener only when `saveStatus === 'saving'`; implement `triggerManualSave` that cancels pending timer and calls save immediately (no-op if already saving)
- [x] T022 [US4] Refactor `src/pages/Home/index.tsx` — remove the direct `useEffect` that calls `persistPlannerData(plannerData)`; consume `StorageProviderContext` to get `provider`; call `useAutosave(plannerData, provider)`; pass `saveStatus` and `triggerManualSave` to layout
- [x] T023 [P] [US4] Create `src/components/SaveStatusIndicator/index.tsx` — MUI-based chip/text component accepting `saveStatus: SaveStatus` and `lastSavedAt: Date | null` props; renders: nothing for `'idle'`, spinner + "Saving..." for `'saving'`, checkmark + "Saved" for `'saved'`, warning icon + "Save failed" for `'error'`; add to `src/pages/Home/index.tsx` header area
- [x] T024 [US4] Implement `LocalFileProvider.save(data: PlannerData)` fully in `src/util/storage/localFileProvider.ts` — call `verifyOrRequestPermission(this.fileHandle)`; on `'granted'`: `const w = await this.fileHandle.createWritable(); await w.write(JSON.stringify(data, null, 2)); await w.close()`; on `'denied'`: throw `StorageSaveError({ reason: 'permission-denied', retryable: false })`; in fallback mode: trigger `URL.createObjectURL` download (manual save only, no-op for autosave path)
- [x] T025 [US5] Implement `GoogleDriveProvider.save(data: PlannerData)` fully in `src/util/storage/googleDriveProvider.ts` — call `ensureToken()`; if `navigator.onLine === false`: push to `this.pendingQueue` and return; PATCH `/upload/drive/v3/files/{this.fileId}?uploadType=media` with `Content-Type: application/json` body `JSON.stringify(data)`; on `401` response: call `ensureToken({ forceRefresh: true })` and retry once; on network error: push to `pendingQueue`, throw `StorageSaveError({ reason: 'network-error', retryable: true })`; register `window.addEventListener('online', flushQueue)` once on provider init
- [x] T026 [US5] Implement `GoogleDriveProvider.ensureToken()` token expiry handling in `src/util/storage/googleDriveProvider.ts` — check `Date.now() > this.tokenExpiresAt - 60_000`; if expired: call `this.tokenClient.requestAccessToken({ prompt: '' })`; wait for callback to update `accessToken` and `tokenExpiresAt`; if re-auth fails (error callback): set `authStatus = 'expired'`, throw `StorageSaveError({ reason: 'network-error', retryable: true })`; surface `authStatus` via context so UI can show "Reconnect Google Drive" prompt

**Checkpoint**: Autosave works for both Local Computer and Google Drive. Save status indicator is always visible. Offline edits queue for Drive and flush on reconnect.

---

## Phase 5: User Story 6 — Manual Save (Priority: P3)

**Goal**: Users can trigger a save at any time via Ctrl+S or a Save button, bypassing the autosave debounce.

**Independent Test**: Make a change → immediately press Ctrl+S before the 2-second debounce fires → verify file is saved immediately (file modification time updated on disk; Drive API call fired immediately in network tab).

### Implementation

- [x] T027 [US6] Add Ctrl+S keyboard shortcut handler in `src/pages/Home/index.tsx` — register `useEffect` with `keydown` listener; detect `(e.ctrlKey || e.metaKey) && e.key === 's'`; call `triggerManualSave()`; `e.preventDefault()` to suppress browser default save dialog
- [x] T028 [US6] Add "Save" button to `src/pages/Home/index.tsx` header area — MUI `IconButton` or `Button` with save icon; disabled when `saveStatus === 'saving'`; `onClick` calls `triggerManualSave()`; placed adjacent to `SaveStatusIndicator`

**Checkpoint**: All six user stories are fully functional. Manual save works from both keyboard and button.

---

## Final Phase: Polish & Edge Cases

**Purpose**: Handle all edge cases defined in `spec.md` and retire the legacy localStorage plan functions.

- [x] T029 [P] Implement FSAA fallback mode banner in `src/components/StorageProviderPicker/index.tsx` — when `provider.fallbackMode === true` for Local Computer, show MUI Alert: "Your browser doesn't support automatic file saving. You can still save manually using the download button. For autosave, use Google Drive."; disable autosave in `useAutosave` when `provider instanceof LocalFileProvider && provider.fallbackMode`
- [x] T030 [P] Implement permission re-grant prompt in `src/pages/WelcomePage/index.tsx` — after `restoreSession()` returns a `LocalFileProvider` with `permissionState !== 'granted'`, show "Resume editing – click to re-grant file access" button; on click, call `provider.requestPermission()` (which calls `fileHandle.requestPermission({ mode: 'readwrite' })`); on success set provider active; on denial clear session and return to welcome screen
- [x] T031 [P] Add Drive file list empty state to `src/pages/WelcomePage/index.tsx` — when `GoogleDriveProvider.initOpen()` returns an empty file list, show "No plans found in your Google Drive app folder. Create a new plan instead." with a "New Plan" button
- [x] T032 [P] Add save failure retry UX to `src/components/SaveStatusIndicator/index.tsx` — when `saveStatus === 'error'`, render "Save failed – click to retry" as a clickable MUI Chip; `onClick` calls `triggerManualSave()`; show `lastError.reason` as secondary text for diagnostics
- [x] T033 Retire localStorage plan functions from `src/util/storage.ts` — remove `setPlannerData()` and `getPlannerData()` exports; retain `isTourTaken()`, `setTourTaken()`, `isDisclaimerAccepted()`, `setDisclaimerAccepted()`; find and remove any remaining import of `setPlannerData`/`getPlannerData` across the codebase (check `src/pages/Home/index.tsx`, `src/store/plannerDataReducer.ts`)
- [x] T034 [P] Implement pagehide session cleanup in `src/util/storage/sessionPersistence.ts` — inside `registerPagehideCleanup(onClose)`, register `window.addEventListener('pagehide', () => { onClose(); })` where `onClose` deletes the `'localFileHandle'` IndexedDB key (via `idb-keyval del`) and removes `'gdriveSession'` from `sessionStorage`; call `registerPagehideCleanup` from each provider's constructor

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T003 and T004 are parallel
- **Foundational (Phase 2)**: Depends on Setup completion; T006–T009 are parallel after T005; T010 depends on T005–T009
- **Phase 3 (US1–3)**: Depends on Phase 2 completion; T011–T012 are parallel; T013 depends on T011–T012; T014–T015 depend on T010; T016–T019 are parallel; T020 depends on T013–T015
- **Phase 4 (US4–5)**: Depends on Phase 3 completion (provider.save() must exist); T021 is independent; T023 is parallel; T022 depends on T021; T024 depends on T022; T025–T026 are parallel
- **Phase 5 (US6)**: Depends on T021 (`triggerManualSave`); T027 and T028 are parallel
- **Final Phase**: All parallel except T033 (must run after T022 is complete); T034 can start after T006

### User Story Dependencies

- **US1 (Welcome Screen)**: Depends on Foundational (Phase 2) — no dependency on other user stories
- **US2 (New Plan)**: Depends on US1 (welcome screen exists to trigger it)
- **US3 (Open Plan)**: Depends on US1 — parallel with US2
- **US4 (Local Autosave)**: Depends on US2/US3 (provider must be initialized); requires `LocalFileProvider.save()` (T024)
- **US5 (Drive Autosave)**: Depends on US2/US3; requires `GoogleDriveProvider.save()` (T025–T026); parallel with US4
- **US6 (Manual Save)**: Depends on US4/US5 (requires `triggerManualSave` from `useAutosave`)

### Within Each Phase

- Storage type definitions (T005) before provider implementations
- Provider implementations before context (T007–T008 before T010)
- Context before welcome screen UI (T010 before T013)
- Provider `initNew`/`initOpen` methods (T016–T019) before context wires them (T015)
- `useAutosave` hook (T021) before Home.tsx refactor (T022)

### Parallel Opportunities

- T003 + T004 (Phase 1): Both setup tasks — different files
- T006 + T007 + T008 (Phase 2): All three provider/persistence files — no dependencies between them
- T011 + T012 (Phase 3): Two new component files — no dependencies
- T016 + T017 + T018 + T019 (Phase 3): Four provider methods — no dependencies between them
- T023 + T024 (Phase 4): Different files
- T025 + T026 (Phase 4): Both in googleDriveProvider.ts — sequential (T026 implements ensureToken used by T025)
- T027 + T028 (Phase 5): Both in Home.tsx — coordinate on same file
- T029 + T030 + T031 + T032 + T034 (Final Phase): All different files — fully parallel

---

## Parallel Example: Phase 3 (US1–3)

```text
# Start in parallel after Phase 2 completes:
Task T011: Create StorageProviderPicker dialog component
Task T012: Create WelcomeCard component

# After T011 + T012 finish:
Task T013: Create WelcomePage (depends on T011, T012)

# Start in parallel alongside T013:
Task T016: LocalFileProvider.initNew()
Task T017: LocalFileProvider.initOpen()
Task T018: GoogleDriveProvider.initNew()
Task T019: GoogleDriveProvider.initOpen()

# After T013 + T016–T019 finish:
Task T014: Wire initProvider 'new' flow in context
Task T015: Wire initProvider 'open' flow in context
Task T020: Update App.tsx routing
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T010) ← CRITICAL BLOCKER
3. Complete Phase 3: US1 + US2 + US3 (T011–T020)
4. **STOP and VALIDATE**: Open app → welcome screen → create/open plan → planner loads
5. Demo / share — users can create and open plans from Local Computer and Google Drive

### Incremental Delivery

1. Setup + Foundational → storage layer exists
2. US1 + US2 + US3 → welcome screen, new/open flows work (MVP!)
3. US4 + US5 → autosave enabled (no more manual saves for common case)
4. US6 → manual save safety net added
5. Final Phase → edge cases polished, localStorage retired

### Total Task Count

| Phase | Tasks | Parallel Opportunities |
|---|---|---|
| Phase 1: Setup | 4 | 2 (T003, T004) |
| Phase 2: Foundational | 6 | 3 (T006, T007, T008) |
| Phase 3: US1 + US2 + US3 | 10 | 6 (T011, T012, T016, T017, T018, T019) |
| Phase 4: US4 + US5 | 6 | 2 (T023, T024) |
| Phase 5: US6 | 2 | 2 (T027, T028) |
| Final Phase | 6 | 5 (T029–T032, T034) |
| **Total** | **34** | **20** |

---

## Notes

- [P] tasks = different files, no blocking dependencies between them
- [Story] label maps each task to a specific user story for traceability
- T005 (`storageProvider.ts`) is the most critical single task — everything else depends on it
- Commit after each phase or logical group; each Phase 3 user story checkpoint is a demo-able increment
- The `VITE_GOOGLE_CLIENT_ID` env var must be set before testing Drive flows
- FSAA picker calls (`showSaveFilePicker`, `showOpenFilePicker`, `requestPermission`) MUST always originate from a button `onClick` — never from `useEffect` or timers
