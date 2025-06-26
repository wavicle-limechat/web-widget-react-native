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
            <Text style={[styles.configLabel, { color: isDarkMode ? '#cccccc' : '#666666' }]}>Color Scheme:</Text>
            <Text style={[styles.configValue, { color: isDarkMode ? '#ffffff' : '#333333' }]}>{colorScheme}</Text>
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
        websiteToken="MEFFACy4xaovJayhLjSt836h"
        user={user}
        locale="en"
        colorScheme={colorScheme}
        customAttributes={customAttributes}
        onWidgetLoad={handleWidgetLoad}
        onWidgetClose={handleWidgetClose}
        onError={handleError}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
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
  configSection: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  configValue: {
    fontSize: 16,
    fontWeight: '400',
  },
  buttonsSection: {
    margin: 16,
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
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  widgetContainer: {
    // Custom positioning if needed
  },
});

export default App;
