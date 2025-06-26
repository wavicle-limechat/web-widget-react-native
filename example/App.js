import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { LimeChatWidget } from '@limechat/react-native-widget';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [showWidget, setShowWidget] = useState(false);
  const [colorScheme, setColorScheme] = useState('auto');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    flex: 1,
  };

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    phone_number: '+1234567890',
  };

  const customAttributes = {
    subscription_type: 'premium',
    app_version: '1.0.0',
  };

  const toggleColorScheme = () => {
    const schemes = ['light', 'dark', 'auto'];
    const currentIndex = schemes.indexOf(colorScheme);
    const nextIndex = (currentIndex + 1) % schemes.length;
    setColorScheme(schemes[nextIndex]);
  };

  const handleWidgetLoad = () => {
    console.log('Widget loaded successfully!');
  };

  const handleWidgetClose = () => {
    console.log('Widget closed!');
  };

  const handleError = (error, errorInfo) => {
    console.error('Widget error:', error, errorInfo);
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            LimeChat Widget Demo
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#cccccc' : '#666666' }]}>
            React Native SDK Integration Example
          </Text>
        </View>

        <View style={styles.configSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Current Configuration
          </Text>
          
          <View style={styles.configRow}>
            <Text style={styles.configLabel}>Color Scheme:</Text>
            <Text style={styles.configValue}>{colorScheme}</Text>
          </View>
        </View>

        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={toggleColorScheme}
          >
            <Text style={styles.buttonText}>
              Toggle Color Scheme
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#ffffff' : '#000000' }]}>
            Widget Features
          </Text>
        </View>
      </ScrollView>

      {/* Widget Integration */}
      <LimeChatWidget
        websiteToken="your-website-token-here"
        user={user}
        locale="en"
        colorScheme={colorScheme}
        customAttributes={customAttributes}
        onWidgetLoad={handleWidgetLoad}
        onWidgetClose={handleWidgetClose}
        onError={handleError}
        style={styles.widgetContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  configValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#007bff',
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  widgetContainer: {
    // Custom positioning if needed
  },
  widgetIcon: {
    // Custom icon styling if needed
  },
});

export default App; 