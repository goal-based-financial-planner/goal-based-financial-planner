# Feature Specification: Locale Currency Formatting and Recurring Goal Duration

**Feature Branch**: `009-locale-currency-goal-duration`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "I want to add few miscellaneous features. 1. I want to show currently based on the locale of the user. Everywhere where there is currently, the comma separation and the symbol should match the locale. 2. I want to add duration for recurring goals, this duration should be in years and should not be more than 3 years."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Locale-Aware Currency Display (Priority: P1)

A user from India opens the financial planner and sees all monetary values displayed with the Indian Rupee symbol (₹) and Indian number formatting (e.g., ₹10,00,000). A user from the United States sees the same amounts displayed in US Dollar format (e.g., $1,000,000). A user from Germany sees amounts with Euro symbol and German number separators (e.g., 1.000.000 €). The currency symbol, decimal separator, and thousands separator all adapt automatically to match the user's locale — without any manual configuration needed.

**Why this priority**: Currency display is a fundamental aspect of the financial planning experience. Showing the wrong currency symbol or number format creates confusion and erodes trust. This affects every monetary value shown throughout the application.

**Independent Test**: Can be fully tested by opening the application in a browser configured with different regional locale settings and verifying that all monetary amounts — goal targets, investment suggestions, monthly SIP values, yearly recurring totals, progress amounts — display with the correct currency symbol and number grouping for that locale.

**Acceptance Scenarios**:

1. **Given** a user whose device/browser is set to the Indian locale, **When** they view any monetary amount in the application, **Then** the amount is shown with the ₹ symbol and Indian number formatting (e.g., ₹10,00,000)
2. **Given** a user whose device/browser is set to the US locale, **When** they view any monetary amount, **Then** the amount is shown with the $ symbol and US formatting (e.g., $1,000,000)
3. **Given** a user whose device/browser is set to a European locale (e.g., Germany), **When** they view any monetary amount, **Then** the amount is shown with the € symbol and locale-appropriate separators
4. **Given** a user whose locale maps to an unrecognized or unsupported region, **When** they view monetary amounts, **Then** amounts are displayed with a sensible default (USD) without any error or missing symbol
5. **Given** any monetary value displayed in a form field label (e.g., "Monthly SIP Amount"), **When** the user views that label, **Then** the currency symbol in the label matches the user's locale

---

### User Story 2 - Recurring Goal Duration Input (Priority: P2)

A user creates a recurring financial goal (e.g., monthly household expenses, annual vacation budget). When adding this recurring goal, they can specify how many years this goal will recur — between 1 and 3 years. Once saved, the planner uses this duration to compute accurate investment planning recommendations and projections over the specified period rather than assuming a fixed 1-year duration.

**Why this priority**: Without a duration, all recurring goals are treated as 1-year commitments, which produces inaccurate investment suggestions for goals that span multiple years. Duration directly impacts financial calculations and the usefulness of the planner's recommendations.

**Independent Test**: Can be fully tested by creating a recurring goal with durations of 1, 2, and 3 years and verifying that the investment calculations and goal display reflect the chosen duration. Can also be tested in isolation from Feature 1 using any currency display.

**Acceptance Scenarios**:

1. **Given** a user is creating a recurring goal, **When** they fill in the goal form, **Then** a duration field is visible allowing them to enter a value in years (1–3)
2. **Given** a user creates a recurring goal with a target of $24,000 and duration of 2 years, **When** they save and view the planner, **Then** the monthly SIP suggestion is $1,000 ($24,000 ÷ 24 months) and the displayed yearly target is $12,000
3. **Given** a user attempts to enter a duration greater than 3 years, **When** the form validates, **Then** an error is shown and the goal cannot be saved until duration is within the 1–3 year range
4. **Given** a user enters a duration of 0 or a non-positive number, **When** the form validates, **Then** an error is shown requiring a valid positive duration
5. **Given** an existing recurring goal saved before this feature, **When** it is loaded, **Then** it defaults to 1-year duration and continues to behave as before (backward compatibility)
6. **Given** a user views the recurring goals table on the Planner page, **When** the goal is displayed, **Then** the duration (e.g., "2 years") is shown alongside the goal name and yearly target

---

### Edge Cases

