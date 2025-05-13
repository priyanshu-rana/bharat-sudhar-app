import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { logout } from "../service/authApiService";
import { RootStackParamList } from "../navigation/types";

// Add this logo constant below imports
const LOGO = require("../../assets/AppIcon.png");

// Settings screen component
const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // State for toggle switches
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [dataUsage, setDataUsage] = useState(false);

  // Handler for logout
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              // Call the logout function from authApiService
              await logout();
              // Navigate to the Login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  // Handler for clearing cache
  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear all stored app data. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          onPress: () => {
            // Handle clear cache logic here
            console.log("Cache cleared");
            Alert.alert("Success", "Cache has been cleared successfully");
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#4f46e5", "#3730a3"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <Image source={LOGO} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView}>
        {/* App Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive alerts about issue updates
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
              thumbColor={notifications ? "#4f46e5" : "#f1f5f9"}
              ios_backgroundColor="#cbd5e1"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingDescription}>
                Allow app to access your location
              </Text>
            </View>
            <Switch
              value={locationServices}
              onValueChange={setLocationServices}
              trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
              thumbColor={locationServices ? "#4f46e5" : "#f1f5f9"}
              ios_backgroundColor="#cbd5e1"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
              thumbColor={darkMode ? "#4f46e5" : "#f1f5f9"}
              ios_backgroundColor="#cbd5e1"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Reduced Data Usage</Text>
              <Text style={styles.settingDescription}>
                Load lower quality images to save data
              </Text>
            </View>
            <Switch
              value={dataUsage}
              onValueChange={setDataUsage}
              trackColor={{ false: "#cbd5e1", true: "#818cf8" }}
              thumbColor={dataUsage ? "#4f46e5" : "#f1f5f9"}
              ios_backgroundColor="#cbd5e1"
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Edit Profile</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Change Password</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Privacy Settings</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support & About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Help Center</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Terms of Service</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Privacy Policy</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>About Bharat Sudhar</Text>
            <Text style={styles.settingButtonText2}>Version 1.0.0</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Storage & Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Data</Text>

          <TouchableOpacity
            style={styles.settingButton}
            onPress={handleClearCache}
          >
            <Text style={styles.settingButtonText}>Clear Cache</Text>
            <Text style={styles.settingButtonText2}>28.5 MB</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Storage Usage</Text>
            <Text style={styles.settingButtonIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2023 Bharat Sudhar. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    padding: 16,
    marginBottom: 10,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    marginTop: Platform.OS === "ios" ? 30 : 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4f46e5",
    marginVertical: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  settingButtonText: {
    fontSize: 16,
    color: "#1e293b",
    flex: 1,
  },
  settingButtonText2: {
    fontSize: 14,
    color: "#64748b",
    marginRight: 8,
  },
  settingButtonIcon: {
    fontSize: 22,
    color: "#94a3b8",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  footer: {
    alignItems: "center",
    marginVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
});

export default SettingsScreen;
