# Tasks: Export Financial Plan as PDF

**Input**: Design documents from `/specs/010-export-plan-pdf/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not requested in spec. No test tasks included unless noted.

**Organization**: Tasks grouped by user story for independent implementation and delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and establish new file structure. No user story work depends on being done here beyond dependency installation.

- [x] T001 Install `jspdf` and `html2canvas` packages via `npm install jspdf html2canvas` and commit updated `package.json` and `package-lock.json`
- [x] T002 [P] Create empty file stubs: `src/pages/Planner/components/ExportButton/index.tsx`, `src/pages/Planner/components/PrintableReport/index.tsx`, `src/pages/Planner/hooks/usePdfExport.ts`

**Checkpoint**: Dependencies installed, new files exist (even if empty). Build passes (`npm run build`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared by all user stories — the hidden print layout, its CSS, and the prop wiring in Planner/Home. Must be complete before any story-specific work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add `@media print` CSS rules to `src/index.css`: hide `#root` during print, show `.printable-report`, set `@page { margin: 1cm; size: A4 portrait; }`, define `.print-page-break { page-break-before: always; }`, and default `display: none` for `.printable-report` on screen
- [x] T004 Add optional `printRef?: React.RefObject<HTMLDivElement>` prop to `PlannerProps` type in `src/pages/Planner/index.tsx` and render `<div ref={printRef} className="printable-report" />` placeholder at the bottom of the component (outside the main Grid, before the closing fragment)
- [x] T005 In `src/pages/Home/index.tsx`: create `printRef = useRef<HTMLDivElement>(null)` and pass it to `<Planner>` as the `printRef` prop

**Checkpoint**: App still builds and renders correctly. The `.printable-report` div is in the DOM (invisible). Opening browser print preview shows a blank page (no interactive content visible yet — that comes in US1/US2).

---

## Phase 3: User Story 1 — Export Full Financial Plan to PDF (Priority: P1) 🎯 MVP

**Goal**: User can click "Export" → "Download PDF" and receive a named, downloaded PDF containing all plan sections within 10 seconds.

**Independent Test**: Load a plan with at least one goal, click Export → Download PDF, verify a file named `financial-plan-YYYY-MM-DD.pdf` downloads and opens with all sections visible (goals table, investment allocation table, investment history table, progress table).

### Implementation

- [x] T006 [US1] Implement `PrintableReport` component in `src/pages/Planner/components/PrintableReport/index.tsx`:
  - Accept props: `plannerData: PlannerData`, `selectedDate: string`, `investmentBreakdownBasedOnTermType: InvestmentBreakdownBasedOnTermType[]`, `termTypeWiseProgressData: TermTypeWiseProgressData[]`, `printRef: React.RefObject<HTMLDivElement>`
  - Attach `printRef` to the root `<div className="printable-report">`
  - Render **Report Header**: app title "Goal Based Financial Planner", export date (formatted with dayjs), "As of: {selectedDate}" line
  - Render **Financial Goals** section: heading "Financial Goals", then a simple HTML table — columns: Goal Name | Target Amount | Target Date | Term | Progress %; one row per goal using `goal.getGoalName()`, `goal.getInflationAdjustedTargetAmount()`, `goal.getTargetDate()`, `goal.getTermType()`; show "No financial goals defined yet." paragraph if empty
  - Each section (except header) preceded by `<div className="print-page-break" />`

- [x] T007 [US1] Continue `PrintableReport`: add **Investment Allocation Plan** section — heading "Investment Allocation Plan", then for each term in `investmentBreakdownBasedOnTermType` render a sub-heading (e.g. "Short Term") and a table — columns: Investment Name | Monthly Amount | Expected Return %; show "No investment suggestions for this term." if the term has no data

- [x] T008 [US1] Continue `PrintableReport`: add **Investment History** section — heading "Investment History", a table from `plannerData.investmentLogs` — columns: Date | Investment Type | Amount; show "No investment entries logged yet." if empty

- [x] T009 [US1] Continue `PrintableReport`: add **Term-wise Progress** section — heading "Term-wise Progress Summary", a table from `termTypeWiseProgressData` — columns: Term | Goals Included | Target Amount | Progress %; show "No progress data available." if empty

- [x] T010 [US1] Replace the placeholder `printRef` div in `src/pages/Planner/index.tsx` with the actual `<PrintableReport>` component, passing: `plannerData`, `selectedDate`, `investmentBreakdownBasedOnTermType`, `termTypeWiseProgressData`, and `printRef`; add the import for `PrintableReport`

