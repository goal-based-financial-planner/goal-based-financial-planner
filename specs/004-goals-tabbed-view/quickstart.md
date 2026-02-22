# Quickstart: Tabbed Financial Goals View

**Feature**: 004-goals-tabbed-view
**Date**: 2026-02-22

## What's Changing

Three localized edits to existing files. No new files. No new dependencies.

| File | Change Type | Summary |
|------|-------------|---------|
| `src/pages/Planner/components/GoalBox/index.tsx` | Refactor | Add MUI Tabs; replace stacked sections with tab panels |
| `src/pages/Planner/components/RecurringGoalsTable/index.tsx` | Label fix | `"Monthly Target"` → `"Yearly Target"` |
| `src/pages/Planner/components/GoalBox/goalList.tsx` | Cleanup | Remove redundant RECURRING/ONE_TIME internal split |

---

## GoalBox/index.tsx — Key Changes

### 1. Add tab state

```typescript
const [activeTab, setActiveTab] = useState<0 | 1>(0);
```

### 2. Compute tab counts

```typescript
const oneTimeCount = pendingGoals.length + completedGoals.length;
const recurringCount = recurringGoals.length;
```

### 3. Replace stacked Grid sections with Tabs

```tsx
<Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
  <Tab label={`One Time (${oneTimeCount})`} />
  <Tab label={`Recurring (${recurringCount})`} />
</Tabs>

{/* Tab 0: One Time */}
<Box role="tabpanel" hidden={activeTab !== 0}>
  {oneTimeCount === 0 ? (
    <Typography>No one-time goals added yet.</Typography>
  ) : (
    <>
      {pendingGoals.length > 0 && (
        <>
          <Typography variant="h6" fontWeight="bold">Financial Goals</Typography>
          <GoalList goals={pendingGoals} ... />
        </>
      )}
      {completedGoals.length > 0 && (
        <>
          <Typography variant="h6" fontWeight="bold">Completed Goals</Typography>
          <GoalList goals={completedGoals} ... />
        </>
      )}
    </>
  )}
</Box>

{/* Tab 1: Recurring */}
<Box role="tabpanel" hidden={activeTab !== 1}>
  {recurringCount === 0 ? (
    <Typography>No recurring goals added yet.</Typography>
  ) : (
    <GoalList goals={recurringGoals} ... />
  )}
</Box>
```

---

## RecurringGoalsTable/index.tsx — Label Fix

Find and replace one string in `TableHead`:

```diff
- Monthly Target
+ Yearly Target
```

---

## GoalBox/goalList.tsx — Cleanup

Remove the internal goal type split (lines 22–27 in current file). After the tab refactor, `GoalBox` passes pre-filtered arrays, so `GoalList` no longer needs to re-route by type. It renders whatever it receives directly (GoalCard for ONE_TIME goals, RecurringGoalsTable for RECURRING goals).

---

## Verify

```bash
npm run build          # must pass
npm test -- --watchAll=false  # must pass
```

No new test files required. The label change and tab state are covered by the existing build + type check.
