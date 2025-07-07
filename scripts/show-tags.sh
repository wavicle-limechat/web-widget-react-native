#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "🏷️  LimeChat React Native SDK - Tag Overview"
echo "============================================"
echo -e "${NC}"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current package.json version: ${YELLOW}v$CURRENT_VERSION${NC}"
echo ""

# Show all stable releases
echo -e "${GREEN}📦 Stable Releases:${NC}"
STABLE_TAGS=$(git tag -l "v*" | grep -v -E "(alpha|beta|rc)" | sort -V)
if [ -z "$STABLE_TAGS" ]; then
    echo "  No stable releases found"
else
    echo "$STABLE_TAGS" | tail -n10 | sed 's/^/  /'
    if [ $(echo "$STABLE_TAGS" | wc -l) -gt 10 ]; then
        echo "  ... and $(( $(echo "$STABLE_TAGS" | wc -l) - 10 )) more"
    fi
fi
echo ""

# Show alpha releases
echo -e "${PURPLE}🧪 Alpha Releases:${NC}"
ALPHA_TAGS=$(git tag -l "v*-alpha.*" | sort -V)
if [ -z "$ALPHA_TAGS" ]; then
    echo "  No alpha releases found"
else
    echo "$ALPHA_TAGS" | tail -n10 | sed 's/^/  /'
    if [ $(echo "$ALPHA_TAGS" | wc -l) -gt 10 ]; then
        echo "  ... and $(( $(echo "$ALPHA_TAGS" | wc -l) - 10 )) more"
    fi
fi
echo ""

# Show beta releases
echo -e "${PURPLE}🧪 Beta Releases:${NC}"
BETA_TAGS=$(git tag -l "v*-beta.*" | sort -V)
if [ -z "$BETA_TAGS" ]; then
    echo "  No beta releases found"
else
    echo "$BETA_TAGS" | tail -n10 | sed 's/^/  /'
    if [ $(echo "$BETA_TAGS" | wc -l) -gt 10 ]; then
        echo "  ... and $(( $(echo "$BETA_TAGS" | wc -l) - 10 )) more"
    fi
fi
echo ""

# Show release candidates
echo -e "${PURPLE}🧪 Release Candidates:${NC}"
RC_TAGS=$(git tag -l "v*-rc.*" | sort -V)
if [ -z "$RC_TAGS" ]; then
    echo "  No release candidates found"
else
    echo "$RC_TAGS" | tail -n10 | sed 's/^/  /'
    if [ $(echo "$RC_TAGS" | wc -l) -gt 10 ]; then
        echo "  ... and $(( $(echo "$RC_TAGS" | wc -l) - 10 )) more"
    fi
fi
echo ""

# Show what the next versions would be
echo -e "${YELLOW}🔮 Next Version Predictions:${NC}"
echo ""

# Function to get next prerelease version
get_next_prerelease() {
    local base_version=$1
    local prerelease_type=$2
    
    local latest_tag=$(git tag -l "v${base_version}-${prerelease_type}.*" | sort -V | tail -n1)
    
    if [ -z "$latest_tag" ]; then
        echo "${base_version}-${prerelease_type}.1"
    else
        local latest_num=$(echo "$latest_tag" | sed -E "s/v${base_version}-${prerelease_type}\.([0-9]+)/\1/")
        local next_num=$((latest_num + 1))
        echo "${base_version}-${prerelease_type}.${next_num}"
    fi
}

# Calculate next versions manually (avoiding npm version --dry-run which requires clean git)
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

NEXT_PATCH="$MAJOR.$MINOR.$((PATCH + 1))"
NEXT_MINOR="$MAJOR.$((MINOR + 1)).0"
NEXT_MAJOR="$((MAJOR + 1)).0.0"

# Show next stable versions
echo "Next stable versions:"
echo "  Patch: v$NEXT_PATCH"
echo "  Minor: v$NEXT_MINOR"
echo "  Major: v$NEXT_MAJOR"
echo ""

# Show next prerelease versions for current version
echo "Next prerelease versions (based on current v$CURRENT_VERSION):"
echo "  Alpha: v$(get_next_prerelease "$CURRENT_VERSION" "alpha")"
echo "  Beta:  v$(get_next_prerelease "$CURRENT_VERSION" "beta")"
echo "  RC:    v$(get_next_prerelease "$CURRENT_VERSION" "rc")"
echo ""

# Show next prerelease versions for next patch
echo "Next prerelease versions (based on next patch v$NEXT_PATCH):"
echo "  Alpha: v$(get_next_prerelease "$NEXT_PATCH" "alpha")"
echo "  Beta:  v$(get_next_prerelease "$NEXT_PATCH" "beta")"
echo "  RC:    v$(get_next_prerelease "$NEXT_PATCH" "rc")"
echo ""

# Show commands to create releases
echo -e "${BLUE}🚀 Available Commands:${NC}"
echo ""
echo "Stable releases:"
echo "  yarn release              # Interactive release"
echo "  yarn release:patch        # Quick patch release"
echo "  yarn release:minor        # Quick minor release"
echo "  yarn release:major        # Quick major release"
echo ""
echo "Prerelease versions:"
echo "  yarn prerelease           # Interactive prerelease"
echo "  yarn prerelease:alpha     # Quick alpha release"
echo "  yarn prerelease:beta      # Quick beta release"
echo "  yarn prerelease:rc        # Quick release candidate"
echo ""

# Show installation examples
echo -e "${BLUE}📦 Installation Examples:${NC}"
echo ""
if [ -n "$STABLE_TAGS" ]; then
    LATEST_STABLE=$(echo "$STABLE_TAGS" | tail -n1)
    echo "Latest stable:"
    echo "  yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#${LATEST_STABLE}\" --production"
    echo ""
fi

if [ -n "$BETA_TAGS" ]; then
    LATEST_BETA=$(echo "$BETA_TAGS" | tail -n1)
    echo "Latest beta:"
    echo "  yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#${LATEST_BETA}\" --production"
    echo ""
fi

if [ -n "$ALPHA_TAGS" ]; then
    LATEST_ALPHA=$(echo "$ALPHA_TAGS" | tail -n1)
    echo "Latest alpha:"
    echo "  yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#${LATEST_ALPHA}\" --production"
    echo ""
fi

echo "Development branch:"
echo "  yarn add \"git+https://github.com/wavicle-limechat/web-widget-react-native.git#develop\" --production" 