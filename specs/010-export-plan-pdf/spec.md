# Feature Specification: Export Financial Plan as PDF

**Feature Branch**: `010-export-plan-pdf`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Let's add a feature to export the plan as pdf. Or let it be printed. Choose the best approach based on industry standard. All features of the page should be exportable. Goals, suggestions, current investments etc."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export Full Financial Plan to PDF (Priority: P1)

A user has completed their financial plan and wants to save or share a snapshot of their entire plan — including all goals, investment suggestions, current investment allocations, and progress charts. They click an "Export as PDF" button on the Planner page, and a well-formatted PDF document is generated and downloaded directly to their device, reflecting all the data currently visible in the planner.

**Why this priority**: This is the core value of the feature. A user's financial plan is meaningless if it can't be taken out of the app — shared with a financial advisor, saved for records, or printed for offline review. Everything else in this feature is secondary to getting a complete, readable PDF.

**Independent Test**: Can be fully tested by loading a plan with multiple goals and investment data, clicking the export button, and verifying the downloaded PDF contains all plan sections with correct data.

**Acceptance Scenarios**:

1. **Given** a user has a financial plan with at least one goal and investment data, **When** they click "Export as PDF" on the Planner page, **Then** a PDF file is downloaded to their device within 10 seconds containing all visible plan sections.
2. **Given** a user triggers the export, **When** the PDF is generated, **Then** it includes: all financial goals (with target amounts, timelines, and current progress), investment suggestions (with allocation percentages and recommended instruments), current investment log/history, allocation charts, and termwise progress information.
3. **Given** a user triggers the export, **When** the PDF is downloaded, **Then** the file is named meaningfully (e.g., includes "financial-plan" and the current date) so the user can identify it in their downloads folder.
4. **Given** a user triggers the export, **When** the PDF opens, **Then** all text is legible, tables are properly formatted, and charts/visuals are rendered clearly (not clipped or overlapping).

---

### User Story 2 - Print Financial Plan Directly (Priority: P2)

A user wants to physically print their financial plan or use their browser's built-in "Save as PDF" functionality. They click a "Print" option which opens the browser print dialog with the plan pre-formatted for paper output — no navigation bars, no interactive UI elements, just the clean plan content.

**Why this priority**: Printing is the simplest path for users who already have a PDF printer configured, and it leverages the browser's native, trusted print dialog. It complements direct PDF export as a fallback and for users who prefer this workflow.

**Independent Test**: Can be fully tested by triggering the print action and verifying the print preview shows a clean, complete layout of the plan with all sections present and no UI chrome.

**Acceptance Scenarios**:

1. **Given** a user is on the Planner page, **When** they trigger the Print action, **Then** the browser's print dialog opens showing a print preview of the financial plan.
2. **Given** the print dialog is open, **When** the user reviews the print preview, **Then** it shows only the plan content (no navigation headers, buttons, sidebars, or interactive UI elements) and all sections are present.
3. **Given** the plan is printed or saved as PDF via the print dialog, **Then** the output is readable with proper page breaks between major sections (no content is cut off mid-table or mid-chart).

---

### User Story 3 - Export Reflects Current Plan State (Priority: P3)

A user who has made recent changes to their financial plan (added a goal, logged a new investment, changed a target amount) wants the export to reflect the most up-to-date data without needing to manually save first.

**Why this priority**: Financial plans change frequently. An export that captures stale data is worse than no export — it could mislead users or their advisors. This story ensures the export is always a true snapshot of current state.

**Independent Test**: Can be fully tested by modifying a goal, immediately triggering export, and verifying the exported document shows the updated values.

**Acceptance Scenarios**:

1. **Given** a user adds a new goal and immediately clicks "Export as PDF", **Then** the PDF includes the newly added goal.
2. **Given** a user logs a new investment entry and immediately exports, **Then** the exported document reflects the updated investment totals and progress.

---

### Edge Cases

