# Quickstart: Export Financial Plan as PDF

**Feature**: 010-export-plan-pdf  
**Date**: 2026-04-12

---

## What was built

An "Export" dropdown button in the Planner header that offers two actions:
- **Download PDF** — generates and downloads `financial-plan-YYYY-MM-DD.pdf` directly
- **Print** — opens the browser print dialog with a clean, interactive-element-free layout

---

## Key files

| File | Role |
|------|------|
| `src/pages/Planner/components/ExportButton/index.tsx` | Dropdown button UI (Export → Download PDF / Print) |
| `src/pages/Planner/components/PrintableReport/index.tsx` | Hidden-from-screen print layout, all plan sections |
| `src/pages/Planner/hooks/usePdfExport.ts` | PDF generation logic (html2canvas + jsPDF) |
| `src/index.css` | `@media print` rules hiding interactive UI, showing report |
| `src/pages/Home/index.tsx` | Passes ExportButton into Planner's `headerRight` slot |
| `src/pages/Planner/index.tsx` | Renders PrintableReport (hidden), passes ref to Home |

---

## How to test manually

1. Run `npm start` and open the planner with at least one goal.
2. Click the **Export** button in the top-right header area.
3. **Download PDF**: Select "Download PDF" — button shows spinner, then a file `financial-plan-<today>.pdf` downloads.
4. **Print**: Select "Print" — browser print dialog opens; print preview shows only the plan with no buttons or nav.
5. **Empty plan edge case**: Remove all goals via the plan, then export — PDF should show a "No goals defined" placeholder.
6. **Error simulation**: Use DevTools → Network → Block `blob:` URLs, attempt Download PDF — an error message should appear near the export button.

---

## Dependencies added

```bash
npm install jspdf html2canvas
```

- `jspdf` — PDF document generation
- `html2canvas` — DOM-to-canvas rendering

---

## Print CSS approach

`@media print` in `src/index.css`:
- Hides: `#root > * > *` (all interactive Planner content)
- Shows: `.printable-report` (the `PrintableReport` component)
- Sets: `@page { margin: 1cm; size: A4 portrait; }`
- Applies page breaks between major report sections via `.print-page-break { page-break-before: always; }`

---

## Architecture notes (Constitution alignment)

| Principle | How honoured |
|-----------|-------------|
| I. Clear Layering | PDF generation logic is in `usePdfExport` hook, not in the component |
| II. Feature Co-location | `ExportButton` and `PrintableReport` live under `src/pages/Planner/components/` |
| III. Upgrade-Friendly | `jsPDF` + `html2canvas` calls are isolated inside `usePdfExport` — swappable without touching components |
| IV. Type Safety | All new props/hooks fully typed; no `any` |
| V. Predictable Change | Unit test for `usePdfExport` covering success and error paths |
