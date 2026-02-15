# Deployment Guide

## Overview

Goal Based Financial Planner is deployed to **GitHub Pages**, a free static hosting service for GitHub repositories. The deployment process is fully automated via GitHub Actions, triggered on every push to the `main` branch.

**Live Deployment**: [https://goal-based-financial-planner.github.io/goal-based-financial-planner/](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

**Trigger**: Push to `main` branch

**Workflow**: `.github/workflows/deploy.yml`

**Process**:

1. Developer pushes code to `main` branch (or PR is merged)
2. GitHub Actions triggers the deploy workflow
3. Workflow runs:
   - `npm ci` - Install dependencies
   - `npm run build` - Create production build
   - `gh-pages -d build` - Deploy build directory to `gh-pages` branch
4. GitHub Pages serves the static files from `gh-pages` branch
5. Site is live at the deployment URL within 1-2 minutes

**Viewing deployment status**:

- Go to repository → Actions tab
- Find the latest "Deploy" workflow run
- Check for green checkmark (success) or red X (failure)

### Manual Deployment (Local)

If you need to deploy manually from your local machine:

```bash
# Ensure you're on the main branch
git checkout main
git pull origin main

# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

**What `npm run deploy` does**:

1. Runs `npm run build` (via `predeploy` script)
2. Runs `gh-pages -d build` - Pushes build directory to `gh-pages` branch
3. GitHub Pages automatically picks up the changes

**When to use manual deployment**:

- Testing deployment process locally
- Debugging deployment issues
- Automated workflow is broken

### Deployment Configuration

**Key configuration in `package.json`**:

```json
{
  "homepage": "https://goal-based-financial-planner.github.io/goal-based-financial-planner",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

- **`homepage`**: Base URL for the deployed app (affects routing and asset paths)
- **`predeploy`**: Runs automatically before `deploy` to ensure fresh build
- **`deploy`**: Deploys `build/` directory to `gh-pages` branch using `gh-pages` package

## Local Production Build

### Building for Production

```bash
npm run build
```

**Output**: `build/` directory with optimized static files

**What happens during build**:

1. TypeScript compilation
2. JavaScript bundling and minification (via Webpack)
3. CSS optimization and minification
4. Asset copying and hashing (for cache busting)
5. HTML generation with injected script/style tags

**Build artifacts**:

```text
build/
├── static/
│   ├── css/            # Minified CSS bundles
│   ├── js/             # Minified JavaScript bundles
│   └── media/          # Images, fonts, etc.
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest (future)
└── asset-manifest.json # Build metadata
```

### Testing Production Build Locally

After building, you can test the production build on your local machine:

```bash
# Option 1: Use serve package
npx serve -s build

# Option 2: Use Python SimpleHTTPServer
cd build
python3 -m http.server 3000

# Option 3: Use Node.js http-server
npx http-server build -p 3000
```

Then visit: [http://localhost:3000](http://localhost:3000)

**Why test locally?**

- Verify production optimizations don't break functionality
- Test routing with production base path
- Catch build-time issues before deploying

## Environment Configuration

### Current Setup (No Environment Variables)

Currently, the app has no environment-specific configuration. All settings are in source code:

- Theme configuration: `src/theme.ts`
- App constants: `src/domain/constants.ts`

### Adding Environment Variables (Future)

If you need environment-specific configuration in the future:

1. **Create `.env` file** (local development only, not committed):

   ```bash
   REACT_APP_API_URL=https://api.example.com
   REACT_APP_FEATURE_FLAG=true
   ```

2. **Access in code**:

   ```typescript
   const apiUrl = process.env.REACT_APP_API_URL;
   ```

3. **GitHub Actions secrets** (for production):
   - Go to repository Settings → Secrets and variables → Actions
   - Add secrets (e.g., `REACT_APP_API_URL`)
   - Reference in `.github/workflows/deploy.yml`:
     ```yaml
     env:
       REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
     ```

**Important**: Only variables prefixed with `REACT_APP_` are embedded in the build by Create React App.

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`npm run test:cov`)
- [ ] Code is linted (`npm run lint`)
- [ ] No console.log or debug statements in code
- [ ] Production build succeeds locally (`npm run build`)
- [ ] Production build tested locally (`npx serve -s build`)
- [ ] No sensitive data (API keys, credentials) in code or committed files
- [ ] README and documentation are up-to-date
- [ ] Commit messages are clear and descriptive

## Rollback Process

If a deployment introduces a critical bug:

### Option 1: Revert Commit and Redeploy

```bash
# Find the last working commit
git log --oneline

# Revert to that commit
git revert <bad-commit-hash>

# Push revert commit (triggers automatic deployment)
git push origin main
```

### Option 2: Manually Deploy Previous Version

```bash
# Checkout the last working commit
git checkout <good-commit-hash>

# Deploy manually
npm run deploy

# Return to main branch
git checkout main
```

### Option 3: Use GitHub Pages Settings

1. Go to repository Settings → Pages
2. Change source branch from `gh-pages` to a different branch temporarily
3. Fix the issue on `main`
4. Re-enable `gh-pages` branch as source

**Note**: Option 1 (revert) is preferred as it maintains git history.

## Troubleshooting

### Deployment Succeeds but Site Shows 404

**Possible causes**:

- Incorrect `homepage` in `package.json`
- GitHub Pages not enabled for repository
- `gh-pages` branch doesn't exist

**Solutions**:

1. Verify `homepage` matches repository name
2. Check Settings → Pages → Source is set to `gh-pages` branch
3. Run `npm run deploy` to create `gh-pages` branch

### Assets (CSS, JS) Don't Load

**Possible cause**: Incorrect base path in `homepage`

**Solution**: Ensure `homepage` in `package.json` matches the deployment URL exactly:

```json
"homepage": "https://goal-based-financial-planner.github.io/goal-based-financial-planner"
```

### Deployment Workflow Fails

**Possible causes**:

- Tests fail
- Build fails
- Insufficient GitHub Actions permissions

**Solutions**:

1. Check workflow logs in Actions tab
2. Reproduce build locally (`npm run build`)
3. Fix errors and push again
4. Verify GitHub Actions has write permissions (Settings → Actions → General → Workflow permissions)

### Changes Don't Appear on Live Site

**Possible causes**:

- Browser cache
- CDN cache (GitHub Pages)
- Deployment didn't complete

**Solutions**:

1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Check deployment workflow completed successfully
3. Wait a few minutes for CDN cache to clear
4. Check `gh-pages` branch was updated

### Build Fails with "Out of Memory"

**Possible cause**: Large bundle size or insufficient Node.js heap

**Solution**:

```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

Or update `package.json`:

```json
"scripts": {
  "build": "react-scripts --max_old_space_size=4096 build"
}
```

## Monitoring and Analytics

### GitHub Pages Analytics (Basic)

- View traffic in repository Insights → Traffic
- Shows page views and unique visitors

### Adding Google Analytics (Future)

If you want detailed analytics:

1. Create Google Analytics property
2. Get tracking ID (e.g., `G-XXXXXXXXXX`)
3. Add to `public/index.html`:
   ```html
   <script
     async
     src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
   ></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag() {
       dataLayer.push(arguments);
     }
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

## Performance Optimization

### Current Optimizations

- **Code splitting**: React lazy loading (if implemented)
- **Minification**: JavaScript and CSS minified in production build
- **Tree shaking**: Unused code removed by Webpack
- **Asset hashing**: Cache busting via filename hashes

### Future Improvements

- **Lazy loading**: Split routes and heavy components
- **Image optimization**: Compress images before committing
- **Service worker**: PWA for offline support
- **Bundle analysis**: `npm run build && npx source-map-explorer build/static/js/*.js`

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages): Official GitHub Pages docs
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/): Deployment guide for CRA apps
- [gh-pages Package](https://www.npmjs.com/package/gh-pages): Deployment tool documentation
- [Architecture Guide](ARCHITECTURE.md): Understand the application structure
- [Development Guide](DEVELOPMENT.md): Local development setup

---

**Deployment URL**: [https://goal-based-financial-planner.github.io/goal-based-financial-planner/](https://goal-based-financial-planner.github.io/goal-based-financial-planner/)

**Workflow File**: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
