import React, { useState, useEffect } from "react";
import { NavigationContainer, RouteProp } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { View, StyleSheet, ActivityIndicator } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import ReportIssueScreen from "../screens/ReportIssueScreen";
import DashboardScreen from "../screens/DashboardScreen";
import AlertsScreen from "../screens/AlertScreen/AlertsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import Navbar from "../components/Navbar";

import { RootStackParamList } from "./types";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import SignUpScreen from "../screens/LoginScreen/SignupScreen";
import AlertDetailsScreen from "../screens/AlertDetailsScreen";

import { getUser } from "../service/authApiService";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Components with Navbar
const HomeWithNavbar = ({ navigation }: any) => (
  <View style={styles.screen}>
    <HomeScreen navigation={navigation} />
    <Navbar />
  </View>
);

const DashboardWithNavbar = ({ navigation }: any) => (
  <View style={styles.screen}>
    <DashboardScreen navigation={navigation} />
    <Navbar />
  </View>
);

const AlertsWithNavbar = ({ navigation }: any) => (
  <View style={styles.screen}>
    <AlertsScreen navigation={navigation} />
    <Navbar />
  </View>
);

const ProfileWithNavbar = ({ navigation }: any) => (
  <View style={styles.screen}>
    <ProfileScreen />
    <Navbar />
  </View>
);

const SettingsWithNavbar = ({ navigation }: any) => (
  <View style={styles.screen}>
    <SettingsScreen />
    <Navbar />
  </View>
);

const AppNavigator = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const user = await getUser();
        setIsUserLoggedIn(!!user);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsUserLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isUserLoggedIn === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isUserLoggedIn ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeWithNavbar} />
        <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
        <Stack.Screen name="Dashboard" component={DashboardWithNavbar} />
        <Stack.Screen name="Alerts" component={AlertsWithNavbar} />
        <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} />
        <Stack.Screen name="Profile" component={ProfileWithNavbar} />
        <Stack.Screen name="Settings" component={SettingsWithNavbar} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AppNavigator;
