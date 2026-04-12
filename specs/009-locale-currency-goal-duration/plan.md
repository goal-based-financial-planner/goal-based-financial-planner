# Implementation Plan: Locale Currency Formatting and Recurring Goal Duration

**Branch**: `009-locale-currency-goal-duration` | **Date**: 2026-04-11 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/009-locale-currency-goal-duration/spec.md`

## Summary

Replace all hardcoded `₹` currency prefixes throughout the UI with locale-aware formatting that detects the user's browser locale and applies the correct currency symbol, number grouping, and compact notation. Add a `recurringDurationYears` field (1–3) to recurring financial goals, exposing it through the goal form and driving SIP calculations from the full-duration total.

## Technical Context

**Language/Version**: TypeScript 4.x  
**Primary Dependencies**: React 19.2.4, Vite 8.0.0, MUI v6, react-hook-form, dayjs  
**Storage**: File System Access API + IndexedDB (local); Google Drive REST API (cloud)  
**Testing**: Vitest  
**Target Platform**: Modern browser (desktop + mobile web)  
**Project Type**: Single-page web application  
**Performance Goals**: No new latency concerns; `Intl.NumberFormat` is synchronous  
**Constraints**: No backend; all data persisted client-side  
**Scale/Scope**: ~12 UI files touched; 2 domain class changes; 2 storage provider changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clear Layering | PASS | `formatCompactCurrency` stays in `src/types/util.ts`; `recurringDurationYears` field and term derivation live in `src/domain/FinancialGoals.ts`. No business logic leaks into UI components. |
| II. Feature Co-location | PASS | Duration input confined to `FinancialGoalForm` under its page; recurring table updated in its own component. Shared formatter added to existing shared util file. |
| III. Upgrade-Friendly Boundaries | PASS | No new 3rd-party dependencies introduced. `Intl.NumberFormat` is a browser built-in. |
| IV. Type Safety | PASS | `recurringDurationYears` typed as `number | undefined` on `FinancialGoal`; no `any` introduced. |
| V. Predictable Change | PASS | New `formatCompactCurrency` unit-tested in `src/types/util.test.tsx`; SIP calculation changes tested in `src/domain/FinancialGoals.test.ts`. |

## Project Structure

### Documentation (this feature)

```text
specs/009-locale-currency-goal-duration/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks command)
```

### Source Code (files modified by this feature)

```text
src/
├── types/
│   └── util.ts                               ← add formatCompactCurrency()
├── domain/
│   └── FinancialGoals.ts                     ← add recurringDurationYears field + update getTerm/getMonthTerm
├── pages/
│   ├── Home/
│   │   └── components/
│   │       └── FinancialGoalForm/
│   │           └── index.tsx                 ← add duration input for recurring goals
│   ├── Planner/
│   │   └── components/
│   │       ├── GoalCard/
│   │       │   ├── index.tsx                 ← ₹ → formatCurrency
│   │       │   └── components/
│   │       │       ├── InvestmentTracker/
│   │       │       │   └── index.tsx         ← Y-axis + inline ₹ → formatCompactCurrency/formatCurrency
│   │       │       ├── InvestmentLogHistory/
│   │       │       │   └── index.tsx         ← ₹ → formatCurrency
│   │       │       └── LogEntryForm/
│   │       │           └── index.tsx         ← label "Monthly SIP Amount (₹)" → locale-aware
│   │       ├── RecurringGoalsTable/
│   │       │   └── index.tsx                 ← ₹ → formatCurrency; add Duration column; derive yearly target
│   │       ├── TermwiseProgressBox/
│   │       │   └── index.tsx                 ← ₹ → formatCurrency
│   │       └── CustomLegend/
│   │           └── index.tsx                 ← formatNumber → formatCurrency
│   └── CongratulationsPage/
│       └── index.tsx                         ← formatNumber → formatCurrency
└── util/
    └── storage/
        ├── localFileProvider.ts              ← pass recurringDurationYears to FinancialGoal constructor
        └── googleDriveProvider.ts            ← pass recurringDurationYears to FinancialGoal constructor
```

**Structure Decision**: Single frontend app; no backend. All changes confined to `src/`. No new files needed — this feature modifies existing files only.
