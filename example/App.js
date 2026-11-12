import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LimeChatWidget } from "@limechat/react-native-widget";

const WEBSITE_TOKEN = "YOUR_WEBSITE_TOKEN";

const user = {
  identifier: "user-123",
  identifier_hash: "YOUR_IDENTIFIER_HASH",
  name: "John Doe",
  email: "john@example.com",
};

const App = () => {
  const widgetRef = useRef(null);
  const [conversationToken, setConversationToken] = useState(null);

  const actions = [
    { label: "open('hi')", run: () => widgetRef.current?.open("hi") },
    {
      // the Hi default
      label: "open({ submitted_values })",
      run: () =>
        widgetRef.current?.open({
          submitted_values: { plan: "premium", source: "example-app" },
        }),
    },
    {
      label: "setMessageAttributes({...})",
      run: () =>
        widgetRef.current?.setMessageAttributes({
          order_id: "ORDER_ID",
          screen: "home",
        }),
    },
    { label: "reload()", run: () => widgetRef.current?.reload() },
    {
      label: "reset() (logout)",
      run: () => {
        widgetRef.current?.reset();
        setConversationToken(null);
      },
    },
    { label: "close()", run: () => widgetRef.current?.close() },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>LimeChat Widget Example</Text>
        <Text style={styles.token}>
          token: {conversationToken ? `${conversationToken.slice(0, 20)}...` : "none"}
        </Text>

        {actions.map(({ label, run }) => (
          <TouchableOpacity key={label} style={styles.button} onPress={run}>
            <Text style={styles.buttonText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <LimeChatWidget
        ref={widgetRef}
        websiteToken={WEBSITE_TOKEN}
        user={user}
        locale="en"
        customAttributes={{ app_version: "1.0.0" }}
        conversationToken={conversationToken}
        onConversationTokenChange={setConversationToken}
        onWidgetLoad={() => console.log("widget loaded")}
        onWidgetClose={() => console.log("widget closed")}
        onError={(error) => console.warn("widget error:", error.code, error.message)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  token: { fontSize: 12, marginBottom: 16, color: "#666" },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: { color: "white", fontSize: 15, textAlign: "center" },
});

export default App;