- What happens when a user's locale is a region not in the known locale-to-currency mapping? (Default to USD display)
- What happens when the browser does not expose a language/locale setting? (Default to USD display)
- What happens when a recurring goal's duration is left blank? (Treat as a validation error; goal cannot be saved)
- How does the planner handle fractional or decimal input for duration (e.g., 1.5 years)? (Only whole-year values are accepted; decimals are rejected)
- What happens to the recurring goals table display for goals that already exist with no stored duration? (They default to 1 year gracefully)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All monetary values displayed throughout the application MUST use the currency symbol appropriate for the user's locale (e.g., ₹ for India, $ for US, € for Germany)
- **FR-001a**: Chart axis labels and tooltips that use abbreviated notation MUST adapt to locale-appropriate compact suffixes (e.g., INR: ₹10.5Cr / ₹3.5L; USD: $10.5M / $3.5K; EUR: €10.5M / €3.5K)
- **FR-002**: All monetary values MUST use the number grouping and decimal separator conventions of the user's locale (e.g., Indian lakh/crore grouping, US thousands grouping, European period-as-thousands-separator)
- **FR-003**: Locale detection MUST be automatic, based on the user's browser/device regional settings, without requiring the user to manually select a currency or region
- **FR-004**: When the user's locale maps to an unrecognized region or currency, the system MUST fall back to displaying amounts in USD with US formatting
- **FR-005**: Currency symbols in form field labels (e.g., "Monthly SIP Amount (₹)") MUST also reflect the user's locale
- **FR-006**: The recurring goal creation form MUST include a duration field that accepts whole-number values from 1 to 3 (inclusive), labeled clearly as years
- **FR-007**: The system MUST reject recurring goal submissions where the duration is outside the 1–3 year range, displaying a clear validation error to the user
- **FR-008**: The target amount of a recurring goal represents the total amount to be achieved over the full duration; the system MUST calculate monthly SIP as target amount ÷ (duration in years × 12)
- **FR-008a**: The yearly target displayed in the recurring goals table MUST be derived as target amount ÷ duration years (not entered directly by the user)
- **FR-009**: Recurring goals with no stored duration (created before this feature) MUST be treated as having a 1-year duration to maintain backward compatibility
- **FR-010**: The recurring goals table on the Planner page MUST display the duration alongside each goal's name and yearly target amount

### Key Entities

- **Recurring Goal**: A financial goal that repeats over time; now extended with a duration (in whole years, 1–3) specifying how long the goal recurs
- **Locale**: The user's regional language/country setting as detected from the browser; determines currency symbol and number format used throughout the application

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of monetary values displayed in the application show the correct currency symbol and number format matching the user's locale, with zero hardcoded currency symbols remaining in the UI
- **SC-002**: Users with non-USD locales (e.g., India, Germany, UK) see correctly formatted amounts without any manual configuration steps
- **SC-003**: A recurring goal with a 3-year duration produces investment recommendations visibly different from a 1-year goal of the same target amount, demonstrating that duration is factored into calculations
- **SC-004**: The recurring goal form prevents saving goals with invalid durations (0, >3, or non-integer) and presents a clear error message, with a 100% error capture rate for out-of-range values
- **SC-005**: All previously created recurring goals (with no stored duration) continue to load and display without errors after the feature is deployed

## Clarifications

### Session 2026-04-11

- Q: For chart/graph axis labels and tooltips using abbreviated Indian notation (e.g., ₹10.5Cr, ₹3.5L), how should non-INR locales display these? → A: Use locale-appropriate compact notation (e.g., $10.5M, $3.5K for USD; locale-equivalent suffixes for others)
- Q: When a recurring goal has a multi-year duration, what does the target amount represent and how is SIP derived? → A: The target amount is the total to achieve over the full duration; monthly SIP = target amount ÷ (duration × 12); displayed yearly target is derived as target amount ÷ duration years
- Q: Should a recurring goal's term classification (short/medium/long) be derived from its duration or stay fixed? → A: Recurring goals always remain fixed as Short Term regardless of duration

## Assumptions

- The user's locale is determined entirely by the browser's language/region setting; there is no in-app locale selector as part of this feature
- Duration is entered as a whole number (integer years); fractional years are not supported
- The maximum duration of 3 years for recurring goals is a hard business rule, not adjustable by the user
- Locale-to-currency mapping covers at minimum: India (INR), United States (USD), United Kingdom (GBP), Germany/France/EU (EUR), Japan (JPY); all other locales fall back to USD
- Backward compatibility for existing recurring goals assumes stored data will not have a duration field; the application gracefully defaults to 1 year in this case
- Recurring goals are always classified as Short Term regardless of duration; term classification is not derived from the duration field
