# Data Model: Documentation Structure

**Feature**: 003-oss-documentation
**Date**: 2026-02-15
**Note**: For this documentation-only feature, "data model" refers to the structure and relationships of documentation files rather than application data.

## Documentation Entities

### 1. README.md (Primary Entry Point)

**Location**: Repository root
**Purpose**: First point of contact for visitors; provides overview and navigation
**Status**: Exists (needs enhancement)

**Structure**:
```markdown
# Title
[Badges: CI, Coverage, License, Pages]

## Description
[What, Why, Who - 2-3 paragraphs]

## Live Demo
[Link to GitHub Pages deployment]

## Features
[Bullet list of key capabilities]

## Getting Started
### Prerequisites
### Installation
### Usage

## Running Tests
[npm test, npm run test:cov]

## Contributing
[Link to CONTRIBUTING.md]

## License
[Link to LICENSE]

## Acknowledgments
[Optional: Credits, inspiration]
```

**Dependencies**:
- Links to: LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md, /docs guides
- References: .github/workflows/ci.yml (for badge), GitHub Pages deployment

**Validation Rules**:
- Must have badges at top (CI, coverage, license)
- Must link to GitHub Pages deployment prominently
- Must reference all governance files
- Must be formatted with Prettier

---

### 2. LICENSE (Legal Document)

**Location**: Repository root
**Purpose**: Define legal terms for project use
**Status**: Exists (verify MIT License content)

**Structure**:
```text
MIT License

Copyright (c) [year] [fullname]

[Standard MIT License text]
```

**Dependencies**: None (standalone)
**Referenced by**: README.md, CONTRIBUTING.md badges

**Validation Rules**:
- Must be MIT License (per clarification)
- Must include copyright year and owner
- Must use standard MIT text (no modifications)

---

### 3. CONTRIBUTING.md (Contribution Guide)

**Location**: Repository root
**Purpose**: Guide contributors through development and PR process
**Status**: Does not exist (new file)

**Structure**:
```markdown
# Contributing to Goal Based Financial Planner

## Welcome
[Welcoming message]

## Code of Conduct
[Link to CODE_OF_CONDUCT.md]

## How to Contribute
### Reporting Bugs
### Suggesting Features
### Pull Request Process

## Development Setup
[Brief overview, link to /docs/DEVELOPMENT.md]

## Coding Standards
[Reference to .specify/memory/constitution.md principles]

## Testing Requirements
[Link to /docs/TESTING.md, mention coverage thresholds]

## Pull Request Checklist
- [ ] Tests pass (npm run test:cov)
- [ ] Code formatted (Prettier)
- [ ] No console.log statements
- [ ] Documentation updated if needed

## Getting Help
[Where to ask questions - GitHub Discussions or Issues]
```

**Dependencies**:
- Links to: CODE_OF_CONDUCT.md, /docs/DEVELOPMENT.md, /docs/TESTING.md, constitution.md
- References: .github/workflows/ci.yml (CI checks mentioned)

**Validation Rules**:
- Must reference Code of Conduct prominently
- Must include PR checklist matching CI requirements
- Must link to detailed /docs guides
- Must maintain welcoming, inclusive tone

---

### 4. CODE_OF_CONDUCT.md (Community Standards)

**Location**: Repository root
**Purpose**: Define expected behavior and enforcement policies
**Status**: Does not exist (new file)

**Structure**:
```markdown
# Contributor Covenant Code of Conduct

## Our Pledge
[Standard Contributor Covenant v2.1 text]

## Our Standards
[Standard text]

## Enforcement Responsibilities
[Standard text]

## Scope
[Standard text]

## Enforcement
[Standard text]

## Enforcement Guidelines
[Standard text]

## Attribution
[Reference to Contributor Covenant v2.1]
```

**Dependencies**: None (standalone)
**Referenced by**: CONTRIBUTING.md, README.md

**Validation Rules**:
- Must be Contributor Covenant v2.1 verbatim (per clarification)
- Must customize contact email for enforcement
- No modifications to core text

---

### 5. SECURITY.md (Security Policy)

**Location**: Repository root
**Purpose**: Define security vulnerability reporting process
**Status**: Does not exist (new file)

**Structure**:
```markdown
# Security Policy

## Supported Versions
[Table of versions receiving security updates]

## Reporting a Vulnerability
[GitHub Security Advisories process]
[Expected response time]

## Security Update Policy
[How fixes are published]
[Notification mechanism]
```

**Dependencies**:
- References: GitHub Security Advisories feature
- May link to: /docs/DEPLOYMENT.md (for supported versions)

**Validation Rules**:
- Must use GitHub Security Advisories as primary channel (per clarification)
- Must specify response SLA
- Must define supported versions clearly

---

### 6. /docs/DEVELOPMENT.md (Development Setup Guide)

**Location**: docs/DEVELOPMENT.md
**Purpose**: Guide new contributors through environment setup
**Status**: Does not exist (new file)

