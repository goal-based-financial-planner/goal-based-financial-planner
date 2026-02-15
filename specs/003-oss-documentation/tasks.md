---
description: "Task list for implementing open source documentation standards"
---

# Tasks: Open Source Project Documentation Standards

**Input**: Design documents from `/specs/003-oss-documentation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature does not include automated tests. Validation is done through manual review against GitHub community standards checklist and testing documentation commands.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a documentation-only feature. All paths are at repository root or in the new `docs/` directory.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal setup for documentation feature - verify tooling exists

- [ ] T001 Verify Prettier is configured for markdown files (.prettierrc exists)
- [ ] T002 Create docs/ directory in repository root
- [ ] T003 [P] Verify LICENSE file exists and is MIT License (update if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure verification before documentation work begins

**⚠️ NOTE**: For this documentation feature, there are minimal foundational requirements. Main prerequisite is having git repository and development environment from quickstart.md

- [ ] T004 Verify GitHub repository exists at https://github.com/goal-based-financial-planner/goal-based-financial-planner
- [ ] T005 Verify .github/workflows/ci.yml exists (needed for build status badge)
- [ ] T006 Verify .github/workflows/deploy.yml exists (needed for deployment reference)
- [ ] T007 Verify package.json test scripts exist (npm test, npm run test:cov)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 2 - Understanding Project Standards and Governance (Priority: P2) 🎯 RECOMMENDED FIRST

> **IMPLEMENTATION NOTE**: While this is P2, we recommend implementing it BEFORE P1 (README) because README will link to these governance files. This maintains the independent testability of each story while following logical dependency order.

**Goal**: Establish legal clarity and community standards through standard OSS governance files (LICENSE, CODE_OF_CONDUCT.md, SECURITY.md, CONTRIBUTING.md)

**Independent Test**: Check for presence and completeness of standard OSS files. Visit repository on GitHub and verify each file exists and follows community standards. Deliverable: Legal compliance review enabled and contributor expectations established.

### Implementation for User Story 2

- [ ] T008 [P] [US2] Verify LICENSE file contains MIT License text in LICENSE
- [ ] T009 [P] [US2] Create CODE_OF_CONDUCT.md using Contributor Covenant v2.1 template in CODE_OF_CONDUCT.md
- [ ] T010 [P] [US2] Create SECURITY.md with GitHub Security Advisories process in SECURITY.md
- [ ] T011 [US2] Create CONTRIBUTING.md with contribution guidelines and PR process in CONTRIBUTING.md (depends on T009 for Code of Conduct reference)

**Validation for User Story 2**:
- [ ] T012 [US2] Verify CODE_OF_CONDUCT.md is Contributor Covenant v2.1 verbatim (no modifications to core text)
- [ ] T013 [US2] Verify SECURITY.md references GitHub Security Advisories as primary reporting channel
- [ ] T014 [US2] Verify CONTRIBUTING.md links to CODE_OF_CONDUCT.md, constitution.md, and /docs guides
- [ ] T015 [US2] Format all governance files with Prettier: `npx prettier --write "CODE_OF_CONDUCT.md" "SECURITY.md" "CONTRIBUTING.md"`

**Checkpoint**: At this point, User Story 2 (governance files) should be complete and verifiable independently by checking GitHub community profile

---

## Phase 4: User Story 3 - Setting Up Development Environment (Priority: P3) 🎯 RECOMMENDED SECOND

> **IMPLEMENTATION NOTE**: While this is P3, we recommend implementing it BEFORE P1 (README) because README and CONTRIBUTING.md will link to these /docs guides.

**Goal**: Provide comprehensive development guides that reduce onboarding friction and enable new contributors to set up environment, understand architecture, run tests, and deploy

**Independent Test**: New developer follows DEVELOPMENT.md and successfully runs tests locally within 10 minutes. Deliverable: "Time to first contribution" reduced without requiring other stories.

### Implementation for User Story 3

- [ ] T016 [P] [US3] Create docs/ARCHITECTURE.md with project structure and constitution reference in docs/ARCHITECTURE.md
- [ ] T017 [P] [US3] Create docs/TESTING.md with testing guide and coverage requirements in docs/TESTING.md
- [ ] T018 [P] [US3] Create docs/DEPLOYMENT.md with GitHub Pages deployment process in docs/DEPLOYMENT.md
- [ ] T019 [US3] Create docs/DEVELOPMENT.md with setup guide and links to other /docs files in docs/DEVELOPMENT.md (depends on T016, T017, T018 for cross-references)

**Validation for User Story 3**:
- [ ] T020 [US3] Verify docs/ARCHITECTURE.md references .specify/memory/constitution.md correctly
- [ ] T021 [US3] Verify docs/TESTING.md coverage thresholds match package.json (70% lines, 60% branches, 70% functions)
- [ ] T022 [US3] Verify docs/DEPLOYMENT.md references .github/workflows/deploy.yml correctly
- [ ] T023 [US3] Test all commands in docs/DEVELOPMENT.md (npm install, npm start, npm test, npm run build)
- [ ] T024 [US3] Verify all internal links in /docs guides resolve correctly
- [ ] T025 [US3] Format all /docs files with Prettier: `npx prettier --write "docs/*.md"`

**Checkpoint**: At this point, User Story 3 (/docs guides) should be complete and testable independently by following DEVELOPMENT.md

---

## Phase 5: User Story 1 - First-Time Visitor Understanding Project (Priority: P1) 🎯 MVP

> **IMPLEMENTATION NOTE**: This is P1 (highest priority) but should be implemented AFTER P2 and P3 so README can link to complete governance files and /docs guides. However, it remains the MVP because it delivers immediate value (project discoverability).

**Goal**: Enhance README to be the first impression that helps visitors quickly understand project purpose, see build status, access live demo, and navigate to detailed documentation

**Independent Test**: New visitor views README on GitHub and within 30 seconds can answer: "What is this project?", "Who is it for?", "How do I try it?". Deliverable: Improved project discoverability and adoption.

### Implementation for User Story 1

- [ ] T026 [P] [US1] Add CI workflow status badge to README.md (references .github/workflows/ci.yml)
- [ ] T027 [P] [US1] Add coverage badge to README.md
- [ ] T028 [P] [US1] Add license badge to README.md (references LICENSE file)
- [ ] T029 [P] [US1] Add GitHub Pages deployment badge to README.md
- [ ] T030 [US1] Restructure README.md sections following contracts/readme-structure.md template in README.md
- [ ] T031 [US1] Add Live Demo section prominently after description in README.md
- [ ] T032 [US1] Enhance Getting Started section with clear prerequisites and steps in README.md
- [ ] T033 [US1] Enhance Running Tests section with coverage explanation in README.md
- [ ] T034 [US1] Add Contributing section with links to CONTRIBUTING.md and CODE_OF_CONDUCT.md in README.md
- [ ] T035 [US1] Update License section to link to LICENSE file in README.md
- [ ] T036 [US1] Remove all placeholder text (e.g., "yourusername") from README.md

**Validation for User Story 1**:
- [ ] T037 [US1] Verify all badges display correctly (not 404) on GitHub
- [ ] T038 [US1] Verify GitHub Pages badge links to actual deployment: https://goal-based-financial-planner.github.io/goal-based-financial-planner/
- [ ] T039 [US1] Verify all internal links in README.md resolve (CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE, SECURITY.md, docs/)
- [ ] T040 [US1] Verify ci.yml workflow badge shows status (workflow must run at least once on branch)
- [ ] T041 [US1] Test all commands in README.md Getting Started section work correctly
- [ ] T042 [US1] Format README.md with Prettier: `npx prettier --write "README.md"`

**Checkpoint**: All user stories should now be independently functional. README provides navigation to all documentation.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and improvements that affect multiple user stories

- [ ] T043 [P] Verify GitHub community profile shows 100% completeness at https://github.com/goal-based-financial-planner/goal-based-financial-planner/community
- [ ] T044 [P] Verify all documentation files are formatted with Prettier: `npx prettier --check "*.md" "docs/*.md"`
- [ ] T045 Test documentation with new contributor (have someone follow DEVELOPMENT.md from scratch)
- [ ] T046 [P] Verify all external links work (GitHub Pages deployment, GitHub Actions workflows)
- [ ] T047 Create git commits following quickstart.md guidance (3 commits: governance files, /docs guides, README)
- [ ] T048 Run final validation checklist from quickstart.md
- [ ] T049 Verify no placeholder text remains in any documentation file
- [ ] T050 Check GitHub repository Insights > Community Standards for completeness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - verifies existing infrastructure
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion
  - **Recommended order** (follows logical dependencies):
    1. User Story 2 (P2) - Governance files
    2. User Story 3 (P3) - /docs guides
    3. User Story 1 (P1) - README enhancement
  - **Priority order** (follows spec priorities):
    1. User Story 1 (P1) - README (but will have placeholder links initially)
    2. User Story 2 (P2) - Governance files
    3. User Story 3 (P3) - /docs guides
  - Choose based on preference: recommended order avoids placeholder links, priority order delivers MVP visibility faster
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
  - No hard dependencies, but README will link to files from US2 and US3
  - If implemented first: Use placeholder links or implement after US2/US3
  - **Independent test**: README badges and structure can be validated without other files

- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
  - No dependencies on other stories
  - **Independent test**: Governance files can be validated independently via GitHub community standards

- **User Story 3 (P3)**: Can start after Foundational (Phase 2)
  - Minimal dependency: ARCHITECTURE.md references constitution.md (already exists)
  - **Independent test**: /docs guides can be tested by following DEVELOPMENT.md setup steps

### Within Each User Story

**User Story 1 (P1)**:
- Badges (T026-T029) can run in parallel [P]
- README restructuring (T030) before adding sections (T031-T036)
- Validation (T037-T042) after implementation

**User Story 2 (P2)**:
- LICENSE, CODE_OF_CONDUCT, SECURITY can be created in parallel (T008-T010) [P]
- CONTRIBUTING.md (T011) depends on CODE_OF_CONDUCT existing for reference
- Validation (T012-T015) after implementation

**User Story 3 (P3)**:
- ARCHITECTURE, TESTING, DEPLOYMENT can be created in parallel (T016-T018) [P]
- DEVELOPMENT.md (T019) depends on other /docs files for cross-references
- Validation (T020-T025) after implementation

### Parallel Opportunities

- **Setup**: T001, T002, T003 can all run in parallel
- **Foundational**: T004-T007 are verification tasks, can run in parallel
- **User Story 1 badges**: T026, T027, T028, T029 can run in parallel (different badges)
- **User Story 2 files**: T008, T009, T010 can run in parallel (different files)
- **User Story 3 files**: T016, T017, T018 can run in parallel (different files)
- **Polish validation**: T043, T044, T046 can run in parallel (independent checks)
- **Different user stories** can be worked on in parallel by different team members after Foundational completes

---

## Parallel Example: User Story 2 (Governance Files)

```bash
# Launch all governance files in parallel (different files, no dependencies):
Task: "Create CODE_OF_CONDUCT.md using Contributor Covenant v2.1 template"
Task: "Create SECURITY.md with GitHub Security Advisories process"
Task: "Verify LICENSE file contains MIT License text"

