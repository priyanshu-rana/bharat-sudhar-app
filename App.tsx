import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  View,
  LogBox,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
} from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

// Ignore specific warnings
LogBox.ignoreLogs([
  "ViewPropTypes will be removed from React Native",
  "AsyncStorage has been extracted from react-native",
]);

// Static image imports
const LOGO = require("./assets/AppIcon.png");

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  splashContent: {
    flex: 1,
    backgroundColor: "rgba(79, 70, 229, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 36,
    color: "#ffffff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 18,
    color: "#e0e7ff",
    marginBottom: 30,
  },
});
