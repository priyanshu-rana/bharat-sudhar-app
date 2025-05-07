import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  View,
  LogBox,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";

// Ignore specific warnings
LogBox.ignoreLogs([
  "ViewPropTypes will be removed from React Native",
  "AsyncStorage has been extracted from react-native",
  "Failed to load resource", // Ignore image loading failures
  "Unable to resolve module", // Ignore module resolution failures
]);

// Keep the splash screen visible while loading assets
SplashScreen.preventAutoHideAsync();

// Preload the images using direct static requires
const IMAGES = {
  logo: require("./assets/AppIcon.png"),
  cityBg: require("./assets/city-bg.jpg"),
  pothole: require("./assets/images/RoadPotholeIssue.jpg"),
  streetlight: require("./assets/images/StreetLightIssue.jpg"),
  water: require("./assets/images/WaterShortageIssue.jpg"),
  garbage: require("./assets/images/GarbageCollectionIssue.jpg"),
  trafficSignal: require("./assets/images/TrafficLightIssue.jpg"),
  roadRepair: require("./assets/images/RoadRepairIssue.jpg"),
};

// Preload images - handle errors for individual images
const cacheImages = async (images: Record<string, any>) => {
  const loadPromises = Object.values(images).map((image) => {
    if (typeof image === "string") {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image as number).downloadAsync();
    }
  });

  return Promise.all(loadPromises);
};

export default function App() {
  const [isReady, setIsReady] = useState(false);

  // Preload assets
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load images - wrap in try/catch to handle missing assets
        try {
          await cacheImages(IMAGES);
        } catch (error) {
          console.warn("Some assets could not be loaded:", error);
        }

        setIsReady(true);
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <ImageBackground
        source={IMAGES.cityBg}
        style={styles.splashContainer}
        resizeMode="cover"
      >
        <View style={styles.splashContent}>
          <Image
            source={IMAGES.logo}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.splashTitle}>Bharat Sudhar</Text>
          <Text style={styles.splashSubtitle}>
            Making our communities better together
          </Text>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </ImageBackground>
    );
  }

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
