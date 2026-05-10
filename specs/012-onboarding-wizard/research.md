# Research: Onboarding Wizard

## 1. MUI Dialog Focus Trapping

**Decision**: Use MUI `Dialog` as the wizard shell — no additional focus-trap library needed.

**Rationale**: MUI `Dialog` internally uses `@mui/base/FocusTrap`, which traps focus within the dialog automatically when `open={true}`. Pressing Tab cycles through focusable elements inside the dialog and wraps around. This satisfies FR-014 with zero additional dependencies.

**Alternatives considered**:
- `focus-trap-react` (external library) — rejected; MUI Dialog already provides this natively.
- A custom full-screen route — rejected; a Dialog overlay is simpler and avoids routing concerns.

---

## 2. Onboarding State Storage Pattern

**Decision**: Add two functions to the existing `src/util/legacyStorage.ts`: `isOnboardingComplete()` and `setOnboardingComplete()`, using the key `'onboardingComplete'`.

**Rationale**: `legacyStorage.ts` already holds `isTourTaken` / `setTourTaken` and `isDisclaimerAccepted` / `setDisclaimerAccepted` using the same `localStorage.setItem(KEY, JSON.stringify(true))` pattern. Adding onboarding state here keeps all "first-visit" flags co-located and consistent. Per the clarified spec, onboarding state is per-device (localStorage only).

**Alternatives considered**:
- Storing inside the plan file — rejected per clarification Q3 (per-device, not per-plan).
- A dedicated `src/util/onboardingStorage.ts` — rejected; the existing module is the right home for this class of flag and splitting adds unnecessary fragmentation.

---

## 3. Wizard Rendering Integration Point

**Decision**: The `OnboardingWizard` component is rendered inside `LandingPage/index.tsx`. `LandingPage` checks `isOnboardingComplete()` on mount and passes a boolean prop to the wizard. The wizard is a Dialog overlay that sits on top of the landing page content.

**Rationale**: `LandingPage` already receives `dispatch`, `initProvider`, `clearProvider`, and drive-related props — the exact set the wizard needs to initialize storage and create the first goal. Rendering it here avoids prop-drilling through `Home` and keeps the feature co-located under `src/pages/LandingPage/`.

**Alternatives considered**:
- Rendering in `Home/index.tsx` alongside `LandingPage` — workable, but requires threading more props down and separates wizard logic from the LandingPage it overlays.
- Rendering in `App.tsx` — rejected; too high in the tree, requires threading too many props.

---

## 4. Suppressing AddGoalPopup for Wizard-Handled Users

**Decision**: `LandingPage` manages `isFormOpen` (the AddGoalPopup trigger) as local state. When the wizard is active and the user completes the "Create new plan" path, the wizard calls `initProvider` + `dispatch` directly and marks onboarding complete — `isFormOpen` is never set to `true`. The wizard renders `FinancialGoalForm` in its own Dialog step instead.

**Rationale**: `AddGoalPopup` is triggered by `setIsFormOpen(true)` inside `_doInitProvider` for the `'new'` mode. When the wizard orchestrates this flow, it calls `initProvider` itself but does NOT call `setIsFormOpen(true)`. This is a clean no-op suppression with no changes to `AddGoalPopup` itself.

**Alternatives considered**:
- Adding a flag to `LandingPage` to suppress AddGoalPopup — unnecessary; the wizard simply doesn't call `setIsFormOpen`.
- Modifying `AddGoalPopup` or `initProvider` — rejected; the change should be contained to the wizard's orchestration logic.

---

## 5. Wizard Step Structure

**Decision**: 5-step flow for "Create new plan" path; 3-step flow for "Open existing plan" path. Steps 1–3 are shared.

| Step | Path | Content |
|------|------|---------|
| 1 | Both | Welcome — what the app does, key benefits |
| 2 | Both | Concepts — goals, short/medium/long terms, allocation idea |
| 3 | Both | Path choice — "Create new plan" / "Open existing plan" |
| 4 | New only | Storage picker — local file or Google Drive (reuses `StorageProviderPicker`) |
| 5 | New only | Create first goal — reuses `FinancialGoalForm` |

For the "Open existing plan" path, selecting it on step 3 marks onboarding complete and triggers the existing `initProvider('open')` flow, then the wizard closes.

**Rationale**: This meets FR-002 (3–5 steps) and FR-003a/b. Reusing `StorageProviderPicker` and `FinancialGoalForm` avoids duplicating UI and validation logic.

---

## 6. Keyboard / Escape Behavior

**Decision**: MUI Dialog's `onKeyDown` prop intercepts Escape to trigger Skip. The Dialog's default `onClose` (fired on Escape) is wired to the Skip handler.

**Rationale**: MUI Dialog fires `onClose` when Escape is pressed. By passing the Skip handler to `onClose`, FR-015 is satisfied with zero extra event listeners.

**Alternatives considered**:
- `useEffect` + `window.addEventListener('keydown')` — unnecessary; MUI handles this natively.
