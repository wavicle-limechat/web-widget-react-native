# Troubleshooting Guide

Having issues with the LimeChat React Native SDK? This guide covers the most common problems and their solutions.

## 🚀 Quick Solutions

### App Crashes on Launch

**Symptoms**: App crashes immediately when LimeChatWidget is rendered

**Solution**: Ensure peer dependencies are installed
```bash
# Install required dependencies
yarn add react-native-modal react-native-webview

# For iOS
cd ios && pod install
```

**Why this happens**: The SDK requires these peer dependencies to function properly.

---

### Widget Not Appearing

**Symptoms**: Widget doesn't show up on screen

**Common causes & solutions:**

1. **Invalid Website Token**
   ```javascript
   // ✅ Check your token is correct
   <LimeChatWidget websiteToken="MEFFACy4xaovJayhLjSt836h" />
   ```

2. **Check Widget Positioning**
   ```javascript
   // ✅ Ensure widget isn't positioned off-screen
   <LimeChatWidget
     style={{
       position: 'absolute',
       bottom: 50,
       right: 20,
     }}
   />
   ```

3. **Verify Token Status**: Log into your LimeChat dashboard to confirm the token is active

---

### Chat Interface Won't Load

**Symptoms**: Widget appears but chat interface is blank or shows error

**Solutions:**

1. **Check Network Connection**
   ```javascript
   // Add error handling to diagnose
   const handleError = (error, errorData) => {
     console.log('Chat error:', error.code, error.message);
     if (error.code === 'WIDGET_ERROR_1200') {
       // Network issue
       Alert.alert('Connection Issue', 'Please check your internet connection');
     }
   };
   ```

2. **Verify Firewall Settings**: Ensure your app can access `app.limechat.ai`

3. **Test with Simple Configuration**:
   ```javascript
   // Minimal test setup
   <LimeChatWidget
     websiteToken="your-token"
     onError={(error) => console.log('Error:', error)}
   />
   ```

---

### TypeScript Errors

**Symptoms**: TypeScript compilation errors

**Solutions:**

1. **Update TypeScript Definitions**:
   ```bash
   yarn add @limechat/react-native-widget@latest
   ```

2. **Check Import Statement**:
   ```typescript
   // ✅ Correct import
   import { LimeChatWidget } from '@limechat/react-native-widget';
   
   // ❌ Incorrect
   import LimeChatWidget from '@limechat/react-native-widget';
   ```

3. **Type your props correctly**:
   ```typescript
   import { LimeChatWidgetProps } from '@limechat/react-native-widget';
   
   const widgetProps: LimeChatWidgetProps = {
     websiteToken: 'your-token',
     user: {
       name: 'John Doe',
       email: 'john@example.com',
     },
   };
   ```

---

## 📱 Platform-Specific Issues

### iOS Issues

**Problem**: Widget not working on iOS Simulator
- **Solution**: Test on physical device - some network features don't work reliably in simulator

**Problem**: Modal not appearing correctly
- **Solution**: Ensure you've run `pod install` after installing dependencies
  ```bash
  cd ios && pod install
  ```

**Problem**: Build errors related to WebView
- **Solution**: Clean build folder and reinstall pods
  ```bash
  cd ios
  rm -rf Pods Podfile.lock
  pod install
  ```

### Android Issues

**Problem**: Widget crashes on older Android versions
- **Solution**: Verify minimum SDK version is 21 (Android 5.0) in `android/app/build.gradle`:
  ```gradle
  android {
    defaultConfig {
      minSdkVersion 21  // Minimum required
    }
  }
  ```

**Problem**: Network security issues
- **Solution**: Add network security config if needed for HTTP connections (though LimeChat uses HTTPS)

---

## 🔧 Expo-Specific Issues

### Expo Managed Workflow

**Problem**: Dependencies not installing correctly
- **Solution**: Use Expo development build for custom native dependencies:
  ```bash
  expo install react-native-modal react-native-webview
  npx expo run:ios    # or expo run:android
  ```

**Problem**: Widget not working in Expo Go
- **Solution**: Expo Go doesn't support custom native dependencies. Use development build instead:
  ```bash
  npx create-expo-app --template
  expo install expo-dev-client
  ```

### Expo Bare Workflow

Follow the same installation steps as standard React Native projects.

---

## 🐛 Debugging Techniques

### Enable Debug Logging

