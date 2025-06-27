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
# Using yarn (recommended)
yarn add @limechat/react-native-widget

# Using npm
npm install @limechat/react-native-widget
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
| `locale` | `string` | ❌ | Language locale (default: `'en'`) |
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | ❌ | Theme preference (default: `'light'`) |
| `customAttributes` | `Record<string, any>` | ❌ | Additional metadata to pass with the chat session |
| `customButton` | `ReactElement` | ❌ | Custom trigger component with optional onPress handler |
| `onWidgetLoad` | `() => void` | ❌ | Callback fired when the chat widget loads successfully |
| `onWidgetClose` | `() => void` | ❌ | Callback fired when the chat widget is closed |
| `onError` | [`ErrorHandler`](#error-handling) | ❌ | Callback for handling errors and monitoring |
| `style` | `ViewStyle` | ❌ | Custom styling for the widget container |
| `iconStyle` | `ViewStyle` | ❌ | Custom styling for the default chat icon |
| `unreadCountStyle` | `ViewStyle` | ❌ | Custom styling for the unread message badge |
| `unreadCountTextStyle` | `TextStyle` | ❌ | Custom styling for the unread count text |

### LimeChatUser

```tsx
interface LimeChatUser {
  name?: string;           // User's display name
  email?: string;          // User's email address
  phone_number?: string;   // User's phone number (with country code)
  identifier_hash?: string; // Secure user identifier hash
}
```

## 🎨 Customization Examples

### Advanced Styling

```tsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  widgetContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20, // Position on left instead of right
  },
  chatIcon: {
    backgroundColor: '#ff6b6b',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  unreadBadge: {
    backgroundColor: '#ff4757',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

<LimeChatWidget
  websiteToken="your-token"
  style={styles.widgetContainer}
  iconStyle={styles.chatIcon}
  unreadCountStyle={styles.unreadBadge}
  unreadCountTextStyle={styles.unreadText}
/>
```

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
      colorScheme={preferences.theme}
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

### Advanced Error Monitoring

```tsx
const handleChatError = (error, errorData) => {
  // Send to error tracking service
  if (error.severity === 'critical' || error.severity === 'high') {
    Sentry.captureException(error, {
      tags: {
        component: 'limechat_widget',
        error_code: error.code,
      },
      extra: errorData,
    });
  }

  // Show user-appropriate messages
  const userMessages = {
    'WIDGET_ERROR_1000': 'Chat setup issue. Please contact support.',
    'WIDGET_ERROR_1100': 'Chat temporarily unavailable. Please try again.',
    'WIDGET_ERROR_1200': 'Connection issue. Check your internet connection.',
    'WIDGET_ERROR_1300': 'Display issue. Refreshing chat interface.',
  };

  if (userMessages[error.code] && error.severity !== 'low') {
    showUserNotification(userMessages[error.code]);
  }
};
```

## 🌟 Advanced Features

### Real-time Unread Count

The SDK automatically displays unread message counts:

```tsx
<LimeChatWidget
  websiteToken="your-token"
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

Users can seamlessly continue conversations across app sessions. This feature works automatically with no additional configuration required.

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
- Automatic WebView permissions handling

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

### Debug Mode

Enable detailed logging to diagnose issues:

```tsx
<LimeChatWidget
  websiteToken="your-token"
  onError={(error, errorData) => {
    // Detailed error information
    console.log('Error Details:', {
      code: error.code,
      type: error.type,
      severity: error.severity,
      message: error.message,
      timestamp: error.timestamp,
      context: errorData,
    });
  }}
  onWidgetLoad={() => console.log('✅ Chat loaded successfully')}
  onWidgetClose={() => console.log('💬 Chat closed')}
/>
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support & Resources

- **Documentation**: [Complete SDK Documentation](https://docs.limechat.ai/react-native)
- **Support**: [support@limechat.ai](mailto:support@limechat.ai)
- **Issues**: [GitHub Issues](https://github.com/limechat/react-native-widget/issues)
- **Community**: [LimeChat Community Forum](https://community.limechat.ai)

---

Made with ❤️ by the LimeChat team
