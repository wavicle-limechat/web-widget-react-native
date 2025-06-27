# Error Handling Guide

A comprehensive guide to handling errors and monitoring issues in the LimeChat React Native SDK.

## Overview

The LimeChat SDK provides a robust error handling system to help you monitor chat functionality and provide the best user experience. All errors are categorized by type and severity to help you respond appropriately.

## Error Categories

### 🔧 Configuration Errors
**Error Code:** `WIDGET_ERROR_1000`  
**Severity:** Critical  

These errors occur when there's an issue with your SDK setup or configuration.

**Common scenarios:**
- Invalid or missing website token
- Malformed user data
- Invalid custom attributes format

**Example handling:**
```javascript
const handleConfigError = (error) => {
  // Show user-friendly message
  Alert.alert(
    'Chat Setup Issue',
    'There was a problem initializing the chat. Please contact support.',
    [{ text: 'OK' }]
  );
  
  // Log for debugging
  console.error('Config error:', error.message);
};
```

### 🌐 WebView Errors
**Error Code:** `WIDGET_ERROR_1100`  
**Severity:** High  

These errors relate to the chat interface loading and display.

**Common scenarios:**
- Chat interface failed to load
- JavaScript errors in the chat window
- Network connectivity issues during chat

**Example handling:**
```javascript
const handleWebViewError = (error) => {
  // Show retry option to user
  showRetryDialog('Chat temporarily unavailable. Would you like to try again?');
  
  // Track for monitoring
  Analytics.track('chat_webview_error', { error_code: error.code });
};
```

### 📡 Network Errors
**Error Code:** `WIDGET_ERROR_1200`  
**Severity:** High  

These errors occur when there are network connectivity or API communication issues.

**Common scenarios:**
- Failed to fetch chat configuration
- Network timeout
- Server connectivity issues

**Example handling:**
```javascript
const handleNetworkError = (error) => {
  // Check network connectivity
  if (!isConnected) {
    showOfflineMessage();
  } else {
    // Show retry option
    showToast('Connection issue. Please try again.');
  }
};
```

### 🎨 Component Errors
**Error Code:** `WIDGET_ERROR_1300`  
**Severity:** Medium  

These errors relate to UI rendering and component functionality.

**Common scenarios:**
- Failed to load custom icons
- UI rendering issues
- Display problems

**Example handling:**
```javascript
const handleComponentError = (error) => {
  // Log for debugging - usually doesn't affect core functionality
  console.warn('UI issue:', error.message);
  
  // Continue with default behavior
};
```

### ❓ Unknown Errors
**Error Code:** `WIDGET_ERROR_1900`  
**Severity:** Low  

Unexpected errors that don't fit into other categories.

**Example handling:**
```javascript
const handleUnknownError = (error) => {
  // Log for analysis
  console.log('Unexpected error:', error.message);
  
  // Report to error tracking service if available
  errorTracking.capture(error);
};
```

## Severity Levels

| Level | Description | Recommended Action |
|-------|-------------|-------------------|
| **Critical** | Chat completely broken | Show fallback support options, alert user |
| **High** | Major functionality affected | Show user notification, log for monitoring |
| **Medium** | Some features affected | Silent logging, chat remains usable |
| **Low** | Minor issues | Debug logging only |

## Implementation Examples

### Basic Error Handler

```javascript
import { LimeChatWidget } from '@limechat/react-native-widget';
import { Alert } from 'react-native';

const App = () => {
  const handleChatError = (error, errorData) => {
    console.log('Chat Error:', {
      code: error.code,
      message: error.message,
      severity: error.severity,
    });

    // Handle based on severity
    switch (error.severity) {
      case 'critical':
        // Show fallback support option
        Alert.alert(
          'Chat Unavailable',
          'Live chat is currently unavailable. Please email support@yourcompany.com',
          [{ text: 'OK' }]
        );
        break;
        
      case 'high':
        // Show retry option
        Alert.alert(
          'Connection Issue',
          'Having trouble connecting to chat. Try again?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => retryChat() }
          ]
        );
        break;
        
      case 'medium':
        // Show subtle notification
        showToast('Chat may be slow to load');
        break;
        
      case 'low':
        // Silent logging
        console.debug('Minor chat issue:', error.message);
        break;
    }
  };

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      onError={handleChatError}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
      }}
    />
  );
};
```

### Advanced Error Monitoring

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

