# Quick Release Guide

## 🚀 Stable Releases

```bash
# Interactive release (recommended)
yarn release

# Or specific version types
yarn release:patch    # 0.0.5 → 0.0.6
yarn release:minor    # 0.0.5 → 0.1.0
yarn release:major    # 0.0.5 → 1.0.0
```

## 🧪 Prerelease Versions

```bash
# Interactive prerelease (recommended)
yarn prerelease

# Or specific prerelease types
yarn prerelease:alpha # 0.0.5 → 0.0.5-alpha.1, 0.0.5-alpha.2, etc.
yarn prerelease:beta  # 0.0.5 → 0.0.5-beta.1, 0.0.5-beta.2, etc.
yarn prerelease:rc    # 0.0.5 → 0.0.5-rc.1, 0.0.5-rc.2, etc.
```

## 📋 View Existing Tags

```bash
# Show all tags and next version predictions
yarn tags
```

## 📋 What the Release Script Does

1. ✅ Validates code (lint + typecheck)
2. ✅ Runs all tests
3. ✅ Builds the package
4. ✅ Updates package.json version
5. ✅ Creates git commit and tag
6. ✅ Pushes to GitHub
7. ✅ Triggers automated GitHub release

## 🏷️ Manual Tag Creation (Alternative)

```bash
# Bump version
npm version patch  # or minor/major

# Create tag
git tag -a v0.0.6 -m "Release v0.0.6 - Description"

# Push
git push origin develop
git push origin v0.0.6
```

## 📦 Client Installation

### Stable Releases

```bash
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.0.6" --production
```

### Prerelease Versions

```bash
# Alpha versions (early development)
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.1.0-alpha.1" --production

# Beta versions (feature-complete, testing)
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.1.0-beta.1" --production

# Release candidates (stable, final testing)
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.1.0-rc.1" --production
```

## 🔍 Version Strategy

### Stable Releases

- **Patch** (0.0.5 → 0.0.6): Bug fixes
- **Minor** (0.0.5 → 0.1.0): New features
- **Major** (0.0.5 → 1.0.0): Breaking changes

### Prerelease Types

- **Alpha** (0.1.0-alpha.1): Early development, unstable, breaking changes possible
- **Beta** (0.1.0-beta.1): Feature-complete, testing phase, minor bugs expected
- **RC** (0.1.0-rc.1): Release candidate, stable, final testing before release

### Automatic Incrementation

The prerelease script automatically increments the prerelease number:

- First alpha: `v0.1.0-alpha.1`
- Second alpha: `v0.1.0-alpha.2`
- Third alpha: `v0.1.0-alpha.3`
- And so on...

## ✅ Pre-Release Checklist

- [ ] All changes committed
- [ ] On `develop` branch
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Ready for production use

## 🚨 Emergency Fixes

For urgent hotfixes:

```bash
# Create hotfix branch from latest tag
git checkout v0.0.5
git checkout -b hotfix/urgent-fix

# Make fixes, test, then:
yarn release:patch  # Creates v0.0.6
```

That's it! 🎉
