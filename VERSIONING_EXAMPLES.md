# Versioning Examples

This document shows practical examples of how the alpha and beta versioning system works with automatic incrementation.

## 🎯 Current Situation

Starting with **v0.0.5** as the current stable release.

## 🔄 Alpha Development Cycle

### Creating First Alpha

```bash
yarn prerelease:alpha
# Creates: v0.0.5-alpha.1
```

Client installation:

```bash
yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v0.0.5-alpha.1" --production
```

### Subsequent Alpha Releases

```bash
# Second alpha (automatic increment)
yarn prerelease:alpha
# Creates: v0.0.5-alpha.2

# Third alpha (automatic increment)
yarn prerelease:alpha
# Creates: v0.0.5-alpha.3

# Fourth alpha (automatic increment)
yarn prerelease:alpha
# Creates: v0.0.5-alpha.4
```

## 🧪 Beta Development Cycle

### Creating First Beta

```bash
yarn prerelease:beta
# Creates: v0.0.5-beta.1
```

### Subsequent Beta Releases

```bash
# Second beta (automatic increment)
yarn prerelease:beta
# Creates: v0.0.5-beta.2

# Third beta (automatic increment)
yarn prerelease:beta
# Creates: v0.0.5-beta.3
```

## 🚀 Release Candidate Cycle

### Creating Release Candidates

```bash
# First RC
yarn prerelease:rc
# Creates: v0.0.5-rc.1

# Second RC (if needed)
yarn prerelease:rc
# Creates: v0.0.5-rc.2
```

## 📈 Progressing to Next Version

### Working on Next Minor Version

```bash
# Start alpha for next minor version
yarn prerelease
# Select: Beta
# Select: Next minor (0.1.0)
# Creates: v0.1.0-alpha.1

# Continue alpha development
yarn prerelease:alpha
# Creates: v0.1.0-alpha.2

yarn prerelease:alpha
# Creates: v0.1.0-alpha.3
```

### Moving to Beta Phase

```bash
# First beta for v0.1.0
yarn prerelease:beta
# Creates: v0.1.0-beta.1

# Continue beta testing
yarn prerelease:beta
# Creates: v0.1.0-beta.2
```

### Release Candidates

```bash
# Release candidate
yarn prerelease:rc
# Creates: v0.1.0-rc.1

# Final stable release
yarn release:minor
# Creates: v0.1.0
```

## 🏷️ Complete Timeline Example

Here's how a complete development cycle might look:

```bash
v0.0.5              # Current stable
v0.0.5-alpha.1      # Start alpha development
v0.0.5-alpha.2      # Fix issues
v0.0.5-alpha.3      # Add features
v0.0.5-beta.1       # Feature freeze, start testing
v0.0.5-beta.2       # Fix bugs
v0.0.5-rc.1         # Release candidate
v0.0.6              # New stable release

# Meanwhile, work on next major features
v0.1.0-alpha.1      # Start next minor version
v0.1.0-alpha.2      # Add features
v0.1.0-alpha.3      # More features
v0.1.0-beta.1       # Feature freeze
v0.1.0-beta.2       # Testing
v0.1.0-rc.1         # Release candidate
v0.1.0              # New minor release
```

## 📦 Installation Matrix

| Version Type    | Example        | Installation Command                             | Use Case         |
| --------------- | -------------- | ------------------------------------------------ | ---------------- |
| **Stable**      | v0.0.5         | `yarn add "git+...#v0.0.5" --production`         | Production use   |
| **Alpha**       | v0.0.6-alpha.1 | `yarn add "git+...#v0.0.6-alpha.1" --production` | Early testing    |
| **Beta**        | v0.0.6-beta.1  | `yarn add "git+...#v0.0.6-beta.1" --production`  | Feature testing  |
| **RC**          | v0.0.6-rc.1    | `yarn add "git+...#v0.0.6-rc.1" --production`    | Final validation |
| **Development** | develop        | `yarn add "git+...#develop" --production`        | Latest code      |

## 🎯 Best Practices

### When to Use Each Type

**Alpha Releases**

- Active development
- Breaking changes possible
- For internal testing only
- New features being added

**Beta Releases**

- Feature-complete
- No more breaking changes
- External testing
- Bug fixes only

**Release Candidates**

- Stable and ready
- Final testing phase
- Documentation complete
- Minor fixes only

### Typical Development Flow

1. **Start with alpha** for new features
2. **Multiple alphas** as you develop
3. **Move to beta** when feature-complete
4. **Beta testing** with external users
5. **Release candidate** when stable
6. **Final release** when ready

### Increment Strategy

- **Alphas**: Increment frequently (daily/weekly)
- **Betas**: Increment for significant fixes
- **RCs**: Increment sparingly (only for critical issues)

## 🔍 Checking Your Progress

Use the tags command to see your current state:

```bash
yarn tags
```

This shows:

- All existing tags
- What the next version numbers will be
- Installation commands for each type

## 🚨 Important Notes

1. **Automatic Incrementation**: The script automatically finds the highest existing number and increments it
2. **No Conflicts**: You can't accidentally create duplicate versions
3. **Clean History**: Each prerelease type increments independently
4. **Easy Rollback**: If something goes wrong, you can delete tags and try again

## 🎉 Real-World Example

Let's say you're adding a new feature:

```bash
# Current: v0.0.5
# Goal: Add user authentication feature

# Start development
yarn prerelease:alpha        # → v0.0.6-alpha.1
# (implement basic auth)

yarn prerelease:alpha        # → v0.0.6-alpha.2
# (add login UI)

yarn prerelease:alpha        # → v0.0.6-alpha.3
# (add logout functionality)

# Feature complete, start testing
yarn prerelease:beta         # → v0.0.6-beta.1
# (external testing reveals bug)

yarn prerelease:beta         # → v0.0.6-beta.2
# (fix bug, more testing)

# Ready for release
yarn prerelease:rc           # → v0.0.6-rc.1
# (final checks pass)

yarn release:patch           # → v0.0.6
# (stable release!)
```

Each step is a simple command, and the versioning happens automatically! 🚀