**Structure**:
```markdown
# Development Guide

## Prerequisites
[Node.js version, npm, git]

## Initial Setup
[Clone, npm install]

## Running Locally
[npm start, accessing localhost:3000]

## Project Structure
[Brief overview, link to ARCHITECTURE.md]

## Common Tasks
[Creating components, adding tests, etc.]

## Troubleshooting
[Common issues and solutions]
```

**Dependencies**:
- Links to: /docs/ARCHITECTURE.md, /docs/TESTING.md
- References: package.json (for scripts)

**Validation Rules**:
- Must work for contributor with no prior project knowledge
- Must include troubleshooting section
- Must reference constitution.md principles

---

### 7. /docs/ARCHITECTURE.md (Codebase Structure)

**Location**: docs/ARCHITECTURE.md
**Purpose**: Explain project structure and design decisions
**Status**: Does not exist (new file)

**Structure**:
```markdown
# Architecture

## Project Overview
[React + TypeScript, pure frontend]

## Directory Structure
[src/, components/, pages/, domain/]

## Constitution Principles
[Reference to .specify/memory/constitution.md]
[Key principles: Clear Layering, Feature Co-location, etc.]

## Key Dependencies
[React, Material-UI, testing libraries]

## Design Decisions
[Why certain patterns were chosen]

## State Management
[How state is handled]
```

**Dependencies**:
- References: .specify/memory/constitution.md, package.json, src/ structure

**Validation Rules**:
- Must reference constitution principles
- Must explain directory structure rationale
- Must document major design decisions

---

### 8. /docs/TESTING.md (Testing Guide)

**Location**: docs/TESTING.md
**Purpose**: Explain testing approach and requirements
**Status**: Does not exist (new file)

**Structure**:
```markdown
# Testing Guide

## Overview
[Testing philosophy, Jest + React Testing Library]

## Running Tests
[npm test, npm run test:cov]

## Coverage Requirements
[70% lines, 60% branches, 70% functions]

## Writing Tests
[Examples, best practices]

## Test Structure
[Where to put tests, naming conventions]

## Troubleshooting
[Common testing issues]
```

**Dependencies**:
- References: package.json (test scripts), .github/workflows/ci.yml (CI testing)

**Validation Rules**:
- Must document coverage thresholds (matches package.json config)
- Must include examples
- Must explain CI test execution

---

### 9. /docs/DEPLOYMENT.md (Deployment Guide)

**Location**: docs/DEPLOYMENT.md
**Purpose**: Explain deployment process
**Status**: Does not exist (new file)

**Structure**:
```markdown
# Deployment Guide

## GitHub Pages Deployment
[Automatic deployment from main branch]
[Workflow: .github/workflows/deploy.yml]

## Local Production Build
[npm run build, testing locally]

## Environment Configuration
[If any environment variables needed]

## Deployment Checklist
[Pre-deployment verification steps]
```

**Dependencies**:
- References: .github/workflows/deploy.yml, package.json (build script)

**Validation Rules**:
- Must document GitHub Pages deployment process
- Must explain how to test production build locally
- Must include deployment checklist

---

## Documentation Dependency Graph

```text
README.md (entry point)
├── Links to → LICENSE
├── Links to → CONTRIBUTING.md
│   ├── Links to → CODE_OF_CONDUCT.md
│   ├── Links to → /docs/DEVELOPMENT.md
│   │   └── Links to → /docs/ARCHITECTURE.md
│   └── Links to → /docs/TESTING.md
├── References → SECURITY.md
├── References → .github/workflows/ci.yml (badges)
└── Links to → GitHub Pages deployment

/docs/ARCHITECTURE.md
└── References → .specify/memory/constitution.md

/docs/DEPLOYMENT.md
└── References → .github/workflows/deploy.yml
```

## File Creation Order (Implementation Sequence)

Based on dependencies and user story priorities:

1. **Phase 1 (P2 - Governance Files)**:
   - LICENSE (verify existing)
   - CODE_OF_CONDUCT.md (standalone, no dependencies)
   - SECURITY.md (standalone, no dependencies)
   - CONTRIBUTING.md (depends on CODE_OF_CONDUCT.md, links to /docs)

2. **Phase 2 (P3 - /docs Guides)**:
   - /docs/ARCHITECTURE.md (depends on constitution.md, referenced by DEVELOPMENT.md)
   - /docs/TESTING.md (standalone)
   - /docs/DEPLOYMENT.md (standalone)
   - /docs/DEVELOPMENT.md (depends on ARCHITECTURE.md, TESTING.md)

3. **Phase 3 (P1 - README Enhancement)**:
   - README.md (depends on all other files being ready to link)

**Rationale**: README comes last because it links to all other documentation. Creating governance files and guides first ensures README has complete navigation.

---

## Validation Checklist

After implementation, verify:

- [ ] All files formatted with Prettier
- [ ] All internal links resolve (no broken references)
- [ ] External links (GitHub Pages, badges) are functional
- [ ] GitHub community profile shows 100% completeness
- [ ] All files follow markdown best practices (headers, lists, code blocks)
- [ ] Contributor Covenant v2.1 text unmodified
- [ ] MIT License text standard and complete
- [ ] All /docs guides are discoverable from README or CONTRIBUTING.md