- [x] T011 [US1] Implement `usePdfExport` hook in `src/pages/Planner/hooks/usePdfExport.ts`:
  - Return type: `{ isExporting: boolean; error: string | null; downloadPdf: (ref: React.RefObject<HTMLDivElement>) => Promise<void>; triggerPrint: () => void }`
  - `downloadPdf`: set `isExporting = true`, dynamically import `html2canvas` and `jspdf` via `Promise.all([import('html2canvas'), import('jspdf')])`, call `html2canvas(ref.current!, { scale: 2, useCORS: true, logging: false })`, compute A4 page dimensions, add canvas image to `jsPDF` instance with multi-page handling (loop: add pages while remaining canvas height exceeds one A4 page), call `doc.save('financial-plan-' + dayjs().format('YYYY-MM-DD') + '.pdf')`, set `isExporting = false`; wrap in try/catch — on error set `error = 'PDF generation failed. Please try again or check your browser settings.'` and `isExporting = false`
  - `triggerPrint`: call `window.print()`
  - Initialize state: `isExporting = false`, `error = null`; clear `error` at start of each `downloadPdf` call

- [x] T012 [US1] Implement `ExportButton` component in `src/pages/Planner/components/ExportButton/index.tsx`:
  - Props: `onDownloadPdf: () => Promise<void>`, `onPrint: () => void`, `isExporting: boolean`, `error: string | null`
  - Render a MUI `Button` labelled "Export" with a `KeyboardArrowDownIcon` (from `@mui/icons-material`) that opens a MUI `Menu` on click
  - Inside the `Menu`, render two `MenuItem`s: "Download PDF" (calls `onDownloadPdf`) and "Print" (calls `onPrint`, closes menu)
  - When `isExporting` is true: disable the button and replace its label with a `CircularProgress` spinner (`size={16}`) inline with "Exporting…" text
  - When `error` is non-null: render a MUI `Alert severity="error"` below the button showing `error`

- [x] T013 [US1] Wire up `ExportButton` in `src/pages/Home/index.tsx`:
  - Call `usePdfExport()` to get `{ isExporting, error, downloadPdf, triggerPrint }`
  - Add `<ExportButton>` to the `saveControls` Box, before the Save button, passing the hook values and `onDownloadPdf={() => downloadPdf(printRef)}`, `onPrint={triggerPrint}`
  - Add imports for `ExportButton` and `usePdfExport`

**Checkpoint**: "Export → Download PDF" produces a downloaded `financial-plan-<date>.pdf`. PDF opens and shows all four content sections. Button shows spinner during generation and returns to normal state on completion.

---

## Phase 4: User Story 2 — Print Financial Plan Directly (Priority: P2)

**Goal**: User can click "Export" → "Print" to open the browser print dialog showing a clean, interactive-element-free layout of the full plan.

**Independent Test**: Click Export → Print, verify the browser print dialog opens and the print preview shows only plan content (no nav, no buttons, no form inputs) with all four sections present and readable.

### Implementation

- [x] T014 [US2] Refine `@media print` CSS in `src/index.css` to ensure all interactive MUI elements are hidden:
  - Target: `header`, `nav`, `[role="navigation"]`, `button`, `.MuiDrawer-root`, `.MuiModal-root`, `.MuiTab-root`, `[data-testid="page-tour"]` — set `display: none !important`
  - Target `.printable-report` — set `display: block !important` and `width: 100%`
  - Add `* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }` to preserve background colours

- [x] T015 [US2] Verify `triggerPrint` in `usePdfExport` calls `window.print()` (already implemented in T011). Manually test: open print preview and confirm no interactive Chrome UI is visible. If any MUI component bleeds through, add its CSS selector to the rules added in T014.

- [x] T016 [US2] Add a print-specific heading row to `PrintableReport` (visible only during `@media print`) via inline style or a dedicated CSS class `print-only` (`display: none` on screen, `display: block` in print). This heading should show "Financial Plan Report — Printed {date}" as a page header across all printed pages.

**Checkpoint**: Print dialog opens cleanly. Print preview shows only report content. Selecting "Save as PDF" in the print dialog produces a readable document with all four sections and proper page breaks.

---

## Phase 5: User Story 3 — Export Reflects Current Plan State (Priority: P3)

**Goal**: The exported PDF and print output always reflect the latest in-memory plan data — including any goals added or investment entries logged since the plan was last saved.

**Independent Test**: Add a new goal in the planner UI without saving, immediately click Export → Download PDF, verify the new goal appears in the downloaded PDF.

### Implementation

- [x] T017 [US3] Verify that `PrintableReport` in `src/pages/Planner/index.tsx` receives `plannerData` directly from the `Planner` component's props (not from storage or a cached snapshot). Because React re-renders `PrintableReport` on every `plannerData` change, the data is always current. Confirm this by reading the component tree in `src/pages/Planner/index.tsx` — `plannerData` prop flows from `Home` → `Planner` → `PrintableReport` without any caching layer.

- [x] T018 [US3] Confirm `investmentBreakdownBasedOnTermType` and `termTypeWiseProgressData` passed to `PrintableReport` are the same `useMemo`-derived values used by the interactive Planner (not recomputed separately). These are already computed in `src/pages/Planner/index.tsx`'s existing `useMemo` calls. Pass them directly to `<PrintableReport>` (already done in T010 — verify no duplication or stale reference).

