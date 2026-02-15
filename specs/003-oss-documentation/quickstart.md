# Quickstart: Implementing OSS Documentation Standards

**Feature**: 003-oss-documentation
**Branch**: `003-oss-documentation`
**Estimated Time**: 2-3 hours (across multiple PRs)

## Overview

This guide provides step-by-step instructions for implementing open source documentation standards for the Goal Based Financial Planner repository. The implementation is divided into three phases aligned with user story priorities.

## Prerequisites

Before starting:
- [ ] You are on the `003-oss-documentation` branch
- [ ] You have read [spec.md](spec.md), [plan.md](plan.md), and [research.md](research.md)
- [ ] You have reviewed the templates in [contracts/](contracts/)

## Implementation Phases

### Phase 1: Root-Level Governance Files (Priority P2)

**Goal**: Add standard OSS files (CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md)
**Time**: ~45 minutes

#### Step 1.1: Verify LICENSE File

```bash
# Check if LICENSE exists and is MIT
cat LICENSE
```

**Action**:
- If LICENSE is missing or not MIT, create/update it using standard MIT License text
- Update copyright year to current year
- Update copyright holder to "Goal Based Financial Planner Contributors"

**Reference**: Standard MIT License template

#### Step 1.2: Create CODE_OF_CONDUCT.md

```bash
# Create CODE_OF_CONDUCT.md in repository root
```

**Action**:
1. Use Contributor Covenant v2.1 template verbatim
2. Download from: https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md
3. Customize only the enforcement contact section (leave core text unchanged)
4. Save to root as `CODE_OF_CONDUCT.md`

**Validation**:
```bash
# File should be ~4KB, standard Contributor Covenant format
ls -lh CODE_OF_CONDUCT.md
```

**Reference**: [contracts/contributing-template.md](contracts/contributing-template.md) for Code of Conduct reference

#### Step 1.3: Create SECURITY.md

```bash
# Create SECURITY.md in repository root
```

**Action**:
1. Use the template from [contracts/security-template.md](contracts/security-template.md)
2. Update supported versions table to match current version (0.1.x)
3. Ensure GitHub Security Advisories URL is correct
4. Customize response SLA (recommend: 48 hours acknowledgment, 5 days assessment)
5. Save to root as `SECURITY.md`

**Validation**:
```bash
# Verify GitHub Security Advisories link format
grep "security/advisories/new" SECURITY.md
```

**Reference**: [contracts/security-template.md](contracts/security-template.md)

#### Step 1.4: Create CONTRIBUTING.md

```bash
# Create CONTRIBUTING.md in repository root
```

**Action**:
1. Use the template from [contracts/contributing-template.md](contracts/contributing-template.md)
2. Ensure all links work:
   - CODE_OF_CONDUCT.md (just created)
   - docs/DEVELOPMENT.md (will create in Phase 2)
   - docs/TESTING.md (will create in Phase 2)
   - .specify/memory/constitution.md (exists)
3. Update coverage thresholds to match package.json (70% lines, 60% branches, 70% functions)
4. Include PR checklist
5. Save to root as `CONTRIBUTING.md`

**Validation**:
```bash
# Check that all referenced files exist or will be created
grep -o '\[.*\](.*\.md)' CONTRIBUTING.md
```

**Reference**: [contracts/contributing-template.md](contracts/contributing-template.md)

#### Step 1.5: Commit Phase 1

