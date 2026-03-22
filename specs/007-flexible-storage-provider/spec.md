# Feature Specification: Flexible Storage Provider

**Feature Branch**: `007-flexible-storage-provider`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "As of now, the storage of the data created using studio is the localstorage. I want to modify this to let the user choose where to store it. For now, the options is either local computer or google drive. If the user selects local computer, see if we can somehow autosave to local disk that the user chooses. If the user selects google drive, the user should be shown a prompt to authorize themselves to google drive and select a folder where to store. Open option should work the same way. In both cases, autosave and manual save should work as expected. Ask the user to store the location of the data whenever a new window is opened, when new button is clicked, when open is clicked."

## Clarifications

### Session 2026-03-19

- Q: When a new window opens, does the app show a storage picker first, a New/Open choice first, or a combined welcome screen? → A: Combined welcome screen with "New Plan" and "Open Plan" buttons, each leading into its own storage picker flow (Option B).
- Q: What level of Google Drive access should the app request? → A: App-specific folder only — the app stores files in a dedicated hidden app folder in the user's Drive; no access to other Drive files; minimal consent screen shown during authorization.
- Q: Does a page refresh re-trigger the welcome screen? → A: No — the active storage location is remembered for the duration of the browser session. The welcome screen appears only for new windows/tabs with no active session, or when the user explicitly triggers "New" or "Open".
- Q: How should autosave be triggered? → A: Debounced — save approximately 2 seconds after the last change, batching rapid edits into a single write operation.
- Q: Should existing localStorage data be migrated when the new storage system is introduced? → A: No migration — existing localStorage data is left behind. Users start fresh by creating a new plan or opening one from disk/Drive.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Welcome Screen on Session Start (Priority: P1)

Every time a user opens the app in a new window or browser tab, they are presented with a combined welcome screen offering two clear actions: "New Plan" and "Open Plan". Clicking either action leads directly into that action's own storage picker flow. No plan data is shown until the user has completed their chosen flow. This ensures data always goes where the user intends.

**Why this priority**: This is the foundational interaction — without the welcome screen, no other storage-related functionality can operate. Combining the action choice and storage selection into a single cohesive flow (rather than two separate modal dialogs) avoids confusion and matches familiar desktop application patterns (e.g., VS Code, Figma).

**Independent Test**: Can be fully tested by opening a new browser window, confirming the welcome screen appears with "New Plan" and "Open Plan" options, completing each flow, and verifying the app loads/creates a plan using the selected provider.

**Acceptance Scenarios**:

1. **Given** a user opens the app in a new browser window or tab with no active session, **When** the app finishes loading, **Then** a welcome screen appears with "New Plan" and "Open Plan" options before any plan data is shown.
2. **Given** a user refreshes the page mid-session, **When** the page reloads, **Then** the previously active plan and storage provider are restored automatically — the welcome screen does not reappear.
2. **Given** the welcome screen is visible, **When** the user clicks "New Plan", **Then** a storage picker appears (Local Computer or Google Drive) scoped to creating a new plan.
3. **Given** the welcome screen is visible, **When** the user clicks "Open Plan", **Then** a storage picker appears (Local Computer or Google Drive) scoped to opening an existing plan.
4. **Given** the user selects "Local Computer" from either flow, **Then** a folder/file picker appropriate to that action is shown.
5. **Given** the user selects "Google Drive" from either flow, **Then** the Google authorization flow begins; no folder selection is needed — the app manages files in a dedicated app-specific folder in the user's Drive.
6. **Given** the user completes the full flow, **When** the final selection is confirmed, **Then** the plan opens and the welcome screen is dismissed.

---

### User Story 2 - Create a New Plan with Storage Selection (Priority: P1)

When the user clicks a "New" action, they are prompted to choose a storage location before a blank plan is created. This mirrors a desktop application's "File → New" experience where the user decides where the file lives before working on it.

**Why this priority**: Creating new plans is a primary workflow. Without storage selection at creation time, data could be lost or end up in an unintended location.

**Independent Test**: Can be fully tested by clicking "New", completing the storage picker, and confirming a new blank plan is created and saved at the selected location.

**Acceptance Scenarios**:

1. **Given** the user is in the app, **When** they click "New", **Then** the storage location picker dialog appears.
2. **Given** the storage picker is shown after clicking "New", **When** the user selects "Local Computer" and picks a folder, **Then** a new blank plan file is created in that folder and the app loads the new empty plan.
3. **Given** the storage picker is shown after clicking "New", **When** the user selects "Google Drive" and completes authorization, **Then** a new blank plan file is created in the app's dedicated folder in the user's Google Drive (no manual folder selection required).
4. **Given** the user is completing the "New" storage picker flow, **When** they dismiss or cancel the dialog, **Then** the current plan remains open and no new plan is created.

---

### User Story 3 - Open an Existing Plan with Storage Selection (Priority: P1)

