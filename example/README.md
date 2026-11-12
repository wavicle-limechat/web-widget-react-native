# LimeChat Widget React Native Example

This is an example React Native app built with Expo that demonstrates how to integrate the LimeChat Widget into your mobile application.

## Features

- 👤 **User Pre-filling**: Demonstrate user information integration
- 🔧 **Ref API**: open, setMessageAttributes, reload, reset and close
- 📱 **Mobile Optimized**: Built specifically for React Native/Expo
- 🛡️ **Error Handling**: Proper error boundary implementation
- ♿ **Accessibility**: Screen reader and accessibility support

## Prerequisites

- Node.js (version 16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android emulator/device

## Quick Start

1. **Install dependencies** (the example uses the local sdk through `"@limechat/react-native-widget": "file:.."`):
   ```bash
   cd example
   yarn install
   ```
   yarn copies the package, so after changing the sdk run `yarn install --force` or `yarn upgrade @limechat/react-native-widget`. `metro.config.js` resolves modules only from `example/node_modules`, so the copied sdk does not bring a second react.

2. **Start the development server**:
   ```bash
   yarn start
   ```

3. **Run on your preferred platform**:
   - iOS: Press `i` in the terminal or run `yarn ios`
   - Android: Press `a` in the terminal or run `yarn android`
   - Web: Press `w` in the terminal or run `yarn web`

## Configuration

Before running the app, replace the placeholders in `App.js`: `WEBSITE_TOKEN` and `identifier_hash` in `user`.

`App.js` also uses the ref handle. the buttons call `open('hi')`, `open({ submitted_values })`, `setMessageAttributes({...})`, `reload()`, `reset()` and `close()`.

## Widget Props

The example demonstrates these key LimeChat Widget properties:

- `websiteToken`: Your LimeChat website token
- `user`: User information object (name, email, phone)
- `locale`: Language locale (e.g., 'en', 'es', 'fr')
- `customAttributes`: Additional user metadata
- `onWidgetLoad`: Callback when widget loads successfully
- `onWidgetClose`: Callback when widget is closed
- `onError`: Error handling callback

## Project Structure

```
example/
├── App.js              # Main application component with widget integration
├── package.json        # Dependencies and scripts
├── app.json           # Expo app configuration
├── metro.config.js    # resolves modules from example/node_modules only
└── README.md          # This file
```

## Testing

The app includes interactive elements to test different widget configurations:

1. **Widget Interaction**: The widget icon should appear and be interactive
2. **Console Logging**: Check the console for widget lifecycle events

## Troubleshooting

### Common Issues

1. **Widget not appearing**: Check that your `websiteToken` is valid
2. **Styles not applying**: Ensure you're using compatible React Native versions
3. **Network errors**: Verify your internet connection and LimeChat service status

### Dependencies

This example requires these key dependencies:
- `react-native-webview`: For rendering the chat interface
- `react-native-modal`: For modal functionality
- `@react-native-async-storage/async-storage`: For local data persistence
- `@react-native-community/netinfo`: For network status detection

## Integration into Your App

To integrate the LimeChat Widget into your own React Native app:

1. Install the required dependencies:
   ```bash
   npm install @limechat/react-native-widget react-native-webview react-native-modal
   ```

2. Import and use the widget:
   ```javascript
   import { LimeChatWidget } from '@limechat/react-native-widget';
   
   // In your component JSX
   <LimeChatWidget
     websiteToken="your-website-token"
     user={userObject}
     // ... other props
   />
   ```

3. Handle the required permissions and configurations as shown in this example.

## Support

For issues related to the LimeChat Widget SDK, please refer to the main package documentation or contact LimeChat support.

For Expo-specific issues, check the [Expo documentation](https://docs.expo.dev/).

## License

This example app is provided as-is for demonstration purposes. 