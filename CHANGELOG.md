# Changelog

All notable changes to the LimeChat React Native SDK will be documented in this file.

## [Unreleased]

### Added
- `baseUrl`, `hideFilePicker` and `unreadCount` props
- `ref` handle with `open(message)` and `sendMessage(event, data)`
- `identifier` on `user`; `set-user` is sent only with both `identifier` and `identifier_hash`

### Fixed
- Apostrophes no longer break injected scripts
- Native messages use the `chatwoot-widget:` prefix the widget reads
- The webview no longer reloads when the conversation token arrives
- Links to other origins open outside the webview
- Exports declared in `index.d.ts` now exist at runtime

### Removed
- Injected `set-locale`, `set-custom-attributes` and `set-color-scheme` messages, which the widget never received
- Dead constants, styles and `defaultProps`
- Tracked `example/.expo` state

## [0.0.5] - 2025-07-02

### Fixed
- Fixed widget icon flickering issue
- Improved widget icon rendering stability
- Enhanced visual consistency across different device configurations

## [0.0.4] - 2025-06-26

### Added
- Complete LimeChat widget integration
- React Native SDK implementation
- WebView-based chat interface
- Custom button support for widget trigger
- Error handling and reporting system
- TypeScript definitions
- Comprehensive test suite
- ESLint configuration and pre-commit hooks