When the user clicks "Open", they are first asked which storage provider to open from (Local Computer or Google Drive), then shown a file/folder picker for that provider so they can select an existing plan file.

**Why this priority**: Opening saved plans is the complement to creating them. Users need reliable access to existing work regardless of where it was saved.

**Independent Test**: Can be fully tested by clicking "Open", selecting a provider, browsing to an existing `.json` plan file, and confirming the plan loads correctly with all goals and investment data intact.

**Acceptance Scenarios**:

1. **Given** the user clicks "Open", **When** the storage picker appears and they select "Local Computer", **Then** a file browser opens so they can navigate to and select an existing plan file on their computer.
2. **Given** the user clicks "Open" and selects "Google Drive", **When** authorization is granted (if not yet done), **Then** the user is shown a list of plan files previously saved to the app's dedicated Drive folder and can select one to open.
3. **Given** the user selects a valid plan file, **When** the file is loaded, **Then** all previously saved goals and investment data appear correctly in the app.
4. **Given** the user selects a file that is not a valid plan, **When** the file is opened, **Then** the user is informed the file is invalid and the current plan remains open.

---

### User Story 4 - Autosave to Local Computer (Priority: P2)

After a user has chosen "Local Computer" as their storage location, any change they make (adding a goal, updating investments, etc.) is automatically saved to the chosen file on disk without any manual action required. The user can see a save status indicator showing whether their latest changes have been saved.

**Why this priority**: Autosave prevents data loss and matches the expectation set by the current localStorage behavior. Without it, users would need to remember to manually save, leading to lost work.

**Independent Test**: Can be fully tested by selecting "Local Computer" storage, making a change to a goal, waiting a moment, then verifying the updated data persists in the file on disk (confirmed by reopening or checking file modification time).

**Acceptance Scenarios**:

1. **Given** the user has a plan open with "Local Computer" storage, **When** they add or modify a goal or investment, **Then** the changes are automatically saved to the local file approximately 2 seconds after the last edit (debounced — rapid consecutive changes are batched into one write).
2. **Given** autosave is in progress, **When** the save is occurring, **Then** a visible indicator (e.g., "Saving...") is shown to the user.
3. **Given** autosave has completed, **When** the save finishes, **Then** the indicator updates to show "Saved" or equivalent confirmation.
4. **Given** autosave fails (e.g., file system error), **When** the error occurs, **Then** the user is notified that the save failed and prompted to retry or choose another location.

---

### User Story 5 - Autosave to Google Drive (Priority: P2)

After a user has chosen "Google Drive" as their storage location, any change they make is automatically saved to the file in their selected Google Drive folder. The user sees a save status indicator reflecting the sync state.

**Why this priority**: Google Drive autosave is equivalent in value to local autosave but introduces network dependency. It provides device-independent data access, which is a primary reason users would choose Google Drive.

**Independent Test**: Can be fully tested by selecting "Google Drive" storage, making a plan change, waiting for the save indicator to confirm completion, then opening the same file from Google Drive in another browser and verifying the changes are present.

**Acceptance Scenarios**:

1. **Given** the user has a plan open with "Google Drive" storage, **When** they modify any plan data, **Then** the changes are automatically saved to the Google Drive file within a reasonable time.
2. **Given** the user is offline when a change is made, **When** connectivity is restored, **Then** the pending changes are automatically saved to Google Drive.
3. **Given** the Google Drive authorization token has expired, **When** an autosave is attempted, **Then** the user is prompted to re-authorize, after which the save proceeds automatically.
4. **Given** a Google Drive save fails due to a network error, **When** the failure occurs, **Then** the user is notified with an option to retry.

---

### User Story 6 - Manual Save (Priority: P3)

Regardless of the active storage provider, users can trigger a manual save at any time via a keyboard shortcut or a "Save" button. This gives users confidence and control beyond relying solely on autosave.

**Why this priority**: Manual save is a safety net for users who want explicit control. While autosave handles the common case, manual save is important for high-stakes edits.

**Independent Test**: Can be fully tested by making a plan change, immediately triggering manual save before autosave fires, and confirming the data was written to the storage provider.

**Acceptance Scenarios**:

1. **Given** the user has unsaved changes, **When** they trigger a manual save (via keyboard shortcut or Save button), **Then** the changes are immediately saved to the active storage provider.
2. **Given** the user triggers manual save with no unsaved changes, **When** the save is requested, **Then** the system confirms the plan is already up to date.
3. **Given** manual save is triggered while autosave is also pending, **When** the save resolves, **Then** only one save operation executes (no duplicate writes).

---

### Edge Cases

