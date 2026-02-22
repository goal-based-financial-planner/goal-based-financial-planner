# Research: Tabbed Financial Goals View

**Feature**: 004-goals-tabbed-view
**Date**: 2026-02-22

## Summary

No external unknowns. All technology is already in use in the project. Research confirms the implementation approach is straightforward with no new dependencies.

---

## Decision 1: Tab Component Choice

**Decision**: Use MUI `Tabs` + `Tab` from `@mui/material` (already installed at v6.1.7).

**Rationale**: MUI Tabs are already the project's UI component library. They provide built-in accessibility (ARIA), keyboard navigation, and theme integration at zero additional cost. No new dependency required.

**Alternatives considered**:
- Custom CSS tab implementation — rejected: unnecessary work when MUI Tabs already exist in the dependency tree.
- React Router tabs (URL-based) — rejected: spec explicitly states tab state is ephemeral; no URL routing change required.

---

## Decision 2: Tab State Location

**Decision**: `useState<0 | 1>(0)` local to `GoalBox/index.tsx`.

**Rationale**: Tab selection is a pure UI concern with no cross-component dependencies. Local state is the simplest correct solution. Lifting to a context or global store would violate Constitution Principle I (no hidden business logic) and over-engineer a transient display preference.

**Alternatives considered**:
- URL query param (`?tab=recurring`) — rejected: spec says ephemeral; adds routing complexity.
- localStorage persistence — rejected: not specified; adds unnecessary coupling to storage layer.

---

## Decision 3: GoalList Cleanup

**Decision**: Remove the internal RECURRING/ONE_TIME filter split from `GoalList` after `GoalBox` takes ownership of routing by goal type.

**Rationale**: After the tab refactor, `GoalBox` passes pre-filtered arrays (pending one-time, completed one-time, or recurring) to `GoalList`. The existing internal split in `goalList.tsx` would become dead code — a Constitution Principle I violation. Removing it makes `GoalList` a pure renderer.

**Alternatives considered**:
- Leave `goalList.tsx` unchanged — rejected: leaves unreachable branching logic after refactor.

---

## Decision 4: StyledBox Wrapper Scope

**Decision**: Apply one `StyledBox` wrapping the entire tabbed area (Tabs + panel content), not per-section as before.

**Rationale**: The existing `useStyledBox` prop was used to wrap each section independently. With tabs, a single wrapper around the whole tab control is cleaner and produces the same visual result.

---

## Decision 5: Empty State Rendering

**Decision**: Inline `Typography` within `GoalBox` for empty states. No new shared component.

**Rationale**: Empty state messages are simple text, used only in this one location. Constitution Principle V discourages premature abstraction. If reuse is needed later, extraction is a one-step refactor.

---

## No Open Items

All NEEDS CLARIFICATION markers from spec are resolved. No blocking unknowns remain.
