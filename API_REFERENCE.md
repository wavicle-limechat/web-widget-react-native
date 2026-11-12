# API Reference

Complete reference for the LimeChat React Native SDK components, props, and utilities.

## LimeChatWidget

The main component for integrating LimeChat into your React Native application.

### Import

```javascript
import { LimeChatWidget } from '@limechat/react-native-widget';
```

### Props

#### Required Props

##### `websiteToken` (string)

Your unique LimeChat website token from the LimeChat dashboard.

```javascript
<LimeChatWidget websiteToken="MEFFACy4xaovJayhLjSt836h" />
```

**Where to find**: LimeChat Dashboard → Settings → Installation

---

#### Optional Props

##### `user` (LimeChatUser)

User information for personalizing the chat experience.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
    identifier: 'user-123',
    identifier_hash: 'secure_user_hash'
  }}
/>
```

**Type Definition:**
```typescript
interface LimeChatUser {
  name?: string;           // User's display name
  email?: string;          // User's email address  
  phone_number?: string;   // Phone with country code (e.g., +1234567890)
  identifier?: string;     // Your own stable user id
  identifier_hash?: string; // HMAC-SHA256(hmac_token, identifier), computed on your server
  custom_attributes?: Record<string, any>; // Sent with every message the customer types
}
```

`identifier_hash` needs `identifier`. The widget verifies the user only when both are set.

Without them the details are sent unverified. On the customer's first message the server updates the contact, and can merge into an existing contact with the same email or phone.

User custom attributes go with every message the customer types, not onto the contact. The `customAttributes` prop is separate. It goes in the widget url for the session.

##### `baseUrl` (string)

LimeChat base URL. Default: `'https://app.limechat.ai'`. Trailing slashes are removed.

##### `hideFilePicker` (boolean)

Hide the attachment button in the chat. Default: `false`.

##### `unreadCount` (number)

Number shown on the badge, capped at `99+`. Set by the host app. `0` hides the badge. The widget does not update it.

##### `locale` (string)

Language code for the chat interface. Default: `'en'`

```javascript
<LimeChatWidget
  websiteToken="your-token"
  locale="es" // Spanish
/>
```

**Supported locales**: `'en'`, `'es'`, `'fr'`, `'de'`, `'pt'`, and more.

##### `customAttributes` (Record<string, any>)

Additional metadata to pass with the chat session.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  customAttributes={{
    subscription_plan: 'premium',
    app_version: '2.1.0',
    user_segment: 'enterprise',
    source: 'mobile_app'
  }}
/>
```

**Common use cases**:
- User subscription level
- App version for debugging
- User segmentation
- Purchase history
- Geographic region

##### `conversationToken` (string)

Token of the conversation to continue. It wins over the token the widget reported. The widget url is built when the widget opens, so a change applies on the next open.

Clearing the prop (to `undefined`) drops the live token, so the next open starts a new conversation. Use this on logout. If you never pass the prop, remount the widget with a new `key` when the user changes.

```javascript
const [token, setToken] = useState(storedToken);

<LimeChatWidget
  websiteToken="your-token"
  conversationToken={token}
  onConversationTokenChange={(next) => { saveToken(next); setToken(next); }}
/>
```

##### `customButton` (ReactElement)

Custom trigger component to replace the default chat icon.

```javascript
const MyButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.chatButton}>
    <Text>💬 Help</Text>
  </TouchableOpacity>
);

<LimeChatWidget
  websiteToken="your-token"
  customButton={<MyButton onPress={() => console.log('Chat opening!')} />}
/>
```

**Important**: If your custom button has an `onPress` prop, it will be called first, then the chat will open.

##### `style` (ViewStyle)

Custom styling for the widget container.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  style={{
    position: 'absolute',
    bottom: 100,
    left: 20, // Position on left instead of right
    zIndex: 999
  }}
/>
```

##### `iconStyle` (ViewStyle)

Custom styling for the default chat icon.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  iconStyle={{
    backgroundColor: '#ff6b6b',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#fff'
  }}
/>
```

##### `unreadCountStyle` (ViewStyle)

Custom styling for the unread message badge.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  unreadCountStyle={{
    backgroundColor: '#ff4757',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    top: -8,
    right: -8
  }}
/>
```

##### `unreadCountTextStyle` (TextStyle)

Custom styling for the unread count text.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  unreadCountTextStyle={{
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold'
  }}
/>
```

---

#### Event Handlers

##### `onWidgetLoad` (() => void)

Called once per page load, when the widget is ready: the page has loaded and the widget is listening. Held attributes, the held open message and `onConversationTokenChange` run first. A `reload()` fires it again.

