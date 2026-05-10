# Implementation Plan: Onboarding Wizard

**Branch**: `012-onboarding-wizard` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/012-onboarding-wizard/spec.md`

## Summary

Add a multi-step onboarding wizard that fires on first page load for new users, overlaying the landing page as a full-screen MUI Dialog. The wizard teaches core app concepts, lets users choose between creating a new plan or opening an existing one, and (for new plans) handles storage provider selection and first goal creation inline — replacing the existing AddGoalPopup for first-time users. On completion, onboarding state is persisted to localStorage and the Joyride tour fires normally on the Planner screen.

## Technical Context

**Language/Version**: TypeScript 4.x + React 19.2.4  
**Primary Dependencies**: MUI v6 (`@mui/material` — Dialog, Stepper/MobileStepper, Button, Typography), react-hook-form (existing), Vite 8.0.0, Vitest  
**Storage**: `localStorage` via `src/util/legacyStorage.ts` (key: `'onboardingComplete'`)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Browser (Web SPA, responsive — min 320px)  
**Project Type**: React SPA  
**Performance Goals**: Wizard completion < 3 min (SC-001); skip < 30 sec (SC-002)  
**Constraints**: 320px min width, focus trapped (MUI Dialog native), Escape = Skip, no new npm dependencies  
**Scale/Scope**: Single component tree; 5 wizard steps max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Notes |
|-----------|------------|-------|
| I. Clear Layering | ✅ Pass | Onboarding state in `src/util/legacyStorage.ts`; step logic in `useOnboardingWizard.ts` hook; UI in `src/pages/LandingPage/components/` |
| II. Feature Co-location | ✅ Pass | Wizard lives entirely under `src/pages/LandingPage/components/OnboardingWizard/` |
| III. Upgrade-Friendly | ✅ Pass | No new dependencies; reuses MUI Dialog (already imported), `StorageProviderPicker`, and `FinancialGoalForm` |
| IV. Type Safety | ✅ Pass | `WizardPath`, `UseOnboardingWizardReturn` types defined explicitly; no `any` |
| V. Predictable Change | ✅ Pass | `useOnboardingWizard` hook is unit-testable; `isOnboardingComplete`/`setOnboardingComplete` added to existing tested utility |

No violations. Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/012-onboarding-wizard/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── README.md        ← component prop contracts
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
├── util/
│   └── legacyStorage.ts              (add isOnboardingComplete, setOnboardingComplete)
├── pages/
│   └── LandingPage/
│       ├── index.tsx                 (render OnboardingWizard; suppress AddGoalPopup for wizard users)
│       └── components/
│           └── OnboardingWizard/
│               ├── index.tsx         (wizard shell: MUI Dialog, step router, progress bar)
│               ├── useOnboardingWizard.ts   (step state, path tracking, navigation logic)
│               ├── steps/
│               │   ├── WelcomeStep.tsx          (step 1: app intro)
│               │   ├── ConceptsStep.tsx          (step 2: goals, terms, allocations)
│               │   ├── PathChoiceStep.tsx        (step 3: new vs open)
│               │   ├── StoragePickerStep.tsx     (step 4: storage selection, new path only)
│               │   └── CreateGoalStep.tsx        (step 5: first goal form, new path only)
│               └── index.test.tsx    (unit + integration tests for wizard flows)
```

**Structure Decision**: Single-project React SPA. Wizard is co-located under the LandingPage page module per Constitution Principle II.

## Implementation Phases

### Phase A — Storage Utility Extension

Extend `src/util/legacyStorage.ts` with two new functions following the exact existing pattern:

```typescript
const ONBOARDING_COMPLETE_KEY = 'onboardingComplete';

export function isOnboardingComplete(): boolean {
  return JSON.parse(localStorage.getItem(ONBOARDING_COMPLETE_KEY) || 'false');
}

export function setOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, JSON.stringify(true));
}
```

**Tests**: Add to existing `legacyStorage.test.ts` — verify read/write behavior and default false.

---

### Phase B — Wizard Hook (`useOnboardingWizard`)

Pure state management hook with no side effects beyond what is passed in as callbacks.

**State**:
- `currentStep: number` — 1-based, starts at 1
- `path: 'new' | 'open' | null` — set when user chooses on step 3
- `totalSteps: number` — 3 for open path, 5 for new path (computed from path)

**Actions**:
- `goNext()` — increments step; no-op if on last step
- `goBack()` — decrements step; no-op on step 1
- `choosePath(p)` — sets path, advances to step 4
- `skip(onComplete)` — calls `setOnboardingComplete()` then `onComplete()`
- `handleStorageSelected(onComplete?)` — advances step 4 → 5 (new path)
- `handleGoalCreated(onComplete)` — calls `setOnboardingComplete()` then `onComplete()`

