# LimeChat React Native Widget Example

This example app demonstrates how to integrate and use the LimeChat React Native Widget in your mobile application.

## Features Demonstrated

- ✅ Basic widget integration
- ✅ User data prefilling
- ✅ Custom attributes
- ✅ Theme switching (light/dark)
- ✅ Error handling
- ✅ Offline functionality
- ✅ Custom styling

## Prerequisites

- React Native development environment set up
- iOS/Android simulator or physical device
- Node.js 16+

## Setup

1. Install dependencies:
```bash
cd example
npm install
```

2. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

3. Update the website token in `App.js`:
```javascript
websiteToken="your_actual_website_token_here"
```

## Running the Example

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Testing Features

### User Prefill
1. Tap "Load John Doe" or "Load Jane Smith"
2. Open the chat widget
3. Verify that user information is pre-filled in the form

### Theme Switching
1. Tap "Switch to Dark Theme"
2. Observe the widget adapts to the theme
3. Switch back to verify light theme

### Offline Functionality
1. Disconnect from internet
2. Tap the widget icon
3. Verify offline alert is shown
4. Reconnect and try again

### Error Handling
1. Use an invalid website token
2. Observe error handling behavior
3. Check console logs for error details

## Customization Examples

### Custom Icon Styling
```javascript
<LimeChatWidget
  iconStyle={{
    width: 70,
    height: 70,
    borderRadius: 35,
  }}
  // ... other props
/>
```

### Custom Positioning
```javascript
<LimeChatWidget
  style={{
    bottom: 50,
    right: 20,
  }}
  // ... other props
/>
```

### Advanced User Data
```javascript
const user = {
  name: 'Advanced User',
  email: 'advanced@example.com',
  phone_number: '+1234567890',
  identifier_hash: 'advanced_user_123',
};

const customAttributes = {
  subscription: 'premium',
  source: 'mobile_app',
  user_segment: 'power_user',
  app_version: '2.1.0',
};
```

## Troubleshooting

### Widget Not Loading
- Verify website token is correct
- Check network connectivity
- Look for errors in console logs

### Prefill Not Working
- Ensure user data is properly formatted
- Check that pre-chat form is enabled in LimeChat settings
- Verify custom attributes are valid JSON

### Icon Not Displaying
- Check if custom icon URL is accessible
- Verify SVG files are properly formatted
- Ensure fallback icon (LC-Icon.svg) is available

## Development

This example can be used as a starting point for developing your own integration. Key files:

- `App.js` - Main application with widget integration
- `package.json` - Dependencies and scripts

## Support

For issues with the example app or widget integration, please check:

1. Console logs for error messages
2. Network connectivity
3. Widget configuration in LimeChat dashboard
4. React Native environment setup 