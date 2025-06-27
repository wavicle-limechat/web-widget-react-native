# LimeChat React Native Widget

React Native SDK for integrating LimeChat's customer support widget into your mobile applications.

## Features

- 🚀 **Easy Integration** - Simple setup with just a few lines of code
- 🎨 **Customizable** - Use your own trigger elements or the default chat icon
- 📱 **React Native Optimized** - Built specifically for React Native with TypeScript
- 🔧 **TypeScript Support** - Full TypeScript definitions included
- 🎯 **Lightweight** - Minimal dependencies and optimized bundle size
- 🌐 **Cross Platform** - Works on both iOS and Android

## Installation

### Step 1: Install the package

```bash
# Using yarn (recommended)
yarn add git+https://github.com/wavicle-limechat/web-widget-react-native.git

# Using npm
npm install git+https://github.com/wavicle-limechat/web-widget-react-native.git
```

### Step 2: Install peer dependencies (Required)

```bash
# These are required for the widget to work
yarn add react-native-modal react-native-webview

# Or with npm
npm install react-native-modal react-native-webview
```

### Step 3: iOS setup (iOS only)

```bash
cd ios && pod install
```

> **Important:** The peer dependencies are required and must be installed separately. The widget will not work without `react-native-modal` and `react-native-webview`.

### Local Testing

If you're testing with a local `.tgz` file, follow the same steps but install the local package first:

```bash
# Install local package
yarn add ./path/to/limechat-react-native-widget-0.0.1.tgz

# Then install peer dependencies
yarn add react-native-modal react-native-webview
```

## Basic Usage

### Simple Integration

```tsx
import React from 'react';
import LimeChatWidget from '@limechat/react-native-widget';

export default function App() {
  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      user={{
        name: 'John Doe',
        email: 'john@example.com',
      }}
    />
  );
}
```

### Custom Trigger Element

You can provide your own trigger element as children:

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import LimeChatWidget from '@limechat/react-native-widget';

export default function App() {
  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      user={{
        name: 'John Doe',
        email: 'john@example.com',
      }}
    >
      <View style={{ 
        backgroundColor: '#007bff', 
        padding: 15, 
        borderRadius: 25 
      }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Help & Support
        </Text>
      </View>
    </LimeChatWidget>
  );
}
```

## API Reference

### LimeChatWidget Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `websiteToken` | `string` | ✅ | Your LimeChat website token |
| `user` | `LimeChatUser` | ❌ | User information for the chat session |
| `locale` | `string` | ❌ | Locale for the widget (default: 'en') |
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | ❌ | Color scheme (default: 'light') |
| `customAttributes` | `Record<string, any>` | ❌ | Custom attributes to pass to the widget |
| `customButton` | `ReactElement` | ❌ | Custom button component with optional onPress handler |
| `onWidgetLoad` | `() => void` | ❌ | Callback when widget loads |
| `onWidgetClose` | `() => void` | ❌ | Callback when widget closes |
| `onError` | `(error: Error) => void` | ❌ | Callback for error handling |
| `style` | `ViewStyle` | ❌ | Style for the container |
| `iconStyle` | `ViewStyle` | ❌ | Style for the default icon |
| `unreadCountStyle` | `ViewStyle` | ❌ | Style for the unread count badge |
| `unreadCountTextStyle` | `TextStyle` | ❌ | Style for the unread count text |

### LimeChatUser Interface

```tsx
interface LimeChatUser {
  name?: string;
  email?: string;
  phone_number?: string;
  identifier_hash?: string;
}
```

## Advanced Usage

### Error Handling

```tsx
import React from 'react';
import LimeChatWidget from '@limechat/react-native-widget';

export default function App() {
  const handleError = (error: Error) => {
    console.error('LimeChat Widget Error:', error);
    // Handle error (show toast, log to analytics, etc.)
  };

  const handleWidgetLoad = () => {
    console.log('Widget loaded successfully');
  };

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      onError={handleError}
      onWidgetLoad={handleWidgetLoad}
      onWidgetClose={() => console.log('Widget closed')}
    />
  );
}
```

### Custom Styling

```tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import LimeChatWidget from '@limechat/react-native-widget';

const styles = StyleSheet.create({
  widget: {
    position: 'absolute',
    bottom: 100,
    left: 20, // Position on the left instead of right
  },
  customIcon: {
    backgroundColor: '#ff6b6b',
    width: 80,
    height: 80,
  },
});

export default function App() {
  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      style={styles.widget}
      iconStyle={styles.customIcon}
    />
  );
}
```

### Using with Context

```tsx
import React, { createContext, useContext } from 'react';
import LimeChatWidget from '@limechat/react-native-widget';

