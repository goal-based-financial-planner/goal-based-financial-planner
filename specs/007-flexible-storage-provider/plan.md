# Implementation Plan: Flexible Storage Provider

**Branch**: `007-flexible-storage-provider` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/007-flexible-storage-provider/spec.md`

---

## Summary

Replace the implicit localStorage autosave with a user-selectable storage system. On every new browser session, a welcome screen offers "New Plan" and "Open Plan", each leading to a storage provider picker (Local Computer or Google Drive). The Local Computer provider uses the browser File System Access API (FSAA) with a fallback to `<input>`/download for Firefox and Safari. The Google Drive provider uses Google Identity Services (GIS) with `drive.appdata` scope (app-specific folder, no access to user's other files). Autosave is debounced at 2 seconds via a `useAutosave` hook. A common `StorageProvider` interface decouples the UI from any specific backend.

---

## Technical Context

**Language/Version**: TypeScript 4.x, React 19.2.4, Vite 8.0.0
**Primary Dependencies**: @mui/material v6, react-hook-form, dayjs, `idb-keyval` (new — ~300B brotli), Google Identity Services (CDN script)
**Storage**: File System Access API + IndexedDB (local); Google Drive REST API + appDataFolder scope (cloud); sessionStorage (Drive file ID only)
**Testing**: Vitest 3.0.0, @testing-library/react 16.0.1
**Target Platform**: Browser — Chrome/Edge (full FSAA support); Firefox/Safari (FSAA fallback to input/download; Google Drive fully supported)
**Project Type**: React SPA frontend (no backend)
**Performance Goals**: Autosave completes within 4 seconds of last change (2s debounce + ≤2s write); welcome screen → working plan in under 60 seconds
**Constraints**: No backend; HTTPS required for FSAA in production (localhost exempt); FSAA unavailable in Firefox/Safari; single plan open per tab
**Scale/Scope**: Single-user, single plan per tab; Drive API quota (12k req/min) never approached by this use case

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Clear Layering (Domain → State → UI) ✅

- Storage providers (`LocalFileProvider`, `GoogleDriveProvider`) live in `src/util/storage/` — thin adapters behind the `StorageProvider` interface. No business logic in the storage layer.
- The `useAutosave` hook lives in `src/hooks/` — side-effect isolation at the hook boundary.
- `WelcomePage` and `StorageProviderPicker` components are purely presentational: they call `context.initProvider()` and render status — no storage logic embedded.
- The existing `plannerDataReducer` and `PlannerData` domain model are untouched.

### II. Feature Co-location + Stable Shared Surface ✅

- `WelcomePage` is colocated under `src/pages/WelcomePage/`.
- `StorageProviderPicker` is a reusable dialog placed in `src/components/StorageProviderPicker/` — it is used by both `WelcomePage` and in-app "New"/"Open" triggers.
- `StorageProviderContext` is in `src/context/` — a shared, stable surface consumed by any component needing save status.

### III. Upgrade-Friendly Boundaries ✅

- `LocalFileProvider` and `GoogleDriveProvider` both implement the `StorageProvider` interface. Adding a third provider (e.g., Dropbox) requires no changes to the UI or autosave hook.
- GIS library is loaded via CDN `<script>` tag — not bundled; a future switch to a different auth library requires only changes inside `GoogleDriveProvider`.
- `idb-keyval` is wrapped inside `src/util/storage/sessionPersistence.ts` — replacing it requires changes in one file only.

### IV. Type Safety and Explicit Contracts ✅

- `StorageProvider` interface is the explicit typed contract between layers.
- `StorageSaveError` and `StorageLoadError` are typed error classes — no stringly-typed error handling.
- `@types/wicg-file-system-access` provides full typing for FSAA; `skipLibCheck: true` resolves the known lib.dom.d.ts conflict.
- No `any` introduced.

### V. Predictable Change (Tests Where It Counts) ✅

- `useAutosave` hook MUST have unit tests covering: debounce timing, all four status transitions, error retry, and `beforeunload` registration.
- `LocalFileProvider` MUST have unit tests with mocked `FileSystemFileHandle`.
- `GoogleDriveProvider` MUST have unit tests with mocked `fetch`.
- `StorageProviderContext` MUST have integration tests covering provider init, restore, and clear flows.

**No constitution violations. No Complexity Tracking table needed.**

---

## Project Structure

### Documentation (this feature)

```text
specs/007-flexible-storage-provider/
├── plan.md              ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── storage-provider-interface.md
├── checklists/
│   └── requirements.md
└── tasks.md             ← created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   └── StorageProviderPicker/         ← NEW: shared dialog (Local Computer | Google Drive)
│       ├── index.tsx
│       └── StorageProviderPicker.test.tsx
│
├── context/
│   └── StorageProviderContext.tsx     ← NEW: active provider + save status context
│
├── hooks/
│   └── useAutosave.ts                 ← NEW: debounced autosave + SaveStatus lifecycle
│   └── useAutosave.test.ts            ← NEW
│
├── pages/
│   ├── WelcomePage/                   ← NEW: welcome screen (New Plan / Open Plan)
│   │   ├── index.tsx
│   │   └── components/
│   │       └── WelcomeCard/
│   │           └── index.tsx
│   └── Home/
│       └── index.tsx                  ← MODIFIED: remove direct localStorage autosave;
│                                         consume StorageProviderContext instead
│
└── util/
    ├── storage.ts                     ← MODIFIED: remove setPlannerData/getPlannerData;
    │                                     retain isTourTaken / disclaimerAccepted flags
    └── storage/                       ← NEW: storage provider implementations
        ├── index.ts                   ← re-exports public types + classes
        ├── storageProvider.ts         ← StorageProvider interface, SaveStatus, error types
        ├── localFileProvider.ts       ← FSAA implementation + fallback
        ├── googleDriveProvider.ts     ← Drive REST + GIS token model
        └── sessionPersistence.ts     ← idb-keyval wrappers, sessionStorage helpers,
                                          pagehide listener
