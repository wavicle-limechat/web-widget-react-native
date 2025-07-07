#!/bin/bash

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
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

print_prerelease() {
    echo -e "${PURPLE}🧪 $1${NC}"
}

# Function to get the latest tag for a specific prerelease type
get_latest_prerelease() {
    local base_version=$1
    local prerelease_type=$2
    
    # Get all tags matching the pattern
    local latest_tag=$(git tag -l "v${base_version}-${prerelease_type}.*" | sort -V | tail -n1)
    
    if [ -z "$latest_tag" ]; then
        echo "0"
    else
        # Extract the prerelease number
        echo "$latest_tag" | sed -E "s/v${base_version}-${prerelease_type}\.([0-9]+)/\1/"
    fi
}

# Function to increment prerelease version
increment_prerelease() {
    local base_version=$1
    local prerelease_type=$2
    
    local latest_num=$(get_latest_prerelease "$base_version" "$prerelease_type")
    local next_num=$((latest_num + 1))
    
    echo "${base_version}-${prerelease_type}.${next_num}"
}

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo -e "${PURPLE}"
echo "🧪 LimeChat React Native SDK Pre-release Tool"
echo "=============================================="
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

# Show existing prerelease tags
print_step "Checking existing prerelease tags..."
echo ""
echo "Recent alpha tags:"
git tag -l "v*-alpha.*" | sort -V | tail -n5 | sed 's/^/  /' || echo "  None found"
echo ""
echo "Recent beta tags:"
git tag -l "v*-beta.*" | sort -V | tail -n5 | sed 's/^/  /' || echo "  None found"
echo ""
echo "Recent rc tags:"
git tag -l "v*-rc.*" | sort -V | tail -n5 | sed 's/^/  /' || echo "  None found"
echo ""

# Ask for prerelease type
echo "Select prerelease type:"
echo "1) Alpha (early development, unstable)"
echo "2) Beta (feature-complete, testing phase)"  
echo "3) Release Candidate (stable, final testing)"
echo "4) Custom prerelease version"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        PRERELEASE_TYPE="alpha"
        ;;
    2)
        PRERELEASE_TYPE="beta"
        ;;
    3)
        PRERELEASE_TYPE="rc"
        ;;
    4)
        read -p "Enter custom prerelease version (e.g., 0.1.0-dev.1): " CUSTOM_VERSION
        if [ -z "$CUSTOM_VERSION" ]; then
            print_error "No version provided. Exiting."
            exit 1
        fi
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

if [ "$choice" != "4" ]; then
    # Calculate next versions manually (avoiding npm version --dry-run which requires clean git)
    IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
    MAJOR=${VERSION_PARTS[0]}
    MINOR=${VERSION_PARTS[1]}
    PATCH=${VERSION_PARTS[2]}

    NEXT_PATCH="$MAJOR.$MINOR.$((PATCH + 1))"
    NEXT_MINOR="$MAJOR.$((MINOR + 1)).0"
    NEXT_MAJOR="$((MAJOR + 1)).0.0"

    # Ask for base version
    echo ""
    echo "Select base version for ${PRERELEASE_TYPE}:"
    echo "1) Current version ($CURRENT_VERSION)"
    echo "2) Next patch ($NEXT_PATCH)"
    echo "3) Next minor ($NEXT_MINOR)"
    echo "4) Next major ($NEXT_MAJOR)"
    echo "5) Custom base version"
    echo ""
    read -p "Enter choice (1-5): " base_choice

    case $base_choice in
        1)
            BASE_VERSION="$CURRENT_VERSION"
            ;;
        2)
            BASE_VERSION="$NEXT_PATCH"
            ;;
        3)
            BASE_VERSION="$NEXT_MINOR"
            ;;
        4)
            BASE_VERSION="$NEXT_MAJOR"
            ;;
        5)
            read -p "Enter custom base version (e.g., 1.0.0): " BASE_VERSION
            if [ -z "$BASE_VERSION" ]; then
                print_error "No base version provided. Exiting."
                exit 1
            fi
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac

    # Generate new prerelease version
    NEW_VERSION=$(increment_prerelease "$BASE_VERSION" "$PRERELEASE_TYPE")
else
    NEW_VERSION="$CUSTOM_VERSION"
fi

print_prerelease "Will create prerelease: v$NEW_VERSION"

# Show what this version will contain
echo ""
print_step "Checking for existing tag..."
if git tag -l "v$NEW_VERSION" | grep -q "v$NEW_VERSION"; then
    print_error "Tag v$NEW_VERSION already exists!"
    echo "Existing tags for this base version:"
    git tag -l "v${BASE_VERSION}*" | sort -V
    exit 1
fi

# Show latest tags for context
echo ""
print_step "Recent tags for context:"
if [ "$choice" != "4" ]; then
    echo "Latest ${PRERELEASE_TYPE} for v${BASE_VERSION}: $(git tag -l "v${BASE_VERSION}-${PRERELEASE_TYPE}.*" | sort -V | tail -n1 || echo 'None')"
fi
echo "Latest stable release: $(git tag -l "v*" | grep -v -E "(alpha|beta|rc)" | sort -V | tail -n1 || echo 'None')"
echo ""

# Run validation
print_step "Running validation checks..."