const handleChatError = (error, errorData) => {
  // Log all errors for monitoring
  console.log('Chat Error Details:', {
    code: error.code,
    type: error.type,
    severity: error.severity,
    message: error.message,
    timestamp: error.timestamp,
    userAgent: errorData.userAgent,
    context: errorData.context,
  });

  // Send critical and high severity errors to crash reporting
  if (error.severity === 'critical' || error.severity === 'high') {
    crashlytics().recordError(new Error(`LimeChat Error: ${error.message}`), {
      code: error.code,
      severity: error.severity,
      context: JSON.stringify(errorData),
    });
  }

  // User-friendly error messages
  const userMessages = {
    'WIDGET_ERROR_1000': {
      title: 'Chat Setup Issue',
      message: 'There was a problem with the chat configuration. Please contact support.',
    },
    'WIDGET_ERROR_1100': {
      title: 'Chat Loading Issue',
      message: 'The chat interface is having trouble loading. Please try again.',
    },
    'WIDGET_ERROR_1200': {
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
    },
    'WIDGET_ERROR_1300': {
      title: 'Display Issue',
      message: 'Chat interface may look different than expected.',
    },
  };

  // Show appropriate message to user
  const userMessage = userMessages[error.code];
  if (userMessage && error.severity !== 'low') {
    if (error.severity === 'critical') {
      Alert.alert(userMessage.title, userMessage.message);
    } else {
      showToast(userMessage.message);
    }
  }
};
```

### Error Recovery Strategies

```javascript
const ChatComponent = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  const handleChatError = (error, errorData) => {
    if (error.severity === 'critical') {
      if (retryCount < 2) {
        // Attempt automatic retry
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          // Force re-render of widget
        }, 2000);
      } else {
        // Show fallback after 2 failed attempts
        setShowFallback(true);
      }
    }
  };

  if (showFallback) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>Chat Temporarily Unavailable</Text>
        <Text style={styles.fallbackMessage}>
          Please email us at support@yourcompany.com or call (555) 123-4567
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setShowFallback(false);
            setRetryCount(0);
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LimeChatWidget
      websiteToken="your-website-token"
      onError={handleChatError}
      // ... other props
    />
  );
};
```

## Best Practices

### 1. Always Implement Error Handling
```javascript
// ✅ Good - Always provide an error handler
<LimeChatWidget 
  websiteToken="your-token"
  onError={handleError}
/>

// ❌ Avoid - No error handling
<LimeChatWidget websiteToken="your-token" />
```

### 2. Provide User-Friendly Messages
```javascript
// ✅ Good - Clear, helpful message
"Chat is temporarily unavailable. Please try again or email support@company.com"

// ❌ Avoid - Technical error message
"WebView failed to load with status 500"
```

### 3. Log Errors for Monitoring
```javascript
// ✅ Good - Structured logging
console.log('Chat Error:', {
  code: error.code,
  severity: error.severity,
  userToken: user.id,
  timestamp: new Date().toISOString(),
});

// ❌ Avoid - No logging
// Silent failures make debugging difficult
```

### 4. Implement Fallback Support Options
```javascript
const showFallbackSupport = () => {
  Alert.alert(
    'Chat Unavailable',
    'Live chat is currently down. How else can we help?',
    [
      { text: 'Email Support', onPress: () => openEmail('support@company.com') },
      { text: 'Call Us', onPress: () => openPhone('+1-555-123-4567') },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
};
```

## Error Object Structure

Each error provides detailed information for debugging and monitoring:

```javascript
{
  name: 'WidgetError',           // Always 'WidgetError'
  code: 'WIDGET_ERROR_1000',     // Specific error code
  message: 'Error description',   // Human-readable description
  type: 'configuration',          // Error category
  severity: 'critical',           // Severity level
  timestamp: '2023-...',          // When the error occurred
  context: {                      // Additional context
    action: 'propValidation',
    websiteToken: 'abc123...',
    // ... other relevant data
  }
}
```

## Testing Error Handling

### Simulate Errors for Testing

```javascript
// Test with invalid token
<LimeChatWidget 
  websiteToken="invalid-token"
  onError={handleError}
/>

// Test with malformed user data
<LimeChatWidget 
  websiteToken="valid-token"
  user="invalid-user-format" // Should be object, not string
  onError={handleError}
/>
```

### Verify Error Handling Works

1. **Test with invalid configuration** - Ensure critical errors show appropriate messages
2. **Test with poor network** - Verify network errors are handled gracefully  
3. **Test error recovery** - Confirm retry mechanisms work as expected
4. **Test fallback UI** - Ensure users have alternative support options

## Support

If you need help implementing error handling or have questions about specific error codes:

- **Documentation**: [Complete Error Handling Guide](https://docs.limechat.ai/react-native/error-handling)
- **Support**: [support@limechat.ai](mailto:support@limechat.ai)
- **Community**: [LimeChat Community Forum](https://community.limechat.ai) 