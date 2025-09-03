#!/bin/bash

# Build and Test Script for LimeChat React Native SDK
# Usage: ./build-and-test.sh [filename]
# Example: ./build-and-test.sh build-11-f

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ] || [ -z "$1" ]; then
    echo "Build and Test Script for LimeChat React Native SDK"
    echo ""
    echo "Usage: $0 <filename>"
    echo "Example: $0 build-11-f"
    echo ""
    echo "This script will:"
    echo "  1. Run 'yarn prepack' to build the SDK"
    echo "  2. Create a .tgz package with the specified filename"
    echo "  3. Navigate to the example directory"
    echo "  4. Install the new SDK build"
    echo "  5. Start the example app"
    echo ""
    echo "Options:"
    echo "  -h, --help    Show this help message"
    exit 0
fi

FILENAME="$1"
TGZ_FILE="${FILENAME}.tgz"

print_status "Starting build process for: $FILENAME"

# Step 1: Build the SDK
print_status "Running prepack and pack..."
yarn prepack

if [ $? -ne 0 ]; then
    print_error "Prepack failed"
    exit 1
fi

yarn pack --filename "$TGZ_FILE"

if [ $? -ne 0 ]; then
    print_error "Pack failed"
    exit 1
fi

print_success "SDK packed successfully as: $TGZ_FILE"

# Step 2: Navigate to example directory
print_status "Navigating to example directory..."
cd example

if [ ! -d "node_modules" ]; then
    print_warning "Example node_modules not found, running yarn install first..."
    yarn install
fi

# Step 3: Remove old SDK if exists and install new one
print_status "Installing new SDK build in example app..."

# Remove existing limechat package if it exists
if yarn list @limechat/react-native-widget > /dev/null 2>&1; then
    print_status "Removing existing @limechat/react-native-widget package..."
    yarn remove @limechat/react-native-widget
fi

# Install the new build
yarn add "../$TGZ_FILE"

if [ $? -ne 0 ]; then
    print_error "Failed to install SDK build"
    exit 1
fi

print_success "SDK build installed successfully"

# Step 4: Start the example app
print_status "Starting example app..."
print_warning "The app will start in development mode. Press Ctrl+C to stop."
echo ""
print_status "You can now test the new SDK features in the example app!"
echo ""

yarn start

print_success "Build and test process completed!"
