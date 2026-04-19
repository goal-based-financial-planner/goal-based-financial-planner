# Data Model: Export Financial Plan as PDF

**Feature**: 010-export-plan-pdf  
**Date**: 2026-04-12

---

## Overview

This feature introduces no new persistent data entities. The export is a read-only, in-memory snapshot derived entirely from the existing `PlannerData` domain model. The entities below describe the **shape of data flowing into the export** — not new storage or database changes.

---

## Existing Entities Used by Export

### PlannerData (existing, read-only for export)

The root data object passed to `PrintableReport` for export. All fields are read-only during export.

| Field | Type | Description |
|-------|------|-------------|
| `financialGoals` | `FinancialGoal[]` | All user-defined goals (one-time and recurring) |
| `investmentAllocations` | `InvestmentAllocationsType` | Per-term investment allocation percentages |
| `investmentLogs` | `SIPEntry[]` | All recorded investment log entries |

---

### FinancialGoal (existing, read-only for export)

Represents a single financial goal. Accessed via its public methods during export.

| Method/Field | Return Type | Used In Export For |
|---|---|---|
| `getGoalName()` | `string` | Goal name heading |
| `getInflationAdjustedTargetAmount()` | `number` | Target amount column |
| `getTargetDate()` | `string` (ISO date) | Timeline column |
| `getTermType()` | `TermType` | Grouping by Short / Medium / Long term |
| `goalType` | `GoalType` | Distinguishes recurring vs one-time goals |

---

### InvestmentAllocationsType (existing, read-only for export)

A record keyed by `TermType` mapping to an array of allocation entries (instrument name + percentage).

Used in export to render the allocation breakdown table per term.

---

### SIPEntry (existing, read-only for export)

A single logged investment entry.

| Field | Type | Used In Export For |
|---|---|---|
| `date` | `string` | Log date column |
| `amount` | `number` | Amount column |
| `investmentName` | `string` | Investment type column |

---

## New Transient Entities (in-memory only, not persisted)

### ExportState

Transient state managed by the `usePdfExport` hook. Not persisted anywhere.

| Field | Type | Description |
|---|---|---|
| `isExporting` | `boolean` | True while PDF generation is in progress — used to disable button and show spinner |
| `error` | `string \| null` | Error message if generation fails; null on success or idle |

### PrintableReportProps

The props contract for the `PrintableReport` component. Defines the data surface for the print/export layout.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `plannerData` | `PlannerData` | Yes | Full plan data at time of export |
| `selectedDate` | `string` | Yes | The "as of" date selected in the planner UI |
| `investmentBreakdownBasedOnTermType` | `InvestmentBreakdownBasedOnTermType[]` | Yes | Pre-computed investment suggestions per term |
| `termTypeWiseProgressData` | `TermTypeWiseProgressData[]` | Yes | Pre-computed progress percentages per term |
| `printRef` | `React.RefObject<HTMLDivElement>` | Yes | Ref used by `usePdfExport` to target the DOM node |

---

## State Transitions

The export flow is a simple linear state machine with no branching persistence:

```
idle → exporting → idle (success, file downloaded)
idle → exporting → error (file download blocked / generation failed)
error → exporting (user retries by clicking again)
```

No goal data is modified during export. The plan remains in the same state before and after export.
