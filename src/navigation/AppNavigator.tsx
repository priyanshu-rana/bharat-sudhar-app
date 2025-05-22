import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";

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
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
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
});

export default AppNavigator;