# Then sequentially:
Task: "Create CONTRIBUTING.md with contribution guidelines" (needs CODE_OF_CONDUCT to exist)
```

---

## Parallel Example: User Story 3 (/docs Guides)

```bash
# Launch all /docs files in parallel (different files):
Task: "Create docs/ARCHITECTURE.md with project structure"
Task: "Create docs/TESTING.md with testing guide"
Task: "Create docs/DEPLOYMENT.md with GitHub Pages process"

# Then sequentially:
Task: "Create docs/DEVELOPMENT.md with setup guide" (cross-references other /docs files)
```

---

## Implementation Strategy

### MVP First (Recommended Order)

**Goal**: Deliver complete, polished documentation incrementally

1. **Complete Phase 1**: Setup (3 tasks, ~5 minutes)
2. **Complete Phase 2**: Foundational verification (4 tasks, ~5 minutes)
3. **Complete Phase 3**: User Story 2 - Governance files (8 tasks, ~45 minutes)
   - **VALIDATE**: Check GitHub community profile shows governance files
4. **Complete Phase 4**: User Story 3 - /docs guides (10 tasks, ~1 hour)
   - **VALIDATE**: Follow DEVELOPMENT.md and verify setup works
5. **Complete Phase 5**: User Story 1 - README enhancement (17 tasks, ~30 minutes)
   - **VALIDATE**: README displays correctly with all badges and links
6. **Complete Phase 6**: Polish (8 tasks, ~15 minutes)
7. **Create Pull Request**: Submit all changes together or in staged PRs

**Total Estimated Time**: 2-3 hours

### Alternative: Priority-First Order

If you prefer to follow spec priorities strictly:

1. Complete Setup + Foundational
2. Complete User Story 1 (README) → Note: Will have placeholder links
3. Complete User Story 2 (Governance) → Update README links
4. Complete User Story 3 (/docs) → Update README and CONTRIBUTING links
5. Polish

**Tradeoff**: More iterations updating links, but delivers visible README faster

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (10 minutes)
2. **Once Foundational is done, divide work**:
   - Developer A: User Story 2 (Governance files)
   - Developer B: User Story 3 (/docs guides)
   - Developer C: User Story 1 (README - can start but will need links from A & B)
3. **Merge strategy**:
   - Option 1: Three separate PRs (governance, docs, README) - easier review
   - Option 2: Single PR with 3 commits - cohesive delivery

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story is independently testable via acceptance scenarios in spec.md
- No automated tests for documentation - validation is manual review
- **Recommended implementation order** (US2 → US3 → US1) avoids placeholder links and follows dependency graph
- **Priority implementation order** (US1 → US2 → US3) delivers visible README faster but requires link updates
- Commit frequently (after each user story or phase)
- Use quickstart.md as detailed step-by-step guide
- Verify against contracts/ templates for each file type
- GitHub community profile is final validation metric (target: 100%)

---

## Success Criteria

Implementation is complete when:

- ✅ All 50 tasks completed
- ✅ GitHub community profile shows 100% completeness
- ✅ All badges display correctly on README
- ✅ New contributor can follow DEVELOPMENT.md to set up project within 10 minutes
- ✅ All internal documentation links resolve
- ✅ All files formatted with Prettier
- ✅ No placeholder or outdated content remains
- ✅ Each user story passes independent test criteria from spec.md

---

## Quick Reference

| Phase | Tasks | Est. Time | Key Deliverable |
|-------|-------|-----------|-----------------|
| Setup | T001-T003 | 5 min | docs/ directory created |
| Foundational | T004-T007 | 5 min | Infrastructure verified |
| US2 (P2) | T008-T015 | 45 min | Governance files complete |
| US3 (P3) | T016-T025 | 1 hour | /docs guides complete |
| US1 (P1) | T026-T042 | 30 min | README enhanced |
| Polish | T043-T050 | 15 min | Final validation |
| **TOTAL** | **50 tasks** | **2-3 hours** | **100% GitHub community standards** |