```javascript
const App = () => {
  const handleError = (error, errorData) => {
    // Comprehensive error logging
    console.log('=== LimeChat Debug Info ===');
    console.log('Error Code:', error.code);
    console.log('Error Type:', error.type);
    console.log('Severity:', error.severity);
    console.log('Message:', error.message);
    console.log('Timestamp:', error.timestamp);
    console.log('Context:', errorData);
    console.log('===========================');
  };

  const handleWidgetLoad = () => {
    console.log('✅ Chat widget loaded successfully');
  };

  const handleWidgetClose = () => {
    console.log('💬 Chat widget closed');
  };

  return (
    <LimeChatWidget
      websiteToken="your-token"
      onError={handleError}
      onWidgetLoad={handleWidgetLoad}
      onWidgetClose={handleWidgetClose}
    />
  );
};
```

### Test with Minimal Configuration

```javascript
// Start with the simplest possible setup
const MinimalTest = () => (
  <LimeChatWidget
    websiteToken="your-token"
    onError={(error) => console.error('Chat Error:', error)}
  />
);
```

### Verify Network Connectivity

```javascript
import NetInfo from '@react-native-community/netinfo';

const checkNetworkAndInitChat = async () => {
  const networkState = await NetInfo.fetch();
  console.log('Network connected:', networkState.isConnected);
  console.log('Network type:', networkState.type);
  
  if (!networkState.isConnected) {
    Alert.alert('No Internet', 'Please check your connection and try again');
    return;
  }
  
  // Initialize chat widget
};
```

---

## 🔍 Common Error Codes

| Error Code | Meaning | Quick Fix |
|------------|---------|-----------|
| `WIDGET_ERROR_1000` | Configuration issue | Check website token, user data format |
| `WIDGET_ERROR_1100` | Chat interface problem | Check network, try refreshing |
| `WIDGET_ERROR_1200` | Network connection issue | Verify internet connection |
| `WIDGET_ERROR_1300` | UI rendering issue | Usually minor, check console for details |

For detailed error handling, see our [Error Handling Guide](./ERROR_CODES.md).

---

## 🏥 Health Check Script

Use this script to verify your setup:

```javascript
const HealthCheck = () => {
  useEffect(() => {
    console.log('=== LimeChat Health Check ===');
    
    // Check React Native version
    console.log('RN Version:', require('react-native/package.json').version);
    
    // Check required dependencies
    try {
      require('react-native-modal');
      console.log('✅ react-native-modal: installed');
    } catch (e) {
      console.log('❌ react-native-modal: missing');
    }
    
    try {
      require('react-native-webview');
      console.log('✅ react-native-webview: installed');
    } catch (e) {
      console.log('❌ react-native-webview: missing');
    }
    
    // Check platform
    console.log('Platform:', Platform.OS, Platform.Version);
    
    console.log('===============================');
  }, []);

  return (
    <LimeChatWidget
      websiteToken="your-token"
      onWidgetLoad={() => console.log('✅ Widget health check passed')}
      onError={(error) => console.log('❌ Widget health check failed:', error.code)}
    />
  );
};
```

---

## 📞 Getting Additional Help

### Before Contacting Support

Please gather this information:

1. **Environment Details**:
   - React Native version
   - Platform (iOS/Android) and version
   - Device model (if applicable)
   - SDK version

2. **Error Information**:
   - Error codes from console
   - Steps to reproduce the issue
   - Screenshots if relevant

3. **Configuration**:
   - Simplified code example showing the issue
   - Package.json dependencies

### Support Channels

**Quick Questions**:
- 📚 [Documentation](https://docs.limechat.ai/react-native)
- 💬 [Community Forum](https://community.limechat.ai)

**Technical Issues**:
- 📧 Email: [support@limechat.ai](mailto:support@limechat.ai)
- 🐛 GitHub: [Report Bug](https://github.com/limechat/react-native-widget/issues)

**For Priority Support**:
- Include "React Native SDK" in subject line
- Attach relevant code snippets and error logs
- Mention your LimeChat plan for faster response

---

## 🔄 Regular Maintenance

### Keep Dependencies Updated

```bash
# Check for updates
yarn outdated

# Update LimeChat SDK
yarn add @limechat/react-native-widget@latest

# Update peer dependencies
yarn add react-native-modal@latest react-native-webview@latest

# iOS only - update pods
cd ios && pod update
```

### Monitor Console for Warnings

Watch for these patterns in your logs:
- `LimeChat Widget Error:` - SDK errors
- `Widget loaded successfully` - Successful initialization
- Network-related warnings

---

*This guide is updated regularly. For the latest troubleshooting tips, visit our [online documentation](https://docs.limechat.ai/react-native/troubleshooting).* 