It is not called if the page fails or loads but never mounts. A page that returns 200 and never mounts gives no error either. An HTTP error on the page reaches `onError`.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  onWidgetLoad={() => {
    console.log('Chat loaded successfully');
    Analytics.track('chat_widget_loaded');
  }}
/>
```

##### `onConversationTokenChange` ((token: string) => void)

Called with the conversation token the widget reports. Empty tokens are ignored. Store it and pass it back through `conversationToken` to continue the conversation after a restart.

##### `onMessage` ((message: object) => void)

Called with parsed messages from the widget that are not close or token events. The widget sends none today.

##### `onWidgetClose` (() => void)

Called when the chat widget is closed.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  onWidgetClose={() => {
    console.log('Chat closed');
    Analytics.track('chat_widget_closed');
  }}
/>
```

##### `onError` ((error: WidgetError, errorData: WidgetErrorData) => void)

Called when an error occurs. See [Error Handling Guide](./ERROR_CODES.md) for details.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  onError={(error, errorData) => {
    console.error('Chat error:', error.code, error.message);
    
    // Log to crash reporting
    crashlytics().recordError(error);
    
    // Show user-friendly message
    if (error.severity === 'critical') {
      Alert.alert('Chat Unavailable', 'Please try again later');
    }
  }}
/>
```

### Ref handle

```typescript
interface LimeChatWidgetHandle {
  open(message?: string | { content?: string; submitted_values?: unknown }): void;
  sendMessage(event: string, data?: Record<string, unknown>): boolean;
  setMessageAttributes(attributes: Record<string, unknown>): boolean;
  reload(): boolean;
  close(): void;
}
```

```javascript
const widgetRef = useRef(null);

<LimeChatWidget ref={widgetRef} websiteToken="your-token" />

widgetRef.current.open('Hi, I need help');
widgetRef.current.setMessageAttributes({ order_id: 'A-100' });
```

| Method | Behaviour |
|--------|-----------|
| `open(message)` | Shows the widget. Sends the message now if the widget is ready. Otherwise holds it and sends at ready. An empty string or object only shows the widget. Closing the widget drops a held message. If the page failed to load, a message remounts the page and is sent at ready. `open()` with no message does not retry: call `reload()`. |
| `setMessageAttributes(attributes)` | Attaches attributes to the customer's next message. Returns `false` for an empty object, a non-object, an array, or a value `JSON.stringify` rejects. Merged with earlier calls and held until ready, then sent before the open message. Not saved on the contact. File attachments and email-only submits do not use them up. `custom_attributes` on the message payload win over held ones. Needs a widget build that contains `c8126fb7cd`. |
| `sendMessage(event, data)` | Injects an event into the webview. Returns `false` if the widget is closed, `true` when injected, not when the widget read it. Does not wait for ready, so an event sent before ready is lost. |
| `reload()` | Remounts the webview with the live conversation token. Returns `false` if the widget is closed. Held work is sent when the new page is ready. |
| `close()` | Hides the widget the way the widget's own close does. Drops a held open message and calls `onWidgetClose`. Does nothing if the widget is already closed. |

For the attribute notes (JSON values, the auto-start `Hi`, closing, failed sends and reload), see [Message attributes](./README.md#message-attributes) in the README.

#### Web process death

If the web process dies, the SDK reloads the page once. If it dies again before the page is ready, the SDK does not reload. It reports `Widget web process died again before ready` through `onError` (`WIDGET_ERROR_1100`, `context.action` is `webViewProcessGone`). The page is blank after that and the customer cannot close it. In `onError`, call `close()` to dismiss it, call `reload()` to try again, or unmount the widget, for example by changing its `key`. Unmounting drops the in-memory token and held attributes, so pass the stored token back through `conversationToken`. A later `open(message)` also loads the page again. The next ready resets this.

---

## Callback names across the LimeChat SDKs

| Concept | Android | React Native | iOS |
|---------|---------|--------------|-----|
| loaded | `onLoaded` | `onWidgetLoad` | `widgetDidLoad` |
| close | `onClose` | `onWidgetClose` | `widgetDidRequestClose` |
| error | `onError` | `onError` | `widgetDidReceiveError` |
| message | `onMessage` | `onMessage` | `widgetDidReceiveMessage` |
| token | `onConversationTokenChange` | `onConversationTokenChange` | `widgetDidChangeConversationToken` |
| identifier hash | `identifierHash` | `identifier_hash` | `identifierHash` |
| phone | `phoneNumber` | `phone_number` | `phoneNumber` |

---

## Type Definitions

### WidgetError

```typescript
interface WidgetError {
  name: 'WidgetError';
  code: string;                    // Error code (e.g., 'WIDGET_ERROR_1000')
  message: string;                 // Human-readable error message
  type: string;                    // Error category
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp: string;               // ISO timestamp
  toJSON(): WidgetErrorData;       // Serialize to JSON
}
```

### WidgetErrorData

```typescript
interface WidgetErrorData {
  code: string;
  message: string;
  severity: string;
  timestamp: string;
  context?: Record<string, any>;   // Additional error context
}
```

All types are declared in [`index.d.ts`](./index.d.ts).

---

## Utility Functions

### buildWidgetUrl

Build a LimeChat widget URL programmatically.

```javascript
import { buildWidgetUrl } from '@limechat/react-native-widget';

