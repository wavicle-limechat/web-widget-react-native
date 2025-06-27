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
  identifier_hash?: string; // Secure identifier for user verification
}
```

##### `locale` (string)

Language code for the chat interface. Default: `'en'`

```javascript
<LimeChatWidget
  websiteToken="your-token"
  locale="es" // Spanish
/>
```

**Supported locales**: `'en'`, `'es'`, `'fr'`, `'de'`, `'pt'`, and more.

##### `colorScheme` ('light' | 'dark' | 'auto')

Theme for the chat interface. Default: `'light'`

```javascript
<LimeChatWidget
  websiteToken="your-token"
  colorScheme="dark"
/>
```

- `'light'`: Light theme
- `'dark'`: Dark theme  
- `'auto'`: Follows system theme

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

Called when the chat widget loads successfully.

```javascript
<LimeChatWidget
  websiteToken="your-token"
  onWidgetLoad={() => {
    console.log('Chat loaded successfully');
    Analytics.track('chat_widget_loaded');
  }}
/>
```

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

### LimeChatWidgetProps

```typescript
interface LimeChatWidgetProps {
  websiteToken: string;
  user?: LimeChatUser;
  locale?: string;
  colorScheme?: 'light' | 'dark' | 'auto';
  customAttributes?: Record<string, any>;
  customButton?: React.ReactElement;
  onWidgetLoad?: () => void;
  onWidgetClose?: () => void;
  onError?: (error: WidgetError, errorData: WidgetErrorData) => void;
  style?: ViewStyle;
  iconStyle?: ViewStyle;
  unreadCountStyle?: ViewStyle;
  unreadCountTextStyle?: TextStyle;
}
```

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
  colorScheme: 'light',
  user: {
    name: 'John Doe',
    email: 'john@example.com'
  },
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
- `colorScheme` (string, optional): Theme preference
- `user` (LimeChatUser, optional): User information
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
      userAgent: errorData.userAgent
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
        identifier_hash: user.secureHash
      }}
      locale={preferences.language || 'en'}
      colorScheme={preferences.theme || 'light'}
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

### Testing and Development Setup

```javascript
// Development component with comprehensive logging
const DevChatWidget = () => {
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(`[DevChat] ${message}`);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Development logs */}
      {__DEV__ && (
        <View style={{ height: 200, backgroundColor: '#f0f0f0', padding: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Development Logs:</Text>
          <ScrollView style={{ flex: 1 }}>
            {logs.map((log, index) => (
              <Text key={index} style={{ fontSize: 12, fontFamily: 'monospace' }}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>
      )}

      <LimeChatWidget
        websiteToken="your-test-token"
        user={{
          name: 'Test User',
          email: 'test@example.com'
        }}
        onWidgetLoad={() => addLog('✅ Widget loaded successfully')}
        onWidgetClose={() => addLog('📱 Widget closed')}
        onError={(error, errorData) => {
          addLog(`❌ Error: ${error.code} - ${error.message}`);
          addLog(`   Severity: ${error.severity}`);
          addLog(`   Context: ${JSON.stringify(errorData.context || {})}`);
        }}
      />
    </View>
  );
};
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

## Performance Tips

### Optimize Re-renders

```javascript
// Memoize user object to prevent unnecessary re-renders
const user = useMemo(() => ({
  name: userData.name,
  email: userData.email,
  phone_number: userData.phone
}), [userData.name, userData.email, userData.phone]);

// Memoize custom attributes
const customAttributes = useMemo(() => ({
  subscription_plan: userPlan,
  app_version: APP_VERSION
}), [userPlan]);

<LimeChatWidget
  websiteToken="your-token"
  user={user}
  customAttributes={customAttributes}
/>
```

### Lazy Loading

```javascript
// Lazy load chat widget when needed
const [showChat, setShowChat] = useState(false);

return (
  <View>
    {showChat ? (
      <LimeChatWidget websiteToken="your-token" />
    ) : (
      <TouchableOpacity onPress={() => setShowChat(true)}>
        <Text>Load Chat</Text>
      </TouchableOpacity>
    )}
  </View>
);
```

---

For more examples and advanced use cases, visit our [Documentation Portal](https://docs.limechat.ai/react-native). 