**Checkpoint**: Modify a goal → immediately export → verify exported PDF reflects the modification. No save required between edit and export.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, UX refinements, and cross-browser verification.

- [x] T019 [P] Handle the empty-plan edge case in `PrintableReport` (`src/pages/Planner/components/PrintableReport/index.tsx`): when `plannerData.financialGoals` is empty, render a top-level "No financial goals have been defined yet." notice instead of empty tables (already specified in T006 per section — confirm all four sections show their individual empty-state messages correctly, not blank space)

- [x] T020 [P] Add multi-page PDF canvas splitting logic in `usePdfExport.ts` (`src/pages/Planner/hooks/usePdfExport.ts`): implement the `addCanvasToMultiPagePdf` helper that iterates over the canvas height in A4-page-height increments, calls `doc.addPage()` between pages, and uses `doc.addImage` with a negative Y offset to show the correct slice of the canvas per page

- [x] T021 [P] Verify Export button placement does not break the existing mobile layout in `src/pages/Home/index.tsx`: on screens `sm` and below, check that the `saveControls` Box does not overflow; if needed, hide the Export button label and show only a compact icon button on mobile (using `isMobile` already available in `Home`)

- [x] T022 [P] Run `npm run build` and confirm no TypeScript errors introduced by new files; run `npm run lint` and fix any ESLint violations in the four new/modified files

- [x] T023 Run the manual test steps from `specs/010-export-plan-pdf/quickstart.md`: verify all 6 steps pass (normal export, empty plan export, error simulation) in Chrome; spot-check in Firefox and Safari

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 complete — **BLOCKS all user stories**
- **Phase 3 (US1 — P1)**: Requires Phase 2 complete
- **Phase 4 (US2 — P2)**: Requires Phase 2 complete; can begin after Phase 3 (shares ExportButton already built in T012)
- **Phase 5 (US3 — P3)**: Requires Phase 3 complete (verifies data flow established by US1)
- **Phase 6 (Polish)**: Requires all story phases complete

### User Story Dependencies

- **US1 (P1)**: Only depends on Phase 2. No dependency on US2 or US3.
- **US2 (P2)**: Only depends on Phase 2. Shares `ExportButton` and `usePdfExport` built in US1, but can be worked in parallel after Phase 2 if ExportButton exists.
- **US3 (P3)**: Depends on US1 (the PrintableReport and data wiring it verifies must exist).

### Within Each User Story

- T006–T009 (PrintableReport sections) can run in parallel — all different files/sections within the same component
- T010 depends on T006–T009 (component must exist before rendering it)
- T011 is independent of T006–T010 (hook is a separate file)
- T012 is independent (separate component file)
- T013 depends on T011 and T012 (wires both together)

### Parallel Opportunities

- T001 and T002 in Phase 1 can run in parallel
- T003, T004, T005 in Phase 2 can run in parallel
- T006, T007, T008, T009 (all PrintableReport section implementations) can run in parallel
- T011 (usePdfExport hook) and T012 (ExportButton) can run in parallel with T006–T009
- T019, T020, T021, T022 in Phase 6 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# These can all start simultaneously after Phase 2:
Task T006: "Implement PrintableReport header + Goals section"
Task T007: "Implement PrintableReport Investment Allocation section"
Task T008: "Implement PrintableReport Investment History section"
Task T009: "Implement PrintableReport Progress section"
Task T011: "Implement usePdfExport hook"
Task T012: "Implement ExportButton component"

# These follow after the above complete:
Task T010: "Wire PrintableReport into Planner"  (depends on T006-T009)
Task T013: "Wire ExportButton into Home"        (depends on T011, T012)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T005)
3. Complete Phase 3: User Story 1 (T006–T013)
4. **STOP and VALIDATE**: Open app, export a plan, verify downloaded PDF contains all sections
5. Ship US1 — users can now download their financial plan as a PDF

### Incremental Delivery

1. Setup + Foundational → foundation ready (no visible change to users)
2. US1 → "Download PDF" works → **MVP** ✓
3. US2 → "Print" action works with clean print preview ✓
4. US3 → verify current-state accuracy (validation only, minimal code) ✓
5. Polish → edge cases, mobile layout, cross-browser ✓

---

## Notes

- [P] tasks = different files, no dependency on incomplete tasks in the same phase
- No test tasks generated (not requested in spec)
- `PrintableReport` is always rendered in the DOM but CSS-hidden — this is intentional; do not conditionally mount it
- `usePdfExport` uses dynamic `import()` for jsPDF and html2canvas — this is critical for bundle size; do NOT convert to static top-level imports
- Commit after each phase checkpoint at minimum
- `npm run build` must pass before considering any task complete
