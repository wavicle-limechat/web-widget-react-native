# LimeChat React Native SDK

A powerful, easy-to-integrate React Native SDK that brings LimeChat's customer support capabilities directly into your mobile applications. Designed for modern React Native apps with full TypeScript support and cross-platform compatibility.

## ✨ Why Choose LimeChat React Native SDK?

- **🚀 Quick Integration** - Get up and running in minutes with minimal setup
- **🎨 Fully Customizable** - Match your app's design with custom buttons, colors, and styling
- **📱 React Native Optimized** - Built specifically for React Native with performance in mind
- **🔧 TypeScript Ready** - Complete TypeScript definitions for better development experience
- **🌐 Universal Support** - Works seamlessly on iOS, Android, and Expo projects
- **🎯 Lightweight** - Minimal bundle impact with optimized dependencies

## 📦 Installation

### Step 1: Install the SDK

```bash
# Using yarn (recommended). not published on npm, install from the git tag
yarn add github:wavicle-limechat/web-widget-react-native#v0.2.0-beta.1

# Using npm
npm install github:wavicle-limechat/web-widget-react-native#v0.2.0-beta.1
```

### Step 2: Install Required Dependencies

```bash
# These peer dependencies are required
yarn add react-native-modal react-native-webview

# Or with npm
npm install react-native-modal react-native-webview
```

### Step 3: iOS Setup (iOS only)

```bash
cd ios && pod install
```

> **Note:** The peer dependencies `react-native-modal` and `react-native-webview` are required for the SDK to function properly.

## 🚀 Quick Start

### Basic Implementation

```tsx
import React from 'react';
import { LimeChatWidget } from '@limechat/react-native-widget';

export default function App() {
  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      user={{
        name: 'John Doe',
        email: 'john@example.com',
        phone_number: '+1234567890'
      }}
    />
  );
}
```

### Custom Button Implementation

Create your own chat trigger with custom styling and actions:

```tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { LimeChatWidget } from '@limechat/react-native-widget';

export default function App() {
  const handleCustomAction = () => {
    console.log('Tracking chat button press');
    // Add your analytics or custom logic here
  };

  const CustomChatButton = ({ onPress }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 25,
        position: 'absolute',
        bottom: 50,
        right: 20,
      }}
      onPress={onPress}
    >
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        💬 Need Help?
      </Text>
    </TouchableOpacity>
  );

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      user={{
        name: 'Jane Smith',
        email: 'jane@example.com',
      }}
      customButton={<CustomChatButton onPress={handleCustomAction} />}
    />
  );
}
```

## 📚 API Reference