```bash
git add LICENSE CODE_OF_CONDUCT.md SECURITY.md CONTRIBUTING.md
git commit -m "Add OSS governance files (LICENSE, CoC, SECURITY, CONTRIBUTING)

- Add Contributor Covenant v2.1 Code of Conduct
- Add SECURITY.md with GitHub Security Advisories process
- Add CONTRIBUTING.md with PR process and constitution reference
- Verify LICENSE is MIT

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Phase 2: /docs Development Guides (Priority P3)

**Goal**: Create detailed development guides in /docs directory
**Time**: ~1 hour

#### Step 2.1: Create /docs Directory

```bash
mkdir -p docs
```

#### Step 2.2: Create docs/ARCHITECTURE.md

**Action**:
1. Use outline from [contracts/docs-structure.md](contracts/docs-structure.md) section 2
2. Document actual project structure from `src/` directory
3. Reference `.specify/memory/constitution.md` principles
4. Explain key dependencies: React, TypeScript, Material-UI
5. Document design decisions: Clear Layering, Feature Co-location, Type Safety
6. Save to `docs/ARCHITECTURE.md`

**Content to include**:
- Project overview (React + TypeScript, pure frontend)
- Directory structure with explanations
- Constitution principles (link to `.specify/memory/constitution.md`)
- Key dependencies and why they were chosen
- State management approach (local state + localStorage, no Redux)

**Validation**:
```bash
# Verify constitution reference works
grep "\.specify/memory/constitution\.md" docs/ARCHITECTURE.md
```

#### Step 2.3: Create docs/TESTING.md

**Action**:
1. Use outline from [contracts/docs-structure.md](contracts/docs-structure.md) section 3
2. Document testing approach: Jest + React Testing Library
3. Explain coverage requirements (70% lines, 60% branches, 70% functions)
4. Provide examples of unit tests and component tests
5. Include troubleshooting section
6. Save to `docs/TESTING.md`

**Content to include**:
- How to run tests (`npm test`, `npm run test:cov`)
- Coverage thresholds and why they matter
- Example test structure
- Best practices (test behavior, not implementation)
- Common troubleshooting (async tests, mocking)

**Validation**:
```bash
# Verify coverage thresholds match package.json
npm run test:cov --help | grep -A5 "coverage"
```

#### Step 2.4: Create docs/DEPLOYMENT.md

**Action**:
1. Use outline from [contracts/docs-structure.md](contracts/docs-structure.md) section 4
2. Document GitHub Pages deployment process
3. Explain `.github/workflows/deploy.yml` workflow
4. Include local production build instructions
5. Add deployment checklist
6. Save to `docs/DEPLOYMENT.md`

**Content to include**:
- GitHub Pages automatic deployment (main branch)
- Workflow file reference (`.github/workflows/deploy.yml`)
- Local production build (`npm run build`, testing with `serve`)
- Deployment verification steps

**Validation**:
```bash
# Verify deploy.yml workflow exists
ls -la .github/workflows/deploy.yml
```

#### Step 2.5: Create docs/DEVELOPMENT.md

**Action**:
1. Use template from [contracts/docs-structure.md](contracts/docs-structure.md) section 1
2. Include prerequisites (Node.js v18+, npm, git)
3. Provide setup instructions (clone, install, run)
4. Document project structure overview
5. Include common tasks and troubleshooting
6. Link to ARCHITECTURE.md and TESTING.md
7. Save to `docs/DEVELOPMENT.md`

**Content to include**:
- Prerequisites with version requirements
- Initial setup steps
- Running the application (dev and production)
- Project structure overview (link to ARCHITECTURE.md)
- Development workflow
- Common tasks (creating components, running tests)
- Troubleshooting common issues

**Validation**:
```bash
# Test that commands in DEVELOPMENT.md actually work
cd /tmp
git clone https://github.com/goal-based-financial-planner/goal-based-financial-planner.git test-repo
cd test-repo
npm install
npm run build
cd -
rm -rf /tmp/test-repo
```

#### Step 2.6: Commit Phase 2

```bash
git add docs/
git commit -m "Add development guides in /docs directory

- Add ARCHITECTURE.md with constitution reference
- Add TESTING.md with coverage requirements
- Add DEPLOYMENT.md with GitHub Pages process
- Add DEVELOPMENT.md with setup guide

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Phase 3: README Enhancement (Priority P1)

**Goal**: Enhance README.md with badges, better structure, and links
**Time**: ~30 minutes

#### Step 3.1: Add Badges to README

**Action**:
1. Open `README.md`
2. Add badges immediately after the title:

```markdown
# Goal Based Financial Planner

![CI](https://github.com/goal-based-financial-planner/goal-based-financial-planner/actions/workflows/ci.yml/badge.svg)
[![Coverage](https://img.shields.io/badge/coverage-check%20CI%20report-blue)](coverage/)
[![License](https://img.shields.io/github/license/goal-based-financial-planner/goal-based-financial-planner)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)
```

**Validation**:
```bash
# Verify badges render correctly (check in GitHub after push)
# Ensure ci.yml workflow file exists
ls -la .github/workflows/ci.yml
```

#### Step 3.2: Restructure README Content

**Action**:
1. Follow structure from [contracts/readme-structure.md](contracts/readme-structure.md)
2. Add "Live Demo" section prominently after description
3. Improve "Getting Started" with clear prerequisites
4. Enhance "Running Tests" with coverage explanation
5. Add "Contributing" section with links to CONTRIBUTING.md and CODE_OF_CONDUCT.md
6. Ensure "License" section links to LICENSE file
7. Remove any placeholder text (e.g., "yourusername")

**Sections in order**:
1. Title + Badges
2. Description
3. Live Demo (prominent)
4. Features (bullet list)
5. Getting Started (Prerequisites, Installation, Usage)
6. Running Tests (with coverage info)
7. Contributing (link to CONTRIBUTING.md, reference Code of Conduct)
8. License

**Reference**: [contracts/readme-structure.md](contracts/readme-structure.md)

#### Step 3.3: Validate All Links

```bash
# Check all internal links in README
grep -o '\[.*\](.*\.md)' README.md

# Verify files exist
ls -la CONTRIBUTING.md CODE_OF_CONDUCT.md LICENSE SECURITY.md
ls -la docs/DEVELOPMENT.md docs/ARCHITECTURE.md docs/TESTING.md docs/DEPLOYMENT.md
```

#### Step 3.4: Format with Prettier

```bash
# Format all markdown files
npx prettier --write "*.md" "docs/*.md"
```

#### Step 3.5: Commit Phase 3