- What happens when a user opens the app with no storage provider configured (e.g., first ever visit on a fresh browser)?
- What happens if the chosen local folder is deleted or moved after a plan is saved there?
- What happens if the selected Google Drive folder is deleted or access is revoked after saving?
- What happens if the user has two browser tabs open with the same plan file and makes conflicting changes?
- What happens when the user's Google Drive storage quota is full?
- What happens if the browser does not support local file system access (e.g., Safari with restricted permissions)?
- What happens when the user's Google authorization is revoked mid-session?
- What happens if the user cancels the storage picker after clicking "New" or "Open"?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a combined welcome screen when the app is opened in a new browser window or tab with no active session, offering "New Plan" and "Open Plan" as the two primary entry points before any plan data is shown. A page refresh within an active session MUST restore the current plan without showing the welcome screen.
- **FR-002**: Clicking "New Plan" on the welcome screen (or triggering "New" from within the app) MUST lead directly to a storage provider picker scoped to creating a new plan.
- **FR-003**: Clicking "Open Plan" on the welcome screen (or triggering "Open" from within the app) MUST lead directly to a storage provider picker scoped to opening an existing plan.
- **FR-004**: The storage provider selection dialog MUST offer exactly two options: "Local Computer" and "Google Drive".
- **FR-005**: When "Local Computer" is selected for a new plan or new session, the system MUST prompt the user to select a folder on their computer where the plan file will be stored.
- **FR-006**: When "Local Computer" is selected to open a plan, the system MUST allow the user to browse their computer's file system and select an existing plan file.
- **FR-007**: When "Google Drive" is selected, the system MUST initiate an authorization flow requesting only app-specific folder access — the minimal permission needed to read and write the app's own files in the user's Drive; no access to other Drive content is requested.
- **FR-008**: After Google Drive authorization, the system MUST automatically use the app's dedicated Drive folder for storage; no manual folder selection is required from the user. When opening, the system MUST show a list of plan files previously saved to that folder.
- **FR-009**: The system MUST automatically save the current plan to the chosen storage location using a debounced trigger — saving approximately 2 seconds after the last change, so that rapid consecutive edits are batched into a single write operation.
- **FR-010**: The system MUST display the current save status to the user at all times (e.g., "Saving...", "Saved", "Unsaved changes", "Save failed").
- **FR-011**: Users MUST be able to manually trigger a save of the current plan to the active storage provider at any time.
- **FR-012**: The system MUST notify the user if an autosave or manual save fails, and provide a way to retry.
- **FR-013**: When "Open" is selected and the user provides a plan file, the system MUST validate that the file is a valid financial plan before loading it.
- **FR-014**: When Google Drive authorization expires during a session, the system MUST prompt the user to re-authorize without losing unsaved changes.
- **FR-015**: The storage provider selection dialog MUST allow the user to cancel, returning to the current state without making any changes.
- **FR-016**: When Google Drive is selected and the user is offline, the system MUST queue pending saves and apply them when connectivity is restored.

### Key Entities

- **Storage Provider**: Represents a configured storage destination for a plan. Has a type (Local Computer or Google Drive), a location reference (folder path or Drive folder ID), and authorization state (for Google Drive).
- **Plan File**: The persisted representation of all financial plan data (goals, investments, logs). Has a name, storage provider reference, and last-saved timestamp.
- **Save Status**: Tracks the current persistence state of the open plan — values include: saved, saving, unsaved changes, save failed, offline-queued.
- **Authorization Token**: The credential allowing the app to access its dedicated app folder in the user's Google Drive. Scoped to app-specific folder only (not full Drive). Has an expiry time and can be refreshed silently when possible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the storage provider selection and begin working on a plan in under 60 seconds from first click.
- **SC-002**: Autosave completes within 4 seconds of the last change being made (2-second debounce + up to 2 seconds for write to complete) under normal conditions.
- **SC-003**: 100% of plan data written to the chosen storage provider is recoverable by reopening the file — no data loss during normal save/load cycles.
- **SC-004**: Users are never left with an ambiguous save state — save status is visible and accurate at all times.
- **SC-005**: When offline and using Google Drive, no data is lost — all changes made offline are successfully saved once connectivity returns.
- **SC-006**: The Google Drive authorization flow completes in under 2 minutes for a first-time user.
- **SC-007**: Opening an existing plan from either storage provider completes in under 5 seconds for typical plan file sizes.

## Assumptions

- The app currently lacks "New" and "Open" buttons in the UI; this feature introduces them as part of a new file management model.
- The existing localStorage-based autosave will be replaced by this new storage system. **No migration of existing localStorage data is provided** — users start fresh by creating a new plan or opening one from their chosen storage provider. Existing localStorage data is left in place but no longer used by the app.
- Plan files will be saved as `.json` files with a system-generated default name that can be changed later.
- The app runs in a browser environment; local computer file access uses browser-native file system APIs where supported.
- Google Drive integration uses the standard OAuth2 authorization flow with app-specific folder scope only; the app cannot access any other files or folders in the user's Drive.
- Users will have a Google account if they wish to use the Google Drive option.
- Only one plan file is open at a time per browser tab.
- Browsers that do not support local file system access (limited to read-only or no access) will only be able to use Google Drive; a clear message will inform affected users.
