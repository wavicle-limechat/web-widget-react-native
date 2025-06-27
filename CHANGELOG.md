# Release Notes

Stay up to date with the latest improvements and features in the LimeChat React Native SDK.

## Version 0.2.0 - Latest Release 🎉

### ✨ New Features

**Custom Button Support**
- Added `customButton` prop for complete trigger customization
- Support for custom `onPress` handlers in custom buttons
- Both custom action and widget opening now work seamlessly together

**Enhanced Error Handling**
- Comprehensive error categorization system
- Improved error messages with severity levels
- Better debugging information for developers

### 🔧 Improvements

**Performance & Compatibility**
- Fixed critical compatibility issues with Hermes JavaScript engine
- Improved React Native compatibility across versions 0.60+
- Enhanced Expo workflow support (Managed & Bare)

**Developer Experience**
- Updated TypeScript definitions for better IntelliSense
- Improved documentation with more examples
- Enhanced error debugging capabilities

### 🚨 Breaking Changes

- Renamed `customIcon` prop to `customButton` for better clarity
- Removed legacy `lightweightMode` functionality (simplified architecture)

### 📦 Migration Guide

**From v0.1.x to v0.2.0:**

```javascript
// BEFORE (v0.1.x)
<LimeChatWidget
  websiteToken="your-token"
  customIcon={<MyIcon />}
  lightweightMode={true} // Remove this
/>

// AFTER (v0.2.0)
<LimeChatWidget
  websiteToken="your-token"
  customButton={<MyButton onPress={myHandler} />}
/>
```

---

## Version 0.1.3 - December 2024

### 🐛 Bug Fixes

**Modal Display Issues**
- Fixed fullscreen modal display on all devices
- Removed unwanted gaps and margins in chat interface
- Improved modal animations for smoother user experience
- Added proper SafeAreaView support for devices with notches

**Expo Compatibility**
- Updated react-native-webview dependency for better Expo support
- Enhanced compatibility with Expo managed workflow

### 🔧 Technical Improvements
- Changed modal animation from slide to fade for better performance
- Improved modal positioning across different screen sizes

---

## Version 0.1.2 - December 2024

### 🔧 Major Refactoring

**Simplified Architecture**
- Removed lightweight mode for cleaner, more maintainable codebase
- Streamlined widget implementation
- Improved package structure for better distribution

**Package Configuration**
- Fixed installation issues with npm/yarn
- Corrected entry point configurations
- Enhanced TypeScript definitions

### 🚨 Breaking Changes
- **Removed `lightweightMode` prop** - No longer needed with simplified architecture

### 📦 Migration Guide

**From v0.1.1 to v0.1.2:**

```javascript
// BEFORE
<LimeChatWidget
  websiteToken="your-token"
  lightweightMode={true} // Remove this line
/>

// AFTER
<LimeChatWidget
  websiteToken="your-token"
/>
```

---

## Version 0.1.1 - December 2024

### 🎉 Initial Release

**Core Features**
- Complete React Native SDK for LimeChat integration
- Cross-platform support (iOS & Android)
- TypeScript definitions included
- Customizable chat trigger components

**Key Capabilities**
- User authentication and data pre-filling
- Custom attributes support
- Multiple color schemes (light/dark/auto)
- Comprehensive error handling
- Modal-based chat interface

**Developer Tools**
- Complete example application
- Extensive documentation
- Jest testing framework
- ESLint configuration

---

## Compatibility

### Supported React Native Versions
- React Native 0.60 and above
- Expo SDK 40 and above
- Both Hermes and JSC JavaScript engines

### Required Dependencies
- `react-native-modal` ^13.0.0
- `react-native-webview` ^13.0.0

### Platform Requirements
- **iOS**: 11.0 or later
- **Android**: API level 21 (Android 5.0) or later

---

## Getting Help

### 📚 Resources
- [Complete Documentation](https://docs.limechat.ai/react-native)
- [API Reference](https://docs.limechat.ai/react-native/api)
- [Integration Examples](https://docs.limechat.ai/react-native/examples)

### 🤝 Support Channels
- **Technical Support**: [support@limechat.ai](mailto:support@limechat.ai)
- **Bug Reports**: [GitHub Issues](https://github.com/limechat/react-native-widget/issues)
- **Feature Requests**: [Community Forum](https://community.limechat.ai)

### 🔄 Update Instructions

**Using yarn:**
```bash
yarn add @limechat/react-native-widget@latest
```

**Using npm:**
```bash
npm install @limechat/react-native-widget@latest
```

**After updating:**
```bash
cd ios && pod install # iOS only
```

---

*For detailed technical changes and developer-focused information, see our [Technical Changelog](https://github.com/limechat/react-native-widget/releases).* 