import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type NavbarNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface NavRoute {
  name: keyof RootStackParamList;
  iconName: string;
  label: string;
}

const Navbar: React.FC = () => {
  const navigation = useNavigation<NavbarNavigationProp>();

  const routes: NavRoute[] = [
    { name: "Home", iconName: "home-outline", label: "Home" },
    { name: "Dashboard", iconName: "view-dashboard-outline", label: "Dashboard" },
    { name: "Alerts", iconName: "bell-outline", label: "Alerts" },
    { name: "Profile", iconName: "account-circle-outline", label: "Profile" },
    { name: "Settings", iconName: "cog-outline", label: "Settings" },
  ];

  return (
    <View style={styles.container}>
      {routes.map((route) => (
        <TouchableOpacity
          key={route.name}
          style={styles.navItem}
          onPress={() => {
            type ParameterLessRoutes = Exclude<keyof RootStackParamList, 'AlertDetails'>;
            navigation.navigate(route.name as ParameterLessRoutes);
          }}
        >
          <View style={styles.navIconContainer}>
            <MaterialCommunityIcons name={route.iconName} size={24} color="#475569" />
          </View>
          <Text style={styles.navText}>{route.label}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.navBackground}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 80,
    justifyContent: "space-around",
    alignItems: "center",
    position: "relative",
  },
  navBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    zIndex: -1,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingTop: 10,
  },
  navIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  navIcon: {
    fontSize: 20,
  },
  navText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  reportButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  reportButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  reportIcon: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
});

export default Navbar;