- What happens when the user has no goals entered yet? The export should still work, producing a document that clearly indicates no goals are defined yet (not an error or blank PDF).
- What happens if the plan contains a very large number of goals (e.g., 20+)? The export should paginate content properly without cutting off goal cards.
- What happens if charts contain no data (e.g., zero investments logged)? The export should show empty/zero-state charts rather than failing.
- What happens if the user's browser blocks file downloads? A clear, friendly error message should appear guiding the user to allow downloads.
- What happens on mobile devices where print dialogs behave differently? Export should still function; the resulting output may vary by device/browser but should not throw an error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Planner page MUST display a single "Export" button in the toolbar/header that opens a dropdown menu containing exactly two options: "Download PDF" and "Print".
- **FR-002**: The exported PDF MUST always include the complete plan — all financial goals (name, target amount, timeline, current progress), investment suggestions (allocation by category and percentage), current investment log and history, investment allocation charts, and termwise progress information. Per-goal or section-level export is out of scope.
- **FR-003**: Users MUST be able to trigger a print action via the "Print" option in the Export dropdown, which opens the native browser print dialog with the plan formatted for print output.
- **FR-004**: The print layout MUST suppress all interactive UI elements (navigation bars, edit buttons, popups, toolbars) so only plan content is visible in the print preview and output.
- **FR-005**: The exported PDF file MUST be named in a way that identifies it as a financial plan export and includes the export date (e.g., "financial-plan-2026-04-12.pdf").
- **FR-006**: Charts and visual elements MUST be rendered in the export output in a static, legible form — not as interactive elements.
- **FR-007**: The export MUST reflect the current in-memory state of the plan at the time of export, including any unsaved edits visible in the UI.
- **FR-008**: Major sections in the export MUST begin on a new page or have clear visual separation to avoid content being split awkwardly across pages.
- **FR-009**: The export feature MUST work without requiring the user to be signed in to any external service (no cloud dependency for basic export).
- **FR-010**: When the export encounters an error (e.g., browser blocks download), the system MUST display a user-friendly error message explaining what went wrong and how to resolve it.
- **FR-011**: While PDF generation is in progress, the Export button MUST be disabled and display a loading spinner; it MUST return to its normal state (enabled, no spinner) once generation completes or fails.

### Key Entities

- **Financial Plan Export**: A static document snapshot of the user's complete plan at a point in time, containing all goals, investments, suggestions, and charts.
- **Financial Goal**: A named savings/investment target with an amount, timeline, and progress status — appears as a card/section in the export.
- **Investment Suggestion**: A recommended allocation of funds across investment categories, shown with percentages and amounts in the export.
- **Investment Log Entry**: A recorded investment transaction contributing to a goal, included in the investment history section of the export.
- **Allocation Chart**: A visual representation (pie or doughnut) of how funds are distributed, rendered as a static image in the export.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can trigger a PDF export and receive a downloaded file within 10 seconds for a typical plan (up to 10 goals with investment history).
- **SC-002**: 100% of visible plan sections (goals, suggestions, investment history, charts) appear in the exported document — no section is silently omitted.
- **SC-003**: The exported PDF is legible when opened at standard zoom (100%) — no text is clipped, overlapping, or unreadably small.
- **SC-004**: The print preview triggered by the Print action shows zero interactive UI elements (buttons, navigation, form fields) — only plan content.
- **SC-005**: Users can complete the export flow (click button → receive file) in under 3 interactions, with no configuration required.
- **SC-006**: The export feature works correctly in the 3 most widely used desktop browsers (Chrome, Firefox, Safari) without degradation.

## Clarifications

### Session 2026-04-12

- Q: Should PDF download and Print be a single combined entry point or two separate controls? → A: Single "Export" button with a dropdown revealing "Download PDF" and "Print" sub-options.
- Q: What does the user see while the PDF is being generated? → A: The Export button is disabled and shows a loading spinner for the duration of generation.
- Q: Should export scope be full plan or allow individual goal export? → A: Full plan only — one export document contains all goals and all sections together.

## Assumptions

- The app currently runs as a single-page application on the Planner page where all relevant data (goals, investments, suggestions, charts) is already rendered in the DOM.
- Users primarily export on desktop; mobile is a secondary use case and output quality may vary by device.
- No server-side rendering or backend processing is required — export is entirely client-side.
- The export does not need to be "live" or interactive — a static snapshot at the moment of export is sufficient and expected.
- Currency formatting and locale settings applied in the UI should carry through to the export.
- The export does not need to include editable fields or form inputs — it is a read-only document.
- Chart images do not need to be regenerated in a special format; capturing the visual as rendered on screen is acceptable.
