# Data Model: Onboarding Wizard

## Entities

### OnboardingState

Persisted in `localStorage` via `src/util/legacyStorage.ts`. Tracks whether the current device has completed or skipped onboarding.

| Field | Type | Storage Key | Default |
|-------|------|-------------|---------|
| `completed` | `boolean` | `'onboardingComplete'` | `false` (key absent) |

**Access functions** (added to `legacyStorage.ts`):
- `isOnboardingComplete(): boolean` — reads key, returns `false` if absent
- `setOnboardingComplete(): void` — writes `true` to key

**Lifecycle**:
- Created (set to `true`) when user completes wizard OR clicks Skip at any step
- Never reset automatically (per-device, permanent unless localStorage is cleared)
- Read on every `LandingPage` mount to decide whether to show the wizard

---

### WizardState (ephemeral, in-memory only)

Managed by `useOnboardingWizard` hook. Not persisted — lost on browser close.

| Field | Type | Description |
|-------|------|-------------|
| `currentStep` | `number` (1–5) | Active step index |
| `path` | `'new' \| 'open' \| null` | Chosen path; set on step 3 |
| `storageProviderSelected` | `boolean` | Whether storage was initialized in step 4 |

**State transitions**:

```
Step 1 → Step 2 → Step 3 (path choice)
                      ↓
          path='new'           path='open'
              ↓                    ↓
          Step 4             mark complete
          (storage)          → initProvider('open')
              ↓                  → wizard closes
          Step 5
          (goal form)
              ↓
          mark complete
          → wizard closes
          → Planner + Joyride
```

**Skip (any step)**:
```
Any step → mark complete → wizard closes → landing page remains active
```

---

### WizardStepDefinition (static configuration)

Not persisted. Defines the content and behavior of each step.

| Field | Type | Description |
|-------|------|-------------|
| `stepNumber` | `number` | 1-based index |
| `title` | `string` | Step heading |
| `showForPath` | `'both' \| 'new' \| 'open'` | Which path renders this step |
| `hasInteractiveElement` | `boolean` | Whether step has a form (steps 4, 5) |

---

### FinancialGoal (existing — unchanged)

Created in wizard Step 5. Same shape as goals created via `AddGoalPopup`. Dispatched to the reducer via `addFinancialGoal(dispatch, goal)`.

No changes to the `FinancialGoal` domain type.

---

## Relationships

```
LandingPage
  ├── reads OnboardingState (isOnboardingComplete)
  └── renders OnboardingWizard (if not complete)
        ├── manages WizardState (useOnboardingWizard hook)
        ├── on step 4: calls initProvider (from LandingPage props)
        ├── on step 5: dispatches addFinancialGoal + writes OnboardingState
        └── on skip: writes OnboardingState
```

## Validation Rules

All existing validation rules from `FinancialGoalForm` apply unchanged on the wizard's goal creation step (Step 5):
- Goal name: alphanumeric, required
- Target amount: positive number, required
- Target date: future date, required
- Goal type: ONE_TIME or RECURRING (enum)
- Recurring duration: positive integer years (if RECURRING)
