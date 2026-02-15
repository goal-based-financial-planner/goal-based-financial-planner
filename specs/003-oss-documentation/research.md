# Research: Open Source Documentation Standards

**Feature**: 003-oss-documentation
**Date**: 2026-02-15
**Purpose**: Research best practices and standards for open source project documentation

## Research Topics

### 1. README.md Structure for Open Source Projects

**Decision**: Follow GitHub's recommended README structure with these sections:
1. Project Title + Badges (at top)
2. Description (what/why/who)
3. Live Demo / Quick Links
4. Features
5. Getting Started (Prerequisites, Installation, Usage)
6. Running Tests
7. Contributing
8. License
9. Acknowledgments (optional)

**Rationale**:
- GitHub community standards recognize this structure
- Matches successful OSS project patterns (React, Vue, etc.)
- Front-loads critical information (badges, demo link) for quick assessment
- Progressive disclosure: overview → getting started → advanced topics

**Alternatives considered**:
- Minimal README with links to wiki: Rejected - adds friction, wiki not always discoverable
- Single-page comprehensive guide: Rejected - too long, better to split into /docs guides

**Implementation notes**:
- Current README has basic structure; needs badges at top, clearer sections
- Badge order: CI status, coverage, license, version
- Link to /docs for detailed guides

---

### 2. GitHub Actions Badge Markdown Syntax

**Decision**: Use GitHub Actions workflow status badge with this format:
```markdown
![CI](https://github.com/goal-based-financial-planner/goal-based-financial-planner/actions/workflows/ci.yml/badge.svg)
```

**Rationale**:
- Native GitHub integration, no external service dependencies
- Automatically updates on every workflow run
- Works with existing ci.yml workflow (already present in repository)
- Standard format recognized by GitHub

**Alternatives considered**:
- shields.io custom badges: Rejected - adds external dependency
- Multiple status badges per job: Rejected - clutters README, single CI status sufficient

**Implementation notes**:
- Workflow file must be in default branch (main) for badge to work
- Badge URL format: `https://github.com/{owner}/{repo}/actions/workflows/{workflow-file}/badge.svg`
- Can add branch parameter: `badge.svg?branch=main`
- For coverage badge, integrate with Codecov or use shields.io with GitHub Actions artifact

---

### 3. CONTRIBUTING.md Structure and Content

**Decision**: Structure CONTRIBUTING.md with these sections:
1. Welcome message (encourage contribution)
2. Code of Conduct reference (link to CODE_OF_CONDUCT.md)
3. How to Contribute
   - Reporting bugs (issue template reference)
   - Suggesting features (issue template reference)
   - Pull request process
4. Development Setup (link to /docs/DEVELOPMENT.md for details)
5. Coding Standards (reference to constitution.md if applicable)
6. Testing Requirements (link to /docs/TESTING.md)
7. Pull Request Checklist
8. Getting Help (where to ask questions)

**Rationale**:
- Reduces friction for new contributors by providing clear path
- Links to detailed guides prevent CONTRIBUTING.md from becoming too long
- PR checklist ensures quality submissions
- Explicit reference to Code of Conduct sets expectations

**Alternatives considered**:
- Inline all development setup: Rejected - too long, /docs/DEVELOPMENT.md is better place
- Wiki-based guide: Rejected - less discoverable, harder to keep in sync

**Implementation notes**:
- Keep tone welcoming and inclusive
- Use "we" language to build community
- Provide examples where helpful (good commit message, PR title)
- Reference existing CI/CD checks that PRs must pass

---

### 4. CODE_OF_CONDUCT.md - Contributor Covenant v2.1

**Decision**: Use Contributor Covenant v2.1 template verbatim with project-specific contact information

**Rationale**:
- Industry standard adopted by 200,000+ open source projects
- Legally reviewed and maintained by OSS community
- Recognized by GitHub (appears in community profile)
- Covers enforcement, reporting, scope comprehensively

**Alternatives considered**:
- Custom code of conduct: Rejected - risk of gaps, not legally vetted
- Citizen Code of Conduct: Rejected - less widely adopted
- No code of conduct: Rejected - essential for inclusive community

**Implementation notes**:
- Template available at: https://www.contributor-covenant.org/version/2/1/code_of_conduct/
- Customize enforcement contact email (use GitHub Security Advisories or project email)
- No modifications to core text (preserves legal integrity)

---

### 5. SECURITY.md Structure for GitHub Security Advisories

**Decision**: Structure SECURITY.md with:
1. Supported Versions (which versions receive security updates)
2. Reporting a Vulnerability
   - Use GitHub Security Advisories (primary)
   - Private disclosure process
   - Expected response time
3. Security Update Policy
   - How/when fixes are published
   - Notification mechanism (GitHub releases, advisories)

**Rationale**:
- GitHub Security Advisories provide built-in private disclosure workflow
- Native integration with CVE assignment
- Keeps security reports out of public issue tracker
- Standard format recognized by security researchers