```bash
git add README.md
git commit -m "Enhance README with badges, structure, and OSS links

- Add CI, coverage, license, and GitHub Pages badges
- Restructure sections for better clarity
- Add prominent Live Demo section
- Link to CONTRIBUTING.md and CODE_OF_CONDUCT.md
- Improve Getting Started and Testing sections
- Remove placeholder text

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Final Validation

Before creating pull request, verify:

### Checklist

- [ ] All files created: LICENSE, CODE_OF_CONDUCT.md, SECURITY.md, CONTRIBUTING.md
- [ ] All /docs guides created: DEVELOPMENT.md, ARCHITECTURE.md, TESTING.md, DEPLOYMENT.md
- [ ] README.md enhanced with badges and proper structure
- [ ] All internal links resolve correctly
- [ ] All commands in documentation are tested and work
- [ ] Files formatted with Prettier (`npx prettier --check "*.md" "docs/*.md"`)
- [ ] No placeholder text remains (e.g., "yourusername", "YOUR-USERNAME")
- [ ] GitHub community profile shows increased completeness

### Test Commands

```bash
# Run these to verify everything works
npm install           # Should complete successfully
npm run build         # Should build without errors
npm run test:cov      # Should pass coverage thresholds
npx prettier --check "*.md" "docs/*.md"  # All markdown formatted
```

### GitHub Community Profile Check

1. Go to: `https://github.com/goal-based-financial-planner/goal-based-financial-planner/community`
2. Verify checklist items are checked:
   - [x] Description
   - [x] README
   - [x] Code of Conduct
   - [x] Contributing
   - [x] License
   - [x] Security Policy

---

## Creating Pull Request

Once all phases are committed:

```bash
# Push branch to remote
git push origin 003-oss-documentation

# Create PR via GitHub CLI (optional)
gh pr create \
  --title "Add open source documentation standards" \
  --body "$(cat <<'EOF'
## Summary
Establishes comprehensive OSS documentation standards for the repository.

## Changes
- ✅ Added standard OSS governance files (CODE_OF_CONDUCT.md, SECURITY.md, CONTRIBUTING.md)
- ✅ Created /docs guides (DEVELOPMENT.md, ARCHITECTURE.md, TESTING.md, DEPLOYMENT.md)
- ✅ Enhanced README with badges, better structure, and links
- ✅ All documentation formatted with Prettier
- ✅ GitHub community profile completeness: 100%

## Testing
- All commands in documentation tested and work
- All internal links resolve correctly
- Prettier formatting verified

## Checklist
- [x] Documentation is clear and accessible
- [x] All links work
- [x] No placeholder text remains
- [x] Follows Contributor Covenant v2.1 (unmodified)
- [x] GitHub Security Advisories referenced
- [x] Constitution principles referenced

Closes #[issue-number]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" \
  --base main
```

Or create PR manually through GitHub web interface.

---

## Post-Merge Verification

After PR is merged to main:

1. **Verify badges work**:
   - Visit README on main branch
   - Ensure CI badge shows status
   - Ensure GitHub Pages badge links to live deployment

2. **Check GitHub community profile**:
   - Should show 100% completeness
   - All OSS files recognized

3. **Test documentation**:
   - Have a new contributor follow DEVELOPMENT.md
   - Verify they can set up and run the app

4. **Monitor for issues**:
   - Watch for feedback from contributors
   - Update documentation based on real usage

---

## Troubleshooting

### Badge Not Showing

- **CI badge 404**: Ensure `ci.yml` workflow has run at least once on main branch
- **Coverage badge**: May need to integrate Codecov separately or use shields.io
- **License badge**: Ensure LICENSE file exists and is recognized by GitHub

### Links Broken

- **Relative links**: Ensure paths are correct from file location
- **Case sensitivity**: GitHub is case-sensitive; match exact filenames

### GitHub Community Profile Not 100%

- Ensure all files are in repository root (not in subdirectories)
- File names must match exactly: `CODE_OF_CONDUCT.md`, not `code-of-conduct.md`
- Wait a few minutes for GitHub to update (cache refresh)

### Prettier Formatting Fails

```bash
# Fix formatting issues automatically
npx prettier --write "*.md" "docs/*.md"
```

---

## Time Estimates

| Phase | Time | Commits |
|-------|------|---------|
| Phase 1: Governance files | 45 min | 1 commit |
| Phase 2: /docs guides | 1 hour | 1 commit |
| Phase 3: README enhancement | 30 min | 1 commit |
| **Total** | **2-3 hours** | **3 commits** |

**Recommendation**: Implement all phases in a single PR with multiple commits, or split into separate PRs if preferred (e.g., P2 governance first, then P3 guides, then P1 README).

---

## Success Criteria

Implementation is complete when:

- ✅ All 8 documentation files exist and are complete
- ✅ GitHub community profile shows 100% completeness
- ✅ All badges display correctly on README
- ✅ New contributor can follow DEVELOPMENT.md to set up project
- ✅ All internal documentation links resolve
- ✅ Files formatted with Prettier
- ✅ No placeholder or outdated content remains

---

## Next Steps

After implementation:
1. Run `/speckit.tasks` to generate task breakdown
2. Optionally run `/speckit.analyze` to verify consistency
3. Create PR and get review
4. Merge to main
5. Celebrate improved OSS standards! 🎉
