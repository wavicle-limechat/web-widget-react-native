# Release Process Guide

This guide outlines the process for creating tags and releases for the LimeChat React Native SDK.

## 🏷️ Manual Release Process (Recommended)

### Step 1: Prepare for Release

```bash
# 1. Ensure you're on the main/develop branch
git checkout develop
git pull origin develop

# 2. Run all tests and validation
yarn validate
yarn test

# 3. Build the package
yarn build

# 4. Update version in package.json (if not done already)
# Edit package.json manually or use npm version
npm version patch  # for 0.0.5 -> 0.0.6
npm version minor  # for 0.0.5 -> 0.1.0
npm version major  # for 0.0.5 -> 1.0.0
```

### Step 2: Create and Push Tag

```bash
# 1. Create annotated tag (preferred for releases)
git tag -a v0.0.6 -m "Release v0.0.6 - Bug fixes and optimization"

# 2. Push the tag to GitHub
git push origin v0.0.6

# 3. Push any version changes
git push origin develop
```

### Step 3: Verify Installation

```bash
# Test the new tag installation
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.0.6" --production
```

## 🤖 Automated Release Process (Advanced)

### Option A: GitHub Actions Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "yarn"

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run tests
        run: yarn test

      - name: Build package
        run: yarn build

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### Option B: Automated Tagging Script

Create `scripts/release.sh`:

```bash
#!/bin/bash

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Ask for new version
read -p "Enter new version (current: $CURRENT_VERSION): " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
  echo "No version provided. Exiting."
  exit 1
fi

# Update package.json
npm version $NEW_VERSION --no-git-tag-version

# Run validation
echo "Running validation..."
yarn validate

if [ $? -ne 0 ]; then
  echo "Validation failed. Please fix issues before releasing."
  exit 1
fi

# Build package
echo "Building package..."
yarn build

# Commit changes
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes and tag
git push origin develop
git push origin "v$NEW_VERSION"

echo "✅ Release v$NEW_VERSION created successfully!"
echo "Clients can now install with:"
echo "yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION\" --production"
```

Make it executable:

```bash
chmod +x scripts/release.sh
```

## 📋 Pre-Release Checklist

### Before Creating Any Tag:

- [ ] All tests pass (`yarn test`)
- [ ] Linting passes (`yarn lint`)
- [ ] TypeScript compilation works (`yarn type-check`)
- [ ] Package builds successfully (`yarn build`)
- [ ] Version updated in `package.json`
- [ ] CHANGELOG.md updated (optional but recommended)
- [ ] Documentation updated if needed

### Validation Commands:

```bash
# Complete validation pipeline
yarn validate && yarn test && yarn build
```

## 🏗️ Tag Naming Convention

### Semantic Versioning (Recommended)

```bash
v0.0.5    # Patch: Bug fixes
v0.1.0    # Minor: New features (backward compatible)
v1.0.0    # Major: Breaking changes
```

### Pre-release Tags

```bash
v0.1.0-alpha.1    # Alpha releases
v0.1.0-beta.1     # Beta releases
v0.1.0-rc.1       # Release candidates
```

## 🚀 Client Installation Examples

### Stable Release

```bash
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.0.5" --production
```

### Pre-release

```bash
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.1.0-beta.1" --production
```

### Latest from Branch

```bash
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#develop" --production
```

## 🔍 Verification & Testing

### After Creating a Tag:

1. **Test Installation:**

   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.0.6" --production
   ls node_modules/@limechat/react-native-widget/
   ```

2. **Verify Package Contents:**

   ```bash
   # Should contain: src/, dist/, index.js, index.d.ts, README.md, LICENSE
   # Should NOT contain: __tests__, .eslintrc.js, tsconfig.json, babel.config.js
   ```

3. **Test Import:**
   ```bash
   node -e "console.log(require('@limechat/react-native-widget'))"
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **Tag already exists:**

   ```bash
   git tag -d v0.0.5          # Delete local tag
   git push origin :v0.0.5    # Delete remote tag
   ```

2. **Wrong files in tag:**

   - Check `.gitattributes` export-ignore patterns
   - Verify `prepare` script runs correctly

3. **Installation fails:**
   - Test with `--production` flag
   - Check Node version compatibility

## 📈 Recommended Workflow

### For Regular Development:

1. Work on `develop` branch
2. Create feature branches for new features
3. Merge to `develop` via PR
4. When ready for release, run release process

### For Hotfixes:

1. Create hotfix branch from latest tag
2. Fix the issue
3. Create new patch version tag
4. Merge back to `develop`

This process ensures clients always get clean, production-ready code when installing via Git tags.
