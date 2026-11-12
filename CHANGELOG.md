# Changelog

All notable changes to the LimeChat React Native SDK will be documented in this file.

## [Unreleased]

> **Upgrade note: unverified contact update.** User details passed to the SDK reach the widget through `rnUser` with no verification. On the customer's first message the server updates the contact, and can merge into an existing contact with the same email or phone. If you use identity validation, pass `identifier` and `identifier_hash` so the contact is verified.

### Added
- `setMessageAttributes(attributes)` on the ref handle. It needs a widget build that contains `c8126fb7cd`
- `reload()` on the ref handle
- `close()` on the ref handle. It hides the widget and calls `onWidgetClose`, so a host can dismiss a blank widget after a second process death
- `onMessage` prop, for widget messages that are not close or token events. The widget sends none today
- `custom_attributes` on `user`
- `baseUrl`, `hideFilePicker` and `unreadCount` props
- `ref` handle with `open(message)` and `sendMessage(event, data)`
- `identifier` on `user`; `set-user` is sent only with both `identifier` and `identifier_hash`

### Fixed
- Held message attributes are dropped when the user or the `conversationToken` prop changes without unmounting, so the next user does not get them
- `reload()` remounts the webview with the live conversation token, so a first-session conversation is kept
- `open(message)` retries a page that failed to load
- A web process death reloads the page once. A second death before ready reports `Widget web process died again before ready` through `onError`
- A throwing `onConversationTokenChange` reaches `onError` when the token event comes before `onLoad`
- Top frame `data:` and `blob:` urls are blocked and not opened
- The named `LimeChatWidget` export is typed in `index.d.ts`
- Main frame HTTP errors reach `onError`, with `statusCode` and `url` in the context
- `set-user` is sent once per page
- The live token is kept under external token management, and clearing the `conversationToken` prop drops it
- An old page's token event after `reload()` is ignored
- An empty conversation token from the widget is ignored
- `onWidgetLoad` still fires when `onConversationTokenChange` throws
- The unread badge caps at `99+`
- The same origin check compares scheme, host and port, and reads ipv6 hosts and backslashes like a browser
- Empty `open` messages are ignored
- Apostrophes no longer break injected scripts
- Native messages use the `chatwoot-widget:` prefix the widget reads
- The webview no longer reloads when the conversation token arrives
- Links to other origins open outside the webview
- Exports declared in `index.d.ts` now exist at runtime
- Invalid props no longer loop and spam `onError` on React 18
- Load errors no longer include the conversation token or open message
- Web links open without `canOpenURL`, which can return false on Android 11+
- `WidgetError.severity` and `buildWidgetUrl` types in `index.d.ts`

### Changed
- The widget url is built when the widget opens. Changing `locale` or `customAttributes` while it is open applies on the next open
- `onWidgetLoad` fires once per page load, when the widget is ready (page loaded and widget listening), not on the first open. A failed page gives no `onWidgetLoad`
- `open(message)` sends now if the widget is ready, and holds the message until ready otherwise. A held message on a failed page is retried by `open(message)`. `open()` with no message does not retry: call `reload()`
- The widget url sends `platform=react-native`, as the other SDKs send their own value
- At ready, held attributes and the open message are sent first, then `onConversationTokenChange`, then `onWidgetLoad`

### Deprecated
- `POST_MESSAGE_EVENTS.WIDGET_LOADED`, which is never sent. Removed at the next major

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