**Derived**:
- `canGoBack` — `currentStep > 1`
- `isLastStep` — `currentStep === totalSteps`

**Tests**: Unit-test all state transitions including branching, skip at each step, and Escape → skip equivalence.

---

### Phase C — Step Components

Each step is a stateless presentational component receiving only what it needs.

**WelcomeStep** (step 1):
- Headline: "Plan your financial future, goal by goal"
- 3–4 benefit bullets (e.g., "Set goals", "Get investment suggestions", "Track progress")
- No interactive elements beyond wizard navigation

**ConceptsStep** (step 2):
- Explain short/medium/long-term goal categories with brief examples
- Explain that the app suggests investment allocations (equity/debt/gold) based on term
- Simple icon + text layout, no form elements

**PathChoiceStep** (step 3):
- Two large action cards: "Create a new plan" and "Open existing plan"
- Clicking either calls `choosePath()` and advances immediately (no separate Next button needed)

**StoragePickerStep** (step 4 — new path only):
- Inline choice: local file or Google Drive (reuse `StorageProviderPicker` component or equivalent inline UI)
- On selection, calls `initProvider(type, 'new')` then `handleStorageSelected()`
- Shows loading state during provider initialization
- Shows error state if initialization fails (with retry)

**CreateGoalStep** (step 5 — new path only):
- Embeds `FinancialGoalForm` directly (no wrapping Dialog — the wizard Dialog is already the container)
- On form submit: calls `addFinancialGoal(dispatch, goal)` then `handleGoalCreated(onComplete)`
- "Back" returns to step 4 (path stays 'new')

---

### Phase D — Wizard Shell (`OnboardingWizard/index.tsx`)

MUI `Dialog` with `fullWidth`, `maxWidth="sm"` (or `fullScreen` on mobile via `useMediaQuery`).

**Layout**:
```
┌─────────────────────────────────────┐
│  [Step X of Y]              [Skip]  │  ← header row
├─────────────────────────────────────┤
│                                     │
│         <ActiveStepComponent />     │  ← content area (scrollable)
│                                     │
├─────────────────────────────────────┤
│  [← Back]              [Next →]    │  ← footer nav (hidden on step 3)
└─────────────────────────────────────┘
```

- `onClose` (MUI Dialog Escape handler) → wired to `skip()`
- Step 3 (PathChoiceStep) hides the footer nav — path cards act as the navigation
- Step 5 (CreateGoalStep) replaces "Next" with the form's own submit button

---

### Phase E — LandingPage Integration

**Changes to `src/pages/LandingPage/index.tsx`**:

1. Read `isOnboardingComplete()` once on component initialization:
   ```typescript
   const [showWizard, setShowWizard] = useState(!isOnboardingComplete());
   ```

2. Render `OnboardingWizard` conditionally:
   ```tsx
   {showWizard && (
     <OnboardingWizard
       initProvider={initProvider}
       dispatch={dispatch}
       onComplete={() => setShowWizard(false)}
     />
   )}
   ```

3. `AddGoalPopup` continues to render only when `isFormOpen === true`, which is only set for returning users going through the normal `_doInitProvider('new')` flow. For wizard users, `isFormOpen` is never set — no change needed to AddGoalPopup logic.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Focus trap | MUI Dialog native | Zero extra dependencies; satisfies FR-014 |
| Escape = Skip | MUI `onClose` prop | Native behavior, no custom event listener needed |
| State persistence | `localStorage` via `legacyStorage.ts` | Consistent with existing `tourTaken` / `disclaimerAccepted` pattern |
| No new npm packages | All reuse existing MUI + internal components | Avoids adding bundle weight; all needed primitives already present |
| Wizard in LandingPage | Co-located at `LandingPage/components/` | Wizard needs same props as LandingPage; follows Constitution Principle II |
| AddGoalPopup unchanged | Wizard never sets `isFormOpen` | Clean suppression without modifying AddGoalPopup |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| `initProvider` throws on step 4 | StoragePickerStep shows error state + retry button |
| User reloads mid-wizard | Wizard restarts from step 1 (incomplete = always restart) |
| Google Drive name prompt (existing dialog) conflicts with wizard | Wizard for "new Drive plan" must handle the plan-name dialog inside step 4, or defer to the existing flow post-wizard close |
| FinancialGoalForm requires `close` callback | Pass wizard's `goNext` (or `handleGoalCreated`) as the `close` prop |
