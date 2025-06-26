# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2024-12-20

### Fixed
- **Fullscreen Modal**: Removed top gap from widget modal to make it truly fullscreen
  - Removed `marginTop: 50` from modal container
  - Removed rounded top corners that were causing the gap
  - Changed modal animation from slide to fade for better fullscreen experience
  - **Added SafeAreaView** to respect device safe areas (notch, status bar, home indicator)
- **Expo Compatibility**: Updated react-native-webview to version 13.13.5 for better Expo compatibility

### Changed
- Modal now opens with fade animation instead of slide-up animation
- Modal covers the entire screen without any margins or gaps while respecting safe areas

## [0.1.2] - 2024-12-20

### Removed
- **BREAKING CHANGE**: Removed lightweight mode functionality
  - Removed `lightweightMode` prop from `LimeChatWidget`
  - Removed `LightweightWidgetIcon` component
  - Simplified widget implementation to use standard `WidgetIcon` only

### Fixed
- Fixed package.json configuration for proper npm package distribution
  - Changed main entry point from `dist/index.js` to `index.js`
  - Updated files array to include `src/` instead of `dist/`
  - Fixed import paths to work correctly when package is installed
- Updated ESLint configuration to work with JavaScript files
- Fixed ErrorBoundary component to handle React Native environment properly

### Changed
- Package now exports source files directly instead of compiled TypeScript
- Improved consistency with proven package structure

## [0.1.1] - 2024-12-19

### Added
- Initial release of LimeChat React Native Widget
- Core widget functionality with modal display
- Support for user data pre-filling
- Custom attributes support
- Color scheme support (light/dark/auto)
- Error boundary protection
- TypeScript definitions
- Comprehensive example application

### Features
- Widget icon with loading states
- WebView integration for chat interface
- Configurable styling options
- Accessibility features
- Cross-platform compatibility (iOS/Android)

## [1.0.0] - 2024-01-XX

### Added
- Initial release of LimeChat React Native Widget SDK
- TypeScript support with full type definitions
- Custom trigger element support via children prop
- Default chat icon with customizable styling
- Modal-based widget display using react-native-modal
- WebView integration for LimeChat widget
- User authentication and custom attributes support
- Locale and color scheme configuration
- Comprehensive error handling and callbacks
- Professional build tooling with yarn
- ESLint configuration for code quality
- Jest testing setup
- Complete documentation and examples

### Features
- ✅ Easy integration with minimal setup
- ✅ Custom trigger elements support
- ✅ TypeScript definitions included
- ✅ Cross-platform (iOS & Android)
- ✅ Lightweight and optimized
- ✅ Professional development workflow 