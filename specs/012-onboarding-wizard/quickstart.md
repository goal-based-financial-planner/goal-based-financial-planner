# Quickstart: Onboarding Wizard

## How to test the wizard locally

1. **Clear onboarding state** (to simulate first-time user):
   ```js
   // In browser DevTools console:
   localStorage.removeItem('onboardingComplete')
   // then refresh the page
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **First-time flow (new plan)**:
   - Visit `http://localhost:5173`
   - Wizard should appear immediately, overlaying the landing page
   - Click through steps 1 → 2 → 3, choose "Create new plan"
   - Step 4: select a storage provider
   - Step 5: fill in a financial goal and submit
   - Confirm: wizard closes, Planner screen appears, Joyride tour starts

4. **First-time flow (open existing plan)**:
   - Clear `onboardingComplete` again
   - On step 3, choose "Open existing plan"
   - Confirm: wizard closes, storage picker opens for existing-plan flow

5. **Skip flow**:
   - Clear `onboardingComplete`
   - Click "Skip" on any wizard step
   - Confirm: wizard closes, `localStorage.getItem('onboardingComplete')` is `'true'`
   - Refresh — wizard should NOT reappear

6. **Returning user** (onboarding complete):
   - Ensure `localStorage.getItem('onboardingComplete') === 'true'`
   - Visit/refresh — landing page appears normally without wizard

7. **Keyboard**:
   - With wizard open, press Tab repeatedly — confirm focus stays inside the dialog
   - Press Escape — confirm wizard closes (Skip behavior)

## Running tests

```bash
npm test -- --testPathPattern OnboardingWizard
```

## Key files

| File | Purpose |
|------|---------|
| `src/util/legacyStorage.ts` | Add `isOnboardingComplete` / `setOnboardingComplete` |
| `src/pages/LandingPage/index.tsx` | Render `OnboardingWizard` when not complete |
| `src/pages/LandingPage/components/OnboardingWizard/index.tsx` | Wizard shell (MUI Dialog) |
| `src/pages/LandingPage/components/OnboardingWizard/useOnboardingWizard.ts` | Step & path state hook |
| `src/pages/LandingPage/components/OnboardingWizard/steps/` | Individual step components |
