# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version              | Supported          |
| -------------------- | ------------------ |
| latest (main branch) | :white_check_mark: |
| 0.1.x                | :white_check_mark: |
| < 0.1                | :x:                |

**Note**: As a pure frontend application deployed via GitHub Pages, we focus security updates on the latest release. Users should always use the live deployment at [https://goal-based-financial-planner.github.io/goal-based-financial-planner/](https://goal-based-financial-planner.github.io/goal-based-financial-planner/) for the most secure version.

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### Reporting Process

**Use GitHub Security Advisories** (recommended):

1. Go to [Security Advisories](https://github.com/goal-based-financial-planner/goal-based-financial-planner/security/advisories/new)
2. Click "Report a vulnerability"
3. Provide detailed information about the vulnerability
4. Submit the advisory

**What to include in your report:**

- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if you have one)
- Any proof-of-concept code

### What to Expect

- **Acknowledgment**: We aim to acknowledge receipt within **48 hours**
- **Assessment**: We will assess the severity and impact within **5 business days**
- **Updates**: We will keep you informed of our progress
- **Fix**: We will work on a fix and coordinate disclosure timing with you
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Disclosure Policy

- Please **do not** publicly disclose the vulnerability until we have released a fix
- We will work with you to coordinate disclosure timing
- Once fixed, we will publish a security advisory with details and credits

## Security Scope

As a pure frontend application, our security focus includes:

**In Scope:**

- Cross-Site Scripting (XSS) vulnerabilities
- Dependency vulnerabilities (npm packages)
- Client-side data leakage
- Input validation issues
- Authentication/authorization bypasses (if applicable)

**Out of Scope:**

- Issues in third-party services (report to the respective vendors)
- Social engineering attacks
- Denial of Service (DoS) attacks on GitHub Pages infrastructure
- Issues requiring physical access to a user's device

## Security Update Process

When we release a security fix:

1. **Patch Release**: We create a patch release with the fix
2. **GitHub Pages Update**: The fix is automatically deployed
3. **Security Advisory**: We publish a GitHub Security Advisory with:
   - Description of the vulnerability
   - Affected versions
   - Fixed version
   - Credits to the reporter
4. **Notification**: We notify users through:
   - GitHub Security Advisories (automatic for watchers)
   - Release notes
   - README update (if critical)

## Best Practices for Users

To stay secure:

- ✅ Use the live deployment (always up-to-date): [https://goal-based-financial-planner.github.io/goal-based-financial-planner/](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)
- ✅ Keep your browser updated
- ✅ Be cautious with browser extensions that may intercept data
- ✅ Review dependencies if running locally (`npm audit`)

## Contact

For security-related questions (not vulnerability reports), you can:

- Open a [Discussion](https://github.com/goal-based-financial-planner/goal-based-financial-planner/discussions)
- Create a non-sensitive [Issue](https://github.com/goal-based-financial-planner/goal-based-financial-planner/issues)

**For vulnerability reports, always use [GitHub Security Advisories](https://github.com/goal-based-financial-planner/goal-based-financial-planner/security/advisories/new).**

---

**Thank you for helping keep Goal Based Financial Planner secure!**
