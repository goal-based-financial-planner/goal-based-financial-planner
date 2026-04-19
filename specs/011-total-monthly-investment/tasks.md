# Tasks: Show Total Monthly Investment Summary

**Input**: Design documents from `/specs/011-total-monthly-investment/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to ([US1], [US2])

---

## Phase 1: Setup

**No new dependencies, directories, or configuration required.** The feature uses only existing MUI components, TypeScript types, and Vitest infrastructure already in place.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Extend the `TargetBoxProps` type. This is a prerequisite for both the rendering change (US1) and the test updates (US1/US2) — completing it first prevents TypeScript compilation errors as downstream tasks land.

**⚠️ CRITICAL**: Complete before Phase 3.

- [x] T001 Add `totalMonthlyInvestment: number` to `TargetBoxProps` interface in `src/pages/Planner/components/TargetBox/index.tsx`

**Checkpoint**: `npm run build` compiles with the new prop type (callers will fail until T003 passes the prop — expected).

---

## Phase 3: User Story 1 - See Total Monthly Investment at a Glance (Priority: P1) 🎯 MVP

**Goal**: A user opening the planner immediately sees the total monthly investment required across all active goals, displayed inside `TargetBox` below the corpus target figure.

**Independent Test**: Render `TargetBox` with a `totalMonthlyInvestment` value → the label "Monthly Investment Required" and the formatted amount are visible without any mental arithmetic.

### Implementation for User Story 1

- [x] T002 [P] [US1] Add `totalMonthlyInvestment` `useMemo` in `src/pages/Planner/index.tsx` that sums `investmentSuggestions[].amount` across all entries of `investmentBreakdownForAllGoals` (use `Math.round` on the result; formula: `investmentBreakdownForAllGoals.flatMap(g => g.investmentSuggestions).reduce((sum, s) => sum + s.amount, 0)`)
- [x] T003 [US1] Pass `totalMonthlyInvestment` prop to `<TargetBox>` in `src/pages/Planner/index.tsx` (depends on T002)
- [x] T004 [US1] Render "Monthly Investment Required" `overline` label and a second `<LiveCounter value={totalMonthlyInvestment} duration={500} size="small" />` inside `TargetBox` in `src/pages/Planner/components/TargetBox/index.tsx`, positioned below the existing corpus `LiveCounter` block (depends on T001)
- [x] T005 [US1] Update `src/pages/Planner/components/TargetBox/index.test.tsx`: (a) add `totalMonthlyInvestment` prop to every existing `render(...)` call (use `0` as default where not the focus of the test), (b) add a new test asserting the "Monthly Investment Required" label and the correct value appear when `totalMonthlyInvestment={15000}`, (c) update the snapshot by deleting the existing `.snap` file so Vitest regenerates it (depends on T004)

**Checkpoint**: `npm test -- --testPathPattern=TargetBox` passes. Manually verify in dev server: open planner with 2+ goals → `TargetBox` shows "Monthly Investment Required" with an animated value equal to the sum of all per-goal monthly SIP amounts.

---

## Phase 4: User Story 2 - Total Updates When Goals Are Added or Removed (Priority: P2)

**Goal**: Confirm the total monthly investment figure reacts immediately to goal additions, removals, and date changes.

**No new implementation required**: Reactivity is automatic. The `totalMonthlyInvestment` `useMemo` depends on `investmentBreakdownForAllGoals`, which already depends on `plannerData` and `selectedDate`. React will re-render `TargetBox` whenever either changes.

**Independent Test**: Follow the manual verification checklist in `quickstart.md`.

### Validation for User Story 2

- [ ] T006 [US2] Manually validate reactivity per `specs/011-total-monthly-investment/quickstart.md`: (1) start with 1 goal → note total, (2) add a second goal → confirm total increases by second goal's monthly amount, (3) remove a goal → confirm total decreases, (4) change the date picker to a past month beyond a goal's target → confirm that goal is excluded and total drops

**Checkpoint**: All three manual scenarios pass. No code changes expected unless a reactivity bug is found (in which case, add the missing dependency to the `useMemo` in `Planner/index.tsx`).

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T007 Run full test suite (`npm test`) and fix any failing tests caused by the new required `totalMonthlyInvestment` prop (any other render call outside `TargetBox/index.test.tsx` that renders `TargetBox` directly must also receive the new prop)
- [x] T008 [P] Run `npm run build` to confirm TypeScript compilation is clean with no `any` leakage
- [ ] T009 [P] Verify dev server (`npm start`) shows the new figure on mobile viewport (xs breakpoint) — confirm layout does not overflow `TargetBox` on small screens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **User Story 1 (Phase 3)**: T001 must complete before T004; T002 must complete before T003; T004 must complete before T005
- **User Story 2 (Phase 4)**: Depends on Phase 3 fully complete (T002–T005)
- **Polish (Phase 5)**: Depends on Phases 3 and 4 complete

### User Story Dependencies

- **User Story 1 (P1)**: Standalone — no dependency on US2
- **User Story 2 (P2)**: No new code; depends on US1 implementation being in place

### Within User Story 1

```
T001 (type) ──────────────────┐
                               ↓
T002 (useMemo) → T003 (prop) → T004 (render) → T005 (test + snapshot)
```

T001 and T002 can run **in parallel** (different files).

### Parallel Opportunities

- T001 and T002 are in different files (`TargetBox/index.tsx` vs `Planner/index.tsx`) — run in parallel
- T008 and T009 in Phase 5 are independent — run in parallel

---

## Parallel Example: User Story 1

```
# Launch T001 and T002 simultaneously (different files, no dependency):
Task A: "Add totalMonthlyInvestment to TargetBoxProps in src/pages/Planner/components/TargetBox/index.tsx"
Task B: "Add totalMonthlyInvestment useMemo in src/pages/Planner/index.tsx"

# Once both complete, continue sequentially:
→ T003: Pass prop to TargetBox in Planner/index.tsx
→ T004: Render label + LiveCounter in TargetBox/index.tsx
→ T005: Update tests and snapshot in TargetBox/index.test.tsx
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 2: T001
2. Complete Phase 3: T002 → T003 → T004 → T005
3. **STOP and VALIDATE**: Run tests + open dev server → confirm total appears correctly
4. Ship if validated

### Full Delivery (Both Stories)

1. MVP above
2. Phase 4: T006 (manual validation)
3. Phase 5: T007, T008, T009

---

## Notes

- `LiveCounter` is mocked in `TargetBox/index.test.tsx` via `vi.mock` — the new second `LiveCounter` instance will render with `data-testid="live-counter"`. Use `screen.getAllByTestId('live-counter')` if you need to assert both counters independently.
- The existing snapshot test (`it('should match snapshot', ...)`) will fail after T004 — delete the `.snap` file to let Vitest regenerate it cleanly (covered by T005).
- `totalMonthlyInvestment` will be `0` when no goals exist or all goals are completed — `LiveCounter` handles zero gracefully; no special case needed.