```

**Structure Decision**: Single-project web app layout (Option 1 variant). The project has no backend. All new code lives inside `src/` following the existing domain/pages/components/util/hooks/context conventions. No new top-level directories are introduced.

---

## Implementation Phases

### Phase 1 — Storage Layer Foundation

**Goal**: Introduce the `StorageProvider` interface, typed errors, and both provider implementations. No UI changes yet. `useAutosave` hook replaces the `useEffect` in `Home/index.tsx`.

**Deliverables**:
1. `src/util/storage/storageProvider.ts` — interface + types + error classes
2. `src/util/storage/sessionPersistence.ts` — IndexedDB + sessionStorage helpers + `pagehide` cleanup
3. `src/util/storage/localFileProvider.ts` — FSAA implementation with fallback detection
4. `src/util/storage/googleDriveProvider.ts` — GIS token model + Drive REST API calls
5. `src/util/storage/index.ts` — public exports
6. `src/hooks/useAutosave.ts` — debounced autosave, SaveStatus state machine, `beforeunload` guard
7. Tests for all of the above

**Exit criteria**: All new files have passing tests; the storage layer can save and load a `PlannerData` object for both providers in isolation (not wired to UI yet).

---

### Phase 2 — Context + Welcome Screen

**Goal**: Wire the storage layer into React. Introduce `StorageProviderContext` and the `WelcomePage`. Refactor `Home/index.tsx` to consume the context.

**Deliverables**:
1. `src/context/StorageProviderContext.tsx` — holds active provider, exposes `initProvider` / `clearProvider`, session restore on mount
2. `src/components/StorageProviderPicker/index.tsx` — reusable dialog for selecting Local Computer or Google Drive
3. `src/pages/WelcomePage/index.tsx` — welcome screen with "New Plan" / "Open Plan" flows; shows `StorageProviderPicker` on each button click
4. `App.tsx` modifications — conditionally render `WelcomePage` vs. the existing app shell based on `provider !== null`
5. Refactor `src/pages/Home/index.tsx` — remove direct `useEffect` localStorage autosave; consume `StorageProviderContext` for save status display
6. Refactor `src/util/storage.ts` — remove `setPlannerData` / `getPlannerData`; keep tour/disclaimer flags
7. Tests for context and welcome screen flows

**Exit criteria**: Full user journey works end-to-end in Chrome — open app → welcome screen → New Plan (local or Drive) → planner loads → edits autosave → refresh restores session without welcome screen.

---

### Phase 3 — Polish + Edge Cases

**Goal**: Handle all edge cases defined in the spec.

**Deliverables**:
1. Fallback mode UI — banner in `WelcomePage` + `StorageProviderPicker` when FSAA is unavailable
2. Permission re-grant flow — "Resume editing" prompt for `LocalFileProvider` after page refresh
3. Offline queue indicator — `SaveStatus` 'offline-queued' state for Google Drive; flush on `navigator.onLine` event
4. Save failure UX — "Save failed – click to retry" in status indicator; retry on next edit
5. Token expiry handling — silent re-auth flow in `GoogleDriveProvider`; prompt user if silent re-auth fails
6. Unsaved changes guard — `beforeunload` dialog when `saveStatus === 'saving'`
7. Tab-close cleanup — `pagehide` handler deletes IndexedDB handle; clears Drive sessionStorage

**Exit criteria**: All edge cases in spec section tested; app behaves correctly across Chrome (full), Firefox/Safari (fallback), and simulated offline conditions.

---

## Key Design Decisions (Summary)

| Decision | Choice | Rationale |
|---|---|---|
| Local file API | File System Access API (`showSaveFilePicker` / `showOpenFilePicker`) | User gets a real, portable file in their chosen location |
| Handle persistence | IndexedDB via `idb-keyval` | Only storage that accepts `FileSystemFileHandle` (structured-cloneable, not JSON-serializable) |
| Unsupported browsers | `<input type="file">` + download blob fallback | Keeps Local Computer option functional; autosave not available in fallback mode |
| Drive auth | GIS Token Model (`drive.appdata` scope) | No backend required; minimum-privilege scope; non-sensitive (no consent screen review) |
| Token storage | JS memory only | Access tokens are short-lived; persisting to sessionStorage adds XSS surface with no benefit |
| Drive file location | `appDataFolder` (hidden, app-managed) | User doesn't need to pick a folder; app manages one file per plan; no access to user's other files |
| Autosave trigger | 2-second debounce (`useEffect` + `setTimeout`) | Batches rapid edits; no library needed; standard React pattern |
| Session restore | IndexedDB (local) + sessionStorage (Drive file ID) | Survives page refresh; automatically cleared on tab close (enforced via `pagehide`) |
| localStorage migration | None | Out of scope per user decision (clarification Q5) |
