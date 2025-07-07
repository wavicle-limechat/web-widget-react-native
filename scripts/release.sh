#!/bin/bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}📦 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo -e "${BLUE}"
echo "🏷️  LimeChat React Native SDK Release Tool"
echo "=========================================="
echo -e "${NC}"
echo "Current version: ${YELLOW}v$CURRENT_VERSION${NC}"
echo ""

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_error "Working directory is not clean. Please commit or stash your changes."
    git status --short
    exit 1
fi

# Check if we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    print_warning "You're not on the 'develop' branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        echo "Exiting..."
        exit 1
    fi
fi

# Ask for release type
echo "Select release type:"
echo "1) Patch (${CURRENT_VERSION} → $(npm version --no-git-tag-version patch && npm version --no-git-tag-version v$CURRENT_VERSION >/dev/null 2>&1 && npm version patch --dry-run | sed 's/v//'))"
echo "2) Minor (${CURRENT_VERSION} → $(npm version minor --dry-run | sed 's/v//'))"
echo "3) Major (${CURRENT_VERSION} → $(npm version major --dry-run | sed 's/v//'))"
echo "4) Custom version"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        RELEASE_TYPE="patch"
        ;;
    2)
        RELEASE_TYPE="minor"
        ;;
    3)
        RELEASE_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 0.1.0-beta.1): " CUSTOM_VERSION
        if [ -z "$CUSTOM_VERSION" ]; then
            print_error "No version provided. Exiting."
            exit 1
        fi
        RELEASE_TYPE="$CUSTOM_VERSION"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Update version
print_step "Updating package.json version..."
if [ "$choice" == "4" ]; then
    npm version "$RELEASE_TYPE" --no-git-tag-version
else
    npm version "$RELEASE_TYPE" --no-git-tag-version
fi

NEW_VERSION=$(node -p "require('./package.json').version")
print_success "Version updated to v$NEW_VERSION"

# Run validation
print_step "Running validation checks..."
if ! yarn validate; then
    print_error "Validation failed. Please fix issues before releasing."
    # Revert version change
    npm version "$CURRENT_VERSION" --no-git-tag-version
    exit 1
fi
print_success "Validation passed"

# Run tests
print_step "Running tests..."
if ! yarn test; then
    print_error "Tests failed. Please fix issues before releasing."
    # Revert version change
    npm version "$CURRENT_VERSION" --no-git-tag-version
    exit 1
fi
print_success "Tests passed"

# Build package
print_step "Building package..."
if ! yarn build; then
    print_error "Build failed. Please fix issues before releasing."
    # Revert version change
    npm version "$CURRENT_VERSION" --no-git-tag-version
    exit 1
fi
print_success "Package built successfully"

# Show what will be included in the release
print_step "Checking package contents..."
echo "Files that will be available to clients:"
echo "✅ src/ (source files)"
echo "✅ dist/ (compiled output)"
echo "✅ index.js, index.d.ts (entry points)"
echo "✅ README.md, LICENSE (documentation)"
echo ""
echo "Files excluded from client installations:"
echo "❌ src/__tests__/ (test files)"
echo "❌ babel.config.js, .eslintrc.js, tsconfig.json (build configs)"
echo "❌ example/ (example app)"
echo ""

# Confirm release
echo -e "${YELLOW}Ready to release v$NEW_VERSION${NC}"
echo ""
echo "This will:"
echo "• Commit the version change"
echo "• Create and push git tag v$NEW_VERSION"
echo "• Make the release available for installation via:"
echo "  ${BLUE}yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION\" --production${NC}"
echo ""
read -p "Proceed with release? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    print_warning "Release cancelled. Reverting version change..."
    npm version "$CURRENT_VERSION" --no-git-tag-version
    exit 0
fi

# Commit version change
print_step "Committing version change..."
git add package.json
git commit -m "chore: bump version to v$NEW_VERSION"
print_success "Version change committed"

# Create tag
print_step "Creating git tag..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
print_success "Tag v$NEW_VERSION created"

# Push changes
print_step "Pushing to remote..."
git push origin "$CURRENT_BRANCH"
git push origin "v$NEW_VERSION"
print_success "Changes and tag pushed to remote"

# Final success message
echo ""
echo -e "${GREEN}🎉 Release v$NEW_VERSION completed successfully!${NC}"
echo ""
echo "Clients can now install this version using:"
echo -e "${BLUE}yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION\" --production${NC}"
echo ""
echo "Next steps:"
echo "• Update any documentation that references version numbers"
echo "• Notify users about the new release"
echo "• Consider creating a GitHub release with changelog"
echo ""

# Test installation (optional)
read -p "Test installation locally? (y/N): " test_install
if [ "$test_install" = "y" ] || [ "$test_install" = "Y" ]; then
    print_step "Testing installation..."
    
    # Create temporary directory
    TEST_DIR="/tmp/limechat-sdk-test-$(date +%s)"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Initialize npm and test install
    npm init -y > /dev/null
    echo "Installing v$NEW_VERSION..."
    
    if yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION" --production; then
        print_success "Installation test passed"
        echo "Package contents:"
        ls -la node_modules/@limechat/react-native-widget/
    else
        print_error "Installation test failed"
    fi
    
    # Clean up
    cd - > /dev/null
    rm -rf "$TEST_DIR"
fi

print_success "All done! 🚀" 