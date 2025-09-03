import React, { useState } from "react";
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
  const [conversationToken, setConversationToken] = useState(null);

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

  const handleConversationTokenChange = (newToken) => {
    console.log('Conversation token changed:', newToken);
    setConversationToken(newToken);
    // In a real app, you might want to persist this to AsyncStorage
    // AsyncStorage.setItem('chat_conversation_token', newToken);
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
          websiteToken="MEFFACy4xaovJayhLjSt836h"
          user={user}
          locale="en"
          customAttributes={customAttributes}
          conversationToken={conversationToken}
          onConversationTokenChange={handleConversationTokenChange}
          onWidgetLoad={handleWidgetLoad}
          onWidgetClose={handleWidgetClose}
          onError={handleError}
          customButton={<TouchableOpacity onPress={() => console.log("Custom button pressed!")}>
            <Text>Custom yo</Text>
          </TouchableOpacity>}
          unreadCountStyle={{
            top: -20,
          }}
          unreadCountTextStyle={{
            color: "white",
            fontSize: 7,
          }}
        />

        <View style={styles.infoSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#ffffff" : "#000000" },
            ]}
          >
            Widget Demo with External Token Management
          </Text>
          <Text
            style={[
              styles.infoText,
              { color: isDarkMode ? "#cccccc" : "#666666" },
            ]}
          >
            This demo shows the LimeChat widget with external conversation token management.
            Check the console to see conversation token changes and error handling in action!
          </Text>
          {conversationToken && (
            <View>
              <Text
                style={[
                  styles.tokenText,
                  { color: isDarkMode ? "#90EE90" : "#006400" },
                ]}
              >
                Current Token: {conversationToken.substring(0, 20)}...
              </Text>
              <TouchableOpacity 
                style={[styles.clearButton]}
                onPress={() => {
                  console.log('Clearing conversation token');
                  setConversationToken(null);
                }}
              >
                <Text style={styles.clearButtonText}>🗑️ Clear Token</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.buttonsSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDarkMode ? "#ffffff" : "#000000" },
            ]}
          >
            Test Token Synchronization
          </Text>
          <Text
            style={[
              styles.infoText,
              { color: isDarkMode ? "#cccccc" : "#666666" },
              { marginBottom: 16 }
            ]}
          >
            Both widgets below share the same conversation token. Start a conversation in one widget and notice how the token is synchronized between both instances.
          </Text>

          <View style={styles.widgetRow}>
            <View style={styles.widgetColumn}>
              <Text style={[styles.widgetLabel, { color: isDarkMode ? "#ffffff" : "#000000" }]}>
                Widget Instance 1
              </Text>
              <LimeChatWidget
                websiteToken="MEFFACy4xaovJayhLjSt836h"
                user={user}
                locale="en"
                customAttributes={{...customAttributes, instance: "widget-1"}}
                conversationToken={conversationToken}
                onConversationTokenChange={handleConversationTokenChange}
                onWidgetLoad={() => {
                  console.log('Widget 1 loaded');
                  handleWidgetLoad();
                }}
                onWidgetClose={() => {
                  console.log('Widget 1 closed');
                  handleWidgetClose();
                }}
                onError={handleError}
                customButton={
                  <TouchableOpacity 
                    style={[styles.customButton, styles.primaryButton]}
                    onPress={() => console.log("Widget 1 button pressed!")}
                  >
                    <Text style={styles.buttonText}>💬 Chat 1</Text>
                  </TouchableOpacity>
                }
                style={styles.widgetInstance}
              />
            </View>

            <View style={styles.widgetColumn}>
              <Text style={[styles.widgetLabel, { color: isDarkMode ? "#ffffff" : "#000000" }]}>
                Widget Instance 2
              </Text>
              <LimeChatWidget
                websiteToken="MEFFACy4xaovJayhLjSt836h"
                user={user}
                locale="en"
                customAttributes={{...customAttributes, instance: "widget-2"}}
                conversationToken={conversationToken}
                onConversationTokenChange={handleConversationTokenChange}
                onWidgetLoad={() => {
                  console.log('Widget 2 loaded');
                  handleWidgetLoad();
                }}
                onWidgetClose={() => {
                  console.log('Widget 2 closed');
                  handleWidgetClose();
                }}
                onError={handleError}
                customButton={
                  <TouchableOpacity 
                    style={[styles.customButton, styles.secondaryButton]}
                    onPress={() => console.log("Widget 2 button pressed!")}
                  >
                    <Text style={styles.buttonText}>💬 Chat 2</Text>
                  </TouchableOpacity>
                }
                style={styles.widgetInstance}
              />
            </View>
          </View>

          <View style={styles.testInstructions}>
            <Text style={[styles.instructionsTitle, { color: isDarkMode ? "#ffffff" : "#000000" }]}>
              How to Test:
            </Text>
            <Text style={[styles.instructionsText, { color: isDarkMode ? "#cccccc" : "#666666" }]}>
              1. Tap "Chat 1" to open the first widget instance
            </Text>
            <Text style={[styles.instructionsText, { color: isDarkMode ? "#cccccc" : "#666666" }]}>
              2. Start a conversation or send a message
            </Text>
            <Text style={[styles.instructionsText, { color: isDarkMode ? "#cccccc" : "#666666" }]}>
              3. Close the widget and tap "Chat 2"
            </Text>
            <Text style={[styles.instructionsText, { color: isDarkMode ? "#cccccc" : "#666666" }]}>
              4. Notice both widgets share the same conversation!
            </Text>
            <Text style={[styles.instructionsText, { color: isDarkMode ? "#90EE90" : "#006400" }]}>
              ✅ Check console logs to see token synchronization
            </Text>
          </View>
        </View>
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
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  customButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    minWidth: 100,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButton: {
    backgroundColor: "#007bff",
  },
  secondaryButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  widgetRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginVertical: 16,
  },
  widgetColumn: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  widgetLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  widgetInstance: {
    // Custom positioning for each widget instance
  },
  testInstructions: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
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
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
  },
  clearButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#dc3545',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  widgetContainer: {
    // Custom positioning if needed
  },
});

export default App;