const url = buildWidgetUrl({
  baseUrl: 'https://app.limechat.ai',
  websiteToken: 'your-token',
  locale: 'en',
  customAttributes: {
    plan: 'premium'
  }
});

console.log(url);
// Output: https://app.limechat.ai/widget?website_token=your-token&locale=en&...
```

**Parameters:**
- `baseUrl` (string): LimeChat base URL
- `websiteToken` (string): Your website token
- `locale` (string, optional): Language code
- `hideFilePicker` (boolean, optional): Hide the attachment button
- `customAttributes` (object, optional): Additional metadata
- `cwConversation` (string, optional): Conversation token for continuity

---

## Advanced Usage Examples

### Complete Integration Example

```javascript
import React, { useContext, useState } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { LimeChatWidget } from '@limechat/react-native-widget';
import { UserContext } from './contexts/UserContext';
import Analytics from './services/Analytics';

const ChatIntegration = () => {
  const { user, preferences } = useContext(UserContext);
  const [chatErrors, setChatErrors] = useState(0);

  const handleChatError = (error, errorData) => {
    console.error('Chat Error:', {
      code: error.code,
      severity: error.severity,
      message: error.message,
      context: errorData.context
    });

    // Track errors for monitoring
    Analytics.track('chat_error', {
      error_code: error.code,
      error_severity: error.severity,
      user_id: user.id
    });

    // Show appropriate user message
    if (error.severity === 'critical') {
      setChatErrors(prev => prev + 1);
      
      if (chatErrors < 2) {
        Alert.alert(
          'Chat Temporarily Unavailable',
          'We\'re having trouble with live chat. Would you like to try again?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => setChatErrors(0) }
          ]
        );
      } else {
        // Show fallback after multiple failures
        Alert.alert(
          'Chat Unavailable',
          'Please email us at support@company.com or call (555) 123-4567',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleChatLoad = () => {
    setChatErrors(0); // Reset error count on successful load
    Analytics.track('chat_loaded', { user_id: user.id });
  };

  const CustomChatButton = ({ onPress }) => (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: preferences.primaryColor || '#007bff',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
      onPress={onPress}
    >
      <Text style={{ color: 'white', marginRight: 8 }}>💬</Text>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Help</Text>
    </TouchableOpacity>
  );

  const handleCustomAction = () => {
    // Track custom button press
    Analytics.track('chat_button_pressed', {
      user_id: user.id,
      user_plan: user.subscriptionTier
    });
  };

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      user={{
        name: user.displayName,
        email: user.email,
        phone_number: user.phone,
        identifier: user.id,
        identifier_hash: user.secureHash // computed on your server
      }}
      locale={preferences.language || 'en'}
      customAttributes={{
        subscription_tier: user.subscriptionTier,
        account_type: user.accountType,
        app_version: '2.1.0',
        platform: 'mobile_app',
        user_segment: user.segment,
        last_login: user.lastLoginDate,
        total_orders: user.orderCount
      }}
      customButton={<CustomChatButton onPress={handleCustomAction} />}
      onWidgetLoad={handleChatLoad}
      onWidgetClose={() => Analytics.track('chat_closed')}
      onError={handleChatError}
      unreadCountStyle={{
        backgroundColor: preferences.accentColor || '#ff4757',
        top: -8,
        right: -8
      }}
    />
  );
};

export default ChatIntegration;
```

---

## Platform-Specific Considerations

### iOS

```javascript
// iOS-specific considerations
<LimeChatWidget
  websiteToken="your-token"
  style={{
    // Account for iOS safe area
    paddingBottom: Platform.OS === 'ios' ? 34 : 0 // iPhone X+ home indicator
  }}
/>
```

### Android

```javascript
// Android-specific considerations
<LimeChatWidget
  websiteToken="your-token"
  style={{
    // Account for Android navigation bar
    paddingBottom: Platform.OS === 'android' ? 20 : 0
  }}
/>
```

---

For more examples and advanced use cases, visit our [Documentation Portal](https://docs.limechat.ai/react-native). 