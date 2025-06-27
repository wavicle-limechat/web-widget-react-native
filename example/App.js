import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { LimeChatWidget } from "@limechat/react-native-widget";

const App = () => {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#121212" : "#f5f5f5",
    flex: 1,
  };

  const user = {
    name: "John Doe",
    email: "john@example.com",
    phone_number: "+1234567890",
  };

  const customAttributes = {
    subscription_type: "premium",
    app_version: "1.0.0",
  };

  const handleWidgetLoad = () => {
    console.log("Widget loaded successfully!");
  };

  const handleWidgetClose = () => {
    console.log("Widget closed!");
  };

  const handleError = (error, errorData) => {
    console.error("Widget error:", errorData);
    
    // Handle based on severity
    switch (error.severity) {
      case 'critical':
        console.error('Critical error - widget broken:', error.code);
        // Could show fallback UI or alert here
        break;
      case 'high':
        console.warn('High severity error:', error.code);
        // Log to analytics
        break;
      case 'medium':
        console.warn('Medium severity error:', error.code);
        // Show user notification if needed
        break;
      case 'low':
        console.log('Low severity error:', error.code);
        // Just log for debugging
        break;
      case 'info':
        console.info('Info:', error.message);
        // Informational messages like fallback icon usage
        break;
    }
    
    // Handle specific error types
    if (error.code === 'WIDGET_ERROR_1000') {
      console.error('Configuration error - check token and setup:', error.message);
    } else if (error.code === 'WIDGET_ERROR_1100') {
      console.error('WebView error - check network and URL:', error.message);
    } else if (error.code === 'WIDGET_ERROR_1200') {
      console.error('Network error - check connectivity:', error.message);
    } else if (error.code === 'WIDGET_ERROR_1300') {
      console.error('Component error - UI issue:', error.message);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: isDarkMode ? "#ffffff" : "#000000" },
            ]}
          >
            LimeChat Widget Demo
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: isDarkMode ? "#cccccc" : "#666666" },
            ]}
          >
            React Native SDK Integration Example
          </Text>
        </View>

        <LimeChatWidget
          websiteToken="bf9AG2AjXnzysE5kgBWp8xKN"
          user={user}
          locale="en"
          customAttributes={customAttributes}
          onWidgetLoad={handleWidgetLoad}
          onWidgetClose={handleWidgetClose}
          onError={handleError}
          customIcon={<Text>Custom Icon yo</Text>}
          unreadCountStyle={{
            top: -20,
          }}
          unreadCountTextStyle={{
            color: "white",
            fontSize: 7,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#007bff",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  configSection: {
    margin: 16,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  configRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  configValue: {
    fontSize: 16,
    fontWeight: "400",
  },
  buttonsSection: {
    margin: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  infoSection: {
    margin: 16,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
