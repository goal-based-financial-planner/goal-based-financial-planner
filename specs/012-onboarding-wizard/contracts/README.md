# Component Contracts: Onboarding Wizard

This project is a client-side React SPA with no external API. The "contracts" here are the TypeScript component interfaces (props) that define the boundary between the wizard and its host.

---

## OnboardingWizard Props

```typescript
type OnboardingWizardProps = {
  // Called by the wizard to initialize a storage provider.
  // Mirrors the same prop passed to LandingPage from Home.
  initProvider: StorageProviderContextValue['initProvider'];

  // Dispatches planner data actions (e.g., addFinancialGoal on step 5).
  dispatch: Dispatch<PlannerDataAction>;

  // Called when the wizard finishes or is skipped.
  // Host uses this to re-evaluate onboarding state.
  onComplete: () => void;
};
```

**Invariants**:
- `onComplete` MUST be called exactly once per wizard session (on finish or skip).
- The wizard calls `setOnboardingComplete()` internally before calling `onComplete`.
- The wizard does NOT call `setIsFormOpen(true)` or any LandingPage-internal state setter — all communication is through these three props.

---

## useOnboardingWizard Hook Interface

```typescript
type UseOnboardingWizardReturn = {
  currentStep: number;          // 1-based
  path: 'new' | 'open' | null;  // null until step 3 choice
  totalSteps: number;           // 3 (open path) or 5 (new path)
  canGoBack: boolean;           // false on step 1
  goNext: () => void;
  goBack: () => void;
  skip: () => void;             // marks complete, calls onComplete
  choosePath: (p: 'new' | 'open') => void; // called on step 3
  handleStorageSelected: () => void;        // called when step 4 completes
  handleGoalCreated: () => void;            // called when step 5 form submits
};
```

---

## legacyStorage.ts Additions

```typescript
// New exports added to src/util/legacyStorage.ts
export function isOnboardingComplete(): boolean;
export function setOnboardingComplete(): void;
```

These follow the exact same pattern as the existing `isTourTaken` / `setTourTaken` pair.