const UserContext = createContext(null);

export default function App() {
  const user = useContext(UserContext);

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      user={user}
      customAttributes={{
        plan: 'premium',
        source: 'mobile_app',
      }}
    />
  );
}
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions. You'll get excellent IntelliSense and type checking out of the box.

```tsx
import { LimeChatWidgetProps, LimeChatUser } from '@limechat/react-native-widget';

const widgetProps: LimeChatWidgetProps = {
  websiteToken: 'your-token',
  user: {
    name: 'John Doe',
    email: 'john@example.com',
  },
};
```

## Platform-Specific Notes

### iOS

- Requires iOS 11.0+
- WebView permissions are handled automatically

### Android

- Requires Android API level 21+
- Internet permission is required (automatically added)

## Troubleshooting

### Common Issues

1. **Widget not loading**: Verify your website token is correct
2. **Modal not appearing**: Ensure `react-native-modal` is properly installed
3. **WebView issues**: Make sure `react-native-webview` is linked correctly

### Debug Mode

Enable debug logging by checking the console for any error messages:

```tsx
<LimeChatWidget
  websiteToken="your-token"
  onError={(error) => {
    console.error('Widget Error:', error);
    // Additional debugging
  }}
/>
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@limechat.ai
- 📖 Documentation: https://docs.limechat.ai
- 🐛 Issues: https://github.com/limechat/react-native-widget/issues

## Custom Button

You can provide your own custom button component instead of using the default widget icon. This allows you to create custom buttons with their own onPress handlers that get called before opening the widget:

```jsx
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LimeChatWidget } from '@limechat/react-native-widget';

// Custom button with its own onPress handler
const MyCustomButton = ({ onPress }) => (
  <TouchableOpacity
    style={{ 
      width: 60, 
      height: 60, 
      backgroundColor: '#007bff', 
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    }}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={{ color: 'white', fontSize: 18 }}>💬</Text>
  </TouchableOpacity>
);

// Or using an image with button functionality
const MyImageButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <Image 
      source={{ uri: 'https://example.com/my-icon.png' }}
      style={{ width: 60, height: 60, borderRadius: 30 }}
    />
  </TouchableOpacity>
);

export default function App() {
  const handleCustomButtonPress = () => {
    console.log('Custom action before opening widget!');
    // Add your custom logic here (analytics, logging, etc.)
  };

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      customButton={<MyCustomButton onPress={handleCustomButtonPress} />}
      // ... other props
    />
  );
}
```

**Note:** When using `customButton` with an `onPress` prop, both your custom onPress handler and the widget's default behavior (opening/closing the chat) will be executed. Your custom onPress runs first, followed by the widget opening.

## Styling

### Unread Count Styling

You can customize the appearance of the unread count badge:

```jsx
import { LimeChatWidget } from '@limechat/react-native-widget';

export default function App() {
  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      unreadCountStyle={{
        backgroundColor: '#ff6b6b',
        borderRadius: 15,
        minWidth: 25,
        height: 25,
        borderWidth: 2,
        borderColor: 'white',
      }}
      unreadCountTextStyle={{
        color: 'white',
        fontSize: 14,
        fontWeight: '900',
      }}
    />
  );
}
```

**Available Style Props:**
- `unreadCountStyle`: Style for the unread count badge container (ViewStyle)
- `unreadCountTextStyle`: Style for the unread count number text (TextStyle)
- `iconStyle`: Style for the widget icon
- `style`: Style for the main container

## Dynamic Features

### Unread Count

The unread count badge is automatically managed by events from the web widget:

- **Automatic Display**: The unread count badge only appears when there are unread messages (count > 0)
- **Real-time Updates**: The count updates automatically based on `SET_UNREAD_COUNT` events from the web
- **Customizable Appearance**: Use `unreadCountStyle` and `unreadCountTextStyle` props to customize the look

### Conversation Continuity

The widget supports conversation continuity through the `cw_conversation` parameter:

- **Automatic Handling**: When the web sends a `SET_CW_CONVERSATION` event, the widget automatically includes this parameter in subsequent widget loads
- **Seamless Experience**: Users can continue their conversations across app sessions
- **URL Integration**: The conversation token is automatically appended to the widget URL when available

**Example URL with conversation:**
```
https://app.limechat.ai/widget?website_token=your-token&cw_conversation=eyJhbGciOiJIUzI1NiJ9...
```

These features work automatically and don't require any additional configuration from developers.
