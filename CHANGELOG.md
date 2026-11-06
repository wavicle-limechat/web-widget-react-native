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
- Invalid props no longer loop and spam `onError` on React 18
- `open(message)` is sent after the widget loads, so contact data is set first and no message is dropped
- Load errors no longer include the conversation token or open message
- Web links open without `canOpenURL`, which can return false on Android 11+
- `WidgetError.severity` and `buildWidgetUrl` types in `index.d.ts`

### Changed
- The widget url is built when the widget opens. Changing `locale` or `customAttributes` while it is open applies on the next open
- `onWidgetLoad` fires once on the first open

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