# Research: Export Financial Plan as PDF

**Feature**: 010-export-plan-pdf  
**Date**: 2026-04-12

---

## Decision 1: PDF Generation Approach

**Decision**: Use `jsPDF` + `html2canvas` for programmatic "Download PDF"; use `window.print()` with `@media print` CSS for the "Print" dialog action.

**Rationale**:
- The spec requires two distinct outputs: a downloaded file (FR-005) and a print dialog (FR-003). These are best served by two complementary mechanisms.
- `jsPDF + html2canvas` (combined ~100KB brotli) is the most widely deployed client-side PDF generation approach in the React ecosystem. It renders a target DOM node to a canvas bitmap, then embeds it in a PDF.
- `window.print()` is zero-dependency, reliable across all browsers, and naturally handles pagination and OS print settings.
- Server-side PDF generation (Puppeteer, WeasyPrint) was ruled out: the app is fully client-side with no backend.
- `@react-pdf/renderer` was ruled out: it requires an entirely separate JSX render tree replicating all content — disproportionate effort for this feature.
- `html2pdf.js` (a convenience wrapper) was ruled out in favour of direct `jsPDF + html2canvas` because it is less actively maintained and adds less flexibility for multi-page layout tuning.

**Alternatives considered**:
- `react-to-print`: Covers only the Print action (window.print), not the download. Insufficient alone.
- `@react-pdf/renderer`: High fidelity PDFs but requires complete layout duplication.
- Print-only approach (advise user to "Save as PDF" from dialog): Doesn't satisfy FR-005 (deterministic file name, direct download).

---

## Decision 2: Chart / Visual Handling in Export

**Decision**: Render **data tables** (not chart images) in the print/export view to represent allocation and progress data. Do not attempt to capture MUI X Charts SVG output as images.

**Rationale**:
- MUI X Charts renders SVGs inside a React subtree. `html2canvas` has partial SVG support but frequently produces blank or misaligned output for complex charts with foreignObject elements.
- Data tables (allocation percentages, amounts, goal progress) are more readable in a PDF than screenshot-quality chart images, and they are fully accessible and searchable.
- The print view is a purpose-built `PrintableReport` component (see Decision 3) — it renders its own simplified data representation, not a pixel-capture of the interactive UI.
- If charts are desired in a future iteration, the SVG elements can be serialized to PNG via `canvg` or captured individually using `html2canvas` with explicit `scale` settings — this is deferred as a follow-on enhancement.

**Alternatives considered**:
- Canvas capture of chart nodes: Brittle, requires explicit `useForeignObjectRendering` in html2canvas, inconsistent across browsers.
- SVG-to-PNG conversion via `canvg`: Additional dependency, setup complexity disproportionate to value for v1.

---

## Decision 3: Print Layout Architecture

**Decision**: Create a dedicated `PrintableReport` component that is always rendered in the DOM but hidden from screen view (`display: none` normally, `display: block` during print/export). It receives PlannerData as props and renders a simplified, linear, print-optimised layout.

**Rationale**:
- The interactive Planner page layout (responsive MUI Grid, tabs, modals, drawers) does not translate to print — it produces awkward column breaks and hidden tab content.
- A dedicated `PrintableReport` with no interactive elements, fixed single-column layout, and explicit page-break hints produces a reliable, readable output across all browsers.
- The component is always mounted (so `html2canvas` can target it without triggering React renders during export) but visually hidden. During print (`@media print`), the interactive Planner hides and PrintableReport shows.
- This separation keeps the print concern isolated from the interactive UI components (Constitution Principle II: Feature Co-location).

**Alternatives considered**:
- Capturing the live interactive Planner DOM: Produces inconsistent output (tabs hide content, responsive breakpoints differ, interactive elements appear).
- Rendering `PrintableReport` only on demand (mount on export trigger): Introduces a render cycle before capture — adds latency and flicker risk.

---

## Decision 4: Export Button Placement and Loading UX

**Decision**: Add `ExportButton` to the existing `headerRight` slot in `Planner`, passed from `Home/index.tsx` alongside the Save/Close Plan controls. The button opens a MUI `Menu` dropdown with "Download PDF" and "Print" items. During PDF generation, the button is disabled and shows a `CircularProgress` spinner (replaces the icon).

**Rationale**:
- The `headerRight` prop in `Planner` already exists for right-side header controls (currently holds Save + Close Plan buttons). This is the correct extension point — no new layout work needed.
- MUI `Menu` + `MenuItem` is already used elsewhere in the codebase for similar dropdown patterns. No new UI dependencies required.
- Spinner-on-button (not overlay, not toast) was selected per the clarified answer in the `/speckit.clarify` session. It prevents double-trigger and gives clear visual feedback without blocking the rest of the UI.

**Alternatives considered**:
- Separate toolbar section: More layout work, no functional benefit.
- Floating action button: Non-standard for export actions in financial apps.

---

## Decision 5: New Dependencies

**Dependencies to add**:
- `jspdf` (~65KB brotli, widely used, MIT licence)
- `html2canvas` (~35KB brotli, widely used, MIT licence)

**Rationale**: Both are best-in-class for their roles. No viable pure-CSS or no-dependency alternative exists for producing a downloadable, named PDF file from a DOM node in a browser environment.

**Risk**: `html2canvas` can occasionally mis-render complex CSS (especially `backdrop-filter`, CSS variables, or `position: fixed` elements). The `PrintableReport` component mitigates this by using simple, predictable CSS (standard block layout, no fixed positioning, no filters).

---

## Decision 6: File Naming

**Decision**: File name format: `financial-plan-YYYY-MM-DD.pdf` (e.g., `financial-plan-2026-04-12.pdf`). `dayjs` (already a project dependency) is used to format the date.

**Rationale**: Deterministic, human-readable, time-stamped. Avoids collisions for users who export multiple times. Consistent with FR-005.