### LimeChatWidget Props

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `websiteToken` | `string` | ✅ | Your LimeChat website token from the dashboard |
| `user` | [`LimeChatUser`](#limechatuser) | ❌ | User information for personalized chat experience |
| `baseUrl` | `string` | ❌ | LimeChat base URL (default: `'https://app.limechat.ai'`) |
| `locale` | `string` | ❌ | Language locale (default: `'en'`) |
| `hideFilePicker` | `boolean` | ❌ | Hide the attachment button in the chat (default: `false`) |
| `customAttributes` | `Record<string, any>` | ❌ | Additional metadata to pass with the chat session |
| `conversationToken` | `string` | ❌ | Token of the conversation to continue. Wins over the live token. See [Conversation Continuity](#conversation-continuity) |
| `onConversationTokenChange` | `(token: string) => void` | ❌ | Called with the conversation token the widget reports. Store it to continue the conversation later |
| `customButton` | `ReactElement` | ❌ | Custom trigger component with optional onPress handler |
| `onWidgetLoad` | `() => void` | ❌ | Called once per page load, when the widget is ready. It is not called if the page fails or loads but never mounts |
| `onWidgetClose` | `() => void` | ❌ | Callback fired when the chat widget is closed |
| `onMessage` | `(message: object) => void` | ❌ | Called with messages from the widget that are not close or token events. The widget sends none today |
| `onError` | [`ErrorHandler`](#error-handling) | ❌ | Callback for handling errors and monitoring |
| `style` | `ViewStyle` | ❌ | Custom styling for the widget container |
| `iconStyle` | `ViewStyle` | ❌ | Custom styling for the default chat icon |
| `unreadCount` | `number` | ❌ | Number shown on the badge, capped at `99+`. Set by the host app. The widget does not update it |
| `unreadCountStyle` | `ViewStyle` | ❌ | Custom styling for the unread message badge |
| `unreadCountTextStyle` | `TextStyle` | ❌ | Custom styling for the unread count text |

### LimeChatUser

```tsx
interface LimeChatUser {
  name?: string;           // User's display name
  email?: string;          // User's email address
  phone_number?: string;   // User's phone number (with country code)
  identifier?: string;     // Your own stable user id
  identifier_hash?: string; // HMAC-SHA256(hmac_token, identifier), computed on your server
  custom_attributes?: Record<string, any>; // Sent with every message the customer types
}
```

`identifier_hash` only works together with `identifier`. The widget verifies the user only when both are set.

User custom attributes go with every message the customer types, not onto the contact.

Without them the details are sent unverified. With every message the server updates the contact, and can merge into an existing contact with the same email or phone.

### Ref handle

`LimeChatWidget` accepts a `ref` with these methods:

```tsx
const widgetRef = useRef(null);

<LimeChatWidget ref={widgetRef} websiteToken="your-token" />

widgetRef.current.open();                  // open the widget
widgetRef.current.open('Hi, I need help'); // open and send a message
widgetRef.current.open({ content: 'Hi', submitted_values: {} });
widgetRef.current.setMessageAttributes({ order_id: 'A-100' }); // true if accepted
widgetRef.current.sendMessage('set-label', { label: 'vip' });  // false if the widget is closed
widgetRef.current.reload();                // false if the widget is closed
widgetRef.current.close();                 // hide the widget
widgetRef.current.reset();                 // clear the conversation, call on logout
```

- `open(message)` shows the widget. If the widget is ready the message is sent now. If not, it is held and sent once at ready. An empty string or object only shows the widget. A message object with no `content` and other keys, such as `submitted_values`, gets `content: "Hi"`, as in the web SDK.
- Closing the widget drops a held `open` message.
- If the page fails to load, a held message stays held. `open(message)` with a message remounts the page and sends the message at ready. `open()` with no message does not retry: call `reload()`.
- `sendMessage` returns `true` when the event was injected into the webview, not when the widget read it. It does not wait for ready, so an event sent before ready is lost.
- `reload()` remounts the webview with the live conversation token. Held attributes and the open message are sent when the new page is ready.
- `close()` hides the widget the way the widget's own close does: it drops a held open message and calls `onWidgetClose`. It does nothing if the widget is already closed.
- `reset()` clears this widget's conversation, like the web SDK's `reset()`: it drops the live conversation token and the user (and a `conversationToken` or `user` prop you passed in, until it changes), drops held message attributes and a held open message, and reloads the page without a conversation if it is showing. It does not close the widget. Call it on logout. If the same user logs back in without the prop changing, pass the user again after clearing it.

### Message attributes

`setMessageAttributes(attributes)` attaches attributes to the customer's next message. It needs a widget build that contains `c8126fb7cd`.

- It returns `false` and does nothing for an empty object, a non-object, an array, or a value `JSON.stringify` rejects.
- Pass JSON values. A `NaN` becomes `null`, a `Date` becomes an ISO string, and an unknown object is sent with its fields.
- Calls are merged and held until the widget is ready. They are sent once, before the open message.
- The widget's auto-start `Hi` counts as the next message. With no `open(message)`, the attributes can land on `Hi` and not on what the customer types.
- If the customer closes the widget before they are sent, they stay held. If they were already sent and the customer closes without sending, set them again.
- After the customer's message is sent, the widget clears the attributes. If that message fails, the widget keeps them for the next one. Attributes already sent to the widget are lost on a page reload. Attributes still held are kept.
- Attributes are not saved on the contact. They go on the message only.
- File attachments and email-only submits do not use up the held attributes. They stay for the next message.
- `custom_attributes` on the message payload win over held ones for the same key.
- Held attributes are dropped when the user (`identifier`, `email` or `phone_number`) or the `conversationToken` prop changes while the widget stays mounted, so the next user does not get them. A first token after none, a reload and a process death keep them.

### Ready

The widget is ready when the page has loaded and the widget is listening. At ready, the SDK sends `set-user` (only when `identifier` and `identifier_hash` are both set), then held attributes, then the held open message, then calls `onConversationTokenChange`, then `onWidgetLoad`. `onWidgetLoad` runs once per page load, so a `reload()` fires it again.

If the web process dies, the SDK reloads the page once. If it dies again before the page is ready, the SDK does not reload. It reports `Widget web process died again before ready` through `onError` (`WIDGET_ERROR_1100`, `context.action` is `webViewProcessGone`). The page is blank after that and the customer cannot close it. In `onError`, call `close()` to dismiss it, call `reload()` to try again, or unmount the widget, for example by changing its `key`. Unmounting drops the in-memory token and held attributes, so pass the stored token back through `conversationToken`. A later `open(message)` also loads the page again. The next ready resets this.

A page that returns 200 but never mounts gives no `onWidgetLoad` and no error. An HTTP error on the page reaches `onError`.

## 🎨 Customization Examples

### User Context Integration

```tsx
import React, { useContext } from 'react';
import { UserContext } from './contexts/UserContext';

export default function ChatIntegration() {
  const { user, preferences } = useContext(UserContext);

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      user={{
        name: user.displayName,
        email: user.email,
        phone_number: user.phone,
      }}
      customAttributes={{
        subscription_plan: user.subscriptionTier,
        app_version: '2.1.0',
        user_segment: preferences.segment,
      }}
    />
  );
}
```

## 🛠️ Error Handling

### Basic Error Handler

```tsx
const handleChatError = (error, errorData) => {
  console.error('Chat Error:', {
    code: error.code,
    message: error.message,
    severity: error.severity,
  });

  // Handle based on severity
  switch (error.severity) {
    case 'critical':
      // Show fallback support option
      showFallbackSupport();
      break;
    case 'high':
      // Log to analytics service
      Analytics.track('chat_error', errorData);
      break;
    case 'medium':
      // Show user notification
      showToast('Chat temporarily unavailable');
      break;
    case 'low':
      // Silent logging for debugging
      Logger.debug('Chat minor issue', error);
      break;
  }
};

<LimeChatWidget
  websiteToken="your-token"
  onError={handleChatError}
/>
```

See [ERROR_CODES.md](./ERROR_CODES.md) for the error codes, monitoring and recovery examples.

## 🌟 Advanced Features

### Unread Count

The unread badge is driven by the host app through `unreadCount`:

```tsx
<LimeChatWidget
  websiteToken="your-token"
  unreadCount={3}
  unreadCountStyle={{
    backgroundColor: '#ff4757',
    top: -8,
    right: -8,
  }}
  unreadCountTextStyle={{
    fontSize: 11,
    fontWeight: '900',
  }}
/>
```

### Conversation Continuity

The SDK keeps the conversation token in memory only. To continue a conversation across app launches, store the token from `onConversationTokenChange` and pass it back through `conversationToken`.

- A `conversationToken` prop wins over the token the widget reported. The widget url is built when it opens, so a change applies on the next open.
- Clearing the prop (to `undefined`) drops the live token.
- `reset()` on the ref handle clears the conversation. Call it on logout. It drops the live token and the user, and ignores the current `conversationToken` and `user` props until they change, so clear your own stored token and user too.
- A change of user (`identifier`, `email` or `phone_number`) to a different user, or to none, drops the live token. It applies on the next open, and the widget is not reloaded while it is open. The first login after an anonymous session, and a new `name` for the same identity, keep it. A `conversationToken` prop still wins. Call `reset()` on logout.

### Multi-language Support

```tsx
<LimeChatWidget
  websiteToken="your-token"
  locale="es" // Spanish
  user={{
    name: 'Juan Pérez',
    email: 'juan@example.com',
  }}
/>
```

## 📱 Platform Compatibility

### iOS Requirements
- iOS 11.0 or later

### Android Requirements  
- Android API level 21 (Android 5.0) or later
- Internet permission (automatically included)

### Expo Compatibility
- ✅ Expo Managed Workflow
- ✅ Expo Bare Workflow
- ✅ Expo Development Build

## 🔧 TypeScript Support

Full TypeScript definitions are included for the best development experience:

```tsx
import { LimeChatWidgetProps, LimeChatUser } from '@limechat/react-native-widget';

const chatConfig: LimeChatWidgetProps = {
  websiteToken: 'your-token',
  user: {
    name: 'Developer',
    email: 'dev@company.com',
  },
  onError: (error, errorData) => {
    // Fully typed error handling
    console.log(error.severity); // TypeScript knows this exists
  },
};
```

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Widget not appearing** | Verify your `websiteToken` is correct and active |
| **App crashes on launch** | Ensure peer dependencies are installed: `react-native-modal` and `react-native-webview` |
| **Chat not loading** | Check internet connection and firewall settings |
| **TypeScript errors** | Make sure you're using the latest version with updated type definitions |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more, including debug logging.


## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support & Resources

- **Documentation**: [Complete SDK Documentation](https://docs.limechat.ai/react-native)
- **Support**: [support@limechat.ai](mailto:support@limechat.ai)
- **Issues**: [GitHub Issues](https://github.com/wavicle-limechat/web-widget-react-native/issues)
- **Community**: [LimeChat Community Forum](https://community.limechat.ai)

---

Made with ❤️ by the LimeChat team