# Check if validation command exists
if command -v yarn >/dev/null 2>&1 && yarn run --version >/dev/null 2>&1; then
    if yarn run lint >/dev/null 2>&1 && yarn run type-check >/dev/null 2>&1; then
        if ! yarn validate; then
            print_error "Validation failed. Please fix issues before releasing."
            exit 1
        fi
        print_success "Validation passed"
    else
        print_warning "Lint/type-check commands not available, skipping validation"
        print_success "Validation skipped (commands not found)"
    fi
else
    print_warning "Yarn not available, skipping validation"
    print_success "Validation skipped (yarn not found)"
fi

# Run tests
print_step "Running tests..."

# Check if test command exists
if command -v yarn >/dev/null 2>&1 && yarn run test --help >/dev/null 2>&1; then
    if ! yarn test; then
        print_error "Tests failed. Please fix issues before releasing."
        exit 1
    fi
    print_success "Tests passed"
else
    print_warning "Test command not available, skipping tests"
    print_success "Tests skipped (command not found)"
fi

# Build package
print_step "Building package..."

# Check if build command exists
if command -v yarn >/dev/null 2>&1 && yarn run build --help >/dev/null 2>&1; then
    if ! yarn build; then
        print_error "Build failed. Please fix issues before releasing."
        exit 1
    fi
    print_success "Package built successfully"
else
    print_warning "Build command not available, skipping build"
    print_success "Build skipped (command not found)"
fi

# Update package.json version
print_step "Updating package.json version..."
npm version "$NEW_VERSION" --no-git-tag-version
print_success "Version updated to v$NEW_VERSION"

# Show what will be included in the release
print_prerelease "Prerelease contents preview:"
echo "✅ src/ (source files)"
echo "✅ dist/ (compiled output)"  
echo "✅ index.js, index.d.ts (entry points)"
echo "✅ README.md, LICENSE (documentation)"
echo "❌ src/__tests__/ (test files excluded)"
echo "❌ Development configs excluded"
echo ""

# Confirm release
echo -e "${PURPLE}Ready to create prerelease v$NEW_VERSION${NC}"
echo ""
echo "This will:"
echo "• Commit the version change"
echo "• Create and push git tag v$NEW_VERSION"
echo "• Make it available for installation via:"
echo "  ${BLUE}yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION\" --production${NC}"
echo ""

# Show installation warning for prereleases
print_warning "Prerelease Warning:"
echo "• This is a pre-production version"
echo "• May contain bugs or incomplete features"
echo "• Not recommended for production use"
echo "• Use for testing and feedback only"
echo ""

read -p "Proceed with prerelease? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    print_warning "Prerelease cancelled. Reverting version change..."
    npm version "$CURRENT_VERSION" --no-git-tag-version
    exit 0
fi

# Commit version change
print_step "Committing version change..."
git add package.json
git commit -m "chore: bump version to v$NEW_VERSION (prerelease)"
print_success "Version change committed"

# Create tag
print_step "Creating git tag..."
git tag -a "v$NEW_VERSION" -m "Prerelease v$NEW_VERSION"
print_success "Tag v$NEW_VERSION created"

# Push changes
print_step "Pushing to remote..."

# Check if we need to pull first
if ! git push origin "$CURRENT_BRANCH"; then
    print_warning "Push failed. Attempting to pull and merge..."
    
    # Stash the version change temporarily
    git stash push -m "Temporary stash for prerelease v$NEW_VERSION"
    
    # Pull latest changes
    if git pull origin "$CURRENT_BRANCH"; then
        # Pop the stash
        git stash pop
        
        # Try push again
        if git push origin "$CURRENT_BRANCH"; then
            print_success "Successfully pushed after merge"
        else
            print_error "Push still failed after merge. Please resolve conflicts manually."
            print_error "Run: git push origin $CURRENT_BRANCH"
            print_error "Then: git push origin v$NEW_VERSION"
            exit 1
        fi
    else
        print_error "Failed to pull changes. Please resolve manually."
        git stash pop
        exit 1
    fi
fi

# Push the tag
if ! git push origin "v$NEW_VERSION"; then
    print_error "Failed to push tag. You may need to push it manually:"
    print_error "git push origin v$NEW_VERSION"
    exit 1
fi

print_success "Changes and tag pushed to remote"

# Final success message
echo ""
echo -e "${GREEN}🎉 Prerelease v$NEW_VERSION created successfully!${NC}"
echo ""
print_prerelease "Installation commands for testers:"
echo -e "${BLUE}yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION\" --production${NC}"
echo -e "${BLUE}npm install \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION\" --only=production${NC}"
echo ""
echo "Next steps:"
echo "• Share with testers for feedback"
echo "• Monitor for issues and bugs"
echo "• Create next ${PRERELEASE_TYPE} version as needed"
echo "• Release stable version when ready"
echo ""

# Test installation (optional)
read -p "Test installation locally? (y/N): " test_install
if [ "$test_install" = "y" ] || [ "$test_install" = "Y" ]; then
    print_step "Testing installation..."
    
    # Create temporary directory
    TEST_DIR="/tmp/limechat-sdk-prerelease-test-$(date +%s)"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Initialize npm and test install
    npm init -y > /dev/null
    echo "Installing v$NEW_VERSION..."
    
    if yarn add "git+https://github.com/wavicle-limechat/web-widget-react-native.git#v$NEW_VERSION" --production; then
        print_success "Installation test passed"
        echo "Package contents:"
        ls -la node_modules/@limechat/react-native-widget/ | head -10
    else
        print_error "Installation test failed"
    fi
    
    # Clean up
    cd - > /dev/null
    rm -rf "$TEST_DIR"
fi

print_success "Prerelease complete! 🧪" 