**Alternatives considered**:
- Email-based reporting: Rejected - requires manual process, no CVE integration
- Public issue reporting: Rejected - exposes vulnerabilities before fix
- Both GitHub + email: Rejected - adds complexity, one channel sufficient

**Implementation notes**:
- GitHub Security Advisories URL: `https://github.com/{owner}/{repo}/security/advisories/new`
- Specify response SLA (e.g., "We aim to respond within 48 hours")
- For frontend-only app, security scope is limited (XSS, dependencies, etc.)
- Reference supported browser versions if applicable

---

### 6. /docs Directory Organization

**Decision**: Organize /docs directory with these core files:
1. `DEVELOPMENT.md` - Local environment setup
2. `ARCHITECTURE.md` - Codebase structure, design decisions
3. `TESTING.md` - Testing guide (unit, integration, coverage requirements)
4. `DEPLOYMENT.md` - Deployment process (local, staging, production)

**Rationale**:
- Separates concerns: setup vs architecture vs testing vs deployment
- Each file serves specific contributor journey stage
- Aligns with /docs being discoverable on GitHub
- Prevents README from becoming encyclopedia

**Alternatives considered**:
- Single DEVELOPER_GUIDE.md: Rejected - too long, hard to navigate
- Wiki-based docs: Rejected - harder to keep in sync with code
- Root-level files (DEVELOPMENT.md, etc.): Rejected - clutters repository root

**Implementation notes**:
- DEVELOPMENT.md: Prerequisites, npm install, npm start, troubleshooting
- ARCHITECTURE.md: Reference constitution.md, explain src/ structure, key dependencies (React, MUI)
- TESTING.md: Explain test:cov, coverage thresholds, how to write tests
- DEPLOYMENT.md: GitHub Pages deployment, environment variables (if any)

---

### 7. Coverage Badge Integration

**Decision**: Add coverage badge using one of these approaches:
- **Option A (Recommended)**: Use Codecov integration with GitHub Actions
- **Option B (Simpler)**: Use shields.io dynamic badge reading from coverage artifact

**Rationale**:
- Coverage visibility encourages test contributions
- Complements CI status badge
- Existing ci.yml already uploads coverage artifact

**Implementation notes** (for Option B - simpler approach):
```markdown
![Coverage](https://img.shields.io/badge/coverage-check%20CI%20report-blue)
```
Or integrate Codecov for automatic coverage tracking:
```markdown
[![codecov](https://codecov.io/gh/goal-based-financial-planner/goal-based-financial-planner/branch/main/graph/badge.svg)](https://codecov.io/gh/goal-based-financial-planner/goal-based-financial-planner)
```

**Alternatives considered**:
- No coverage badge: Rejected - loses visibility into test quality
- Manual coverage badge updates: Rejected - unsustainable

---

## Summary of Decisions

| Aspect | Decision | Key Reason |
|--------|----------|-----------|
| README structure | GitHub standard with badges at top | Industry best practice, front-loads critical info |
| CI badge | GitHub Actions workflow status | Native integration, auto-updates |
| CONTRIBUTING.md | Structured guide with /docs links | Clear path for contributors without overwhelming length |
| CODE_OF_CONDUCT | Contributor Covenant v2.1 verbatim | Industry standard, legally vetted |
| SECURITY.md | GitHub Security Advisories primary | Built-in private disclosure + CVE integration |
| /docs organization | 4 focused files (dev, arch, test, deploy) | Separates concerns, prevents bloat |
| Coverage badge | Codecov or shields.io | Encourages test contributions, complements CI badge |

---

## Implementation Priorities

Based on user story priorities (P1: README, P2: Governance files, P3: /docs guides):

1. **Phase 1 (P1)**: README.md enhancement
   - Add badges (CI, coverage, license)
   - Restructure sections
   - Add deployment link at top
   - Link to CONTRIBUTING.md, CODE_OF_CONDUCT.md

2. **Phase 2 (P2)**: Root-level governance files
   - CONTRIBUTING.md (with PR checklist)
   - CODE_OF_CONDUCT.md (Contributor Covenant v2.1)
   - SECURITY.md (GitHub Security Advisories)
   - Verify LICENSE (already exists as MIT)

3. **Phase 3 (P3)**: /docs guides
   - DEVELOPMENT.md (environment setup)
   - ARCHITECTURE.md (structure, decisions, constitution reference)
   - TESTING.md (coverage requirements, how to write tests)
   - DEPLOYMENT.md (GitHub Pages process)

---

## References

- GitHub Community Standards: https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions
- Contributor Covenant v2.1: https://www.contributor-covenant.org/version/2/1/code_of_conduct/
- GitHub Security Advisories: https://docs.github.com/en/code-security/security-advisories
- GitHub Actions Badge: https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge
- README Best Practices: https://github.com/hackergrrl/art-of-readme
