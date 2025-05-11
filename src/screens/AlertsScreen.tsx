import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, StatusType } from "../navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Linking } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { AlertMapStyles } from "../components/AlertMap/AlertMapStylesheet";
import { calculateDistance, MOCK_USERS } from "../helpers";
import Slider from "@react-native-community/slider";
import {
  NearbyMembersList,
  UserType,
} from "../components/AlertMap/NearbyMember/NearbyMemberList";

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Alerts">;
};

type SeverityType = "critical" | "high" | "medium" | "low";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: SeverityType;
  date: string;
  location: string;
  isEmergency: boolean;
}

// Sample alerts data
const ALERTS: AlertItem[] = [
  {
    id: "alert1",
    title: "Flood Warning",
    description:
      "Heavy rainfall may cause flooding in low-lying areas. Please avoid travel to affected regions.",
    severity: "critical",
    date: "2 hours ago",
    location: "South Delhi",
    isEmergency: true,
  },
  {
    id: "alert2",
    title: "Road Closure",
    description:
      "Main road closed due to maintenance work. Use alternate routes.",
    severity: "medium",
    date: "6 hours ago",
    location: "MG Road, Bangalore",
    isEmergency: false,
  },
  {
    id: "alert3",
    title: "Power Outage",
    description:
      "Scheduled power outage for maintenance. Expected duration: 3 hours.",
    severity: "high",
    date: "1 day ago",
    location: "Sector 22, Noida",
    isEmergency: false,
  },
  {
    id: "alert4",
    title: "Air Quality Alert",
    description:
      "Unhealthy air quality levels detected. Elderly and children advised to stay indoors.",
    severity: "high",
    date: "1 day ago",
    location: "Central Delhi",
    isEmergency: true,
  },
  {
    id: "alert5",
    title: "Water Supply Disruption",
    description:
      "Water supply will be interrupted due to pipeline repairs. Store water accordingly.",
    severity: "medium",
    date: "2 days ago",
    location: "Indiranagar, Bangalore",
    isEmergency: false,
  },
  {
    id: "alert6",
    title: "Traffic Congestion",
    description:
      "Heavy traffic reported due to ongoing event. Allow extra time for travel.",
    severity: "low",
    date: "2 days ago",
    location: "Cyber City, Gurgaon",
    isEmergency: false,
  },
];

const LOGO = require("../../assets/AppIcon.png");

const LOCATION_TASK_NAME = "background-location-task";
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    console.log("Background location update:", locations[0]);
  }
});

const AlertsScreen = ({ navigation }: AlertsScreenProps) => {
  const [activeFilter, setActiveFilter] = useState<SeverityType | "all">("all");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [radius, setRadius] = useState(2);
  const [nearbyUsers, setNearbyUsers] = useState<UserType[]>([]);
  const [sosActive, setSosActive] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "Please enable location services in settings to use the SOS feature",
            [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
          return;
        }

        const backgroundStatus =
          await Location.requestBackgroundPermissionsAsync();
        if (!backgroundStatus.granted) {
          Alert.alert(
            "Background Permission Required",
            "SOS feature needs background location access to work properly",
            [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
        }
      } catch (error) {
        console.error("Permission error:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      const filteredUsers = MOCK_USERS.map((user) => {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          user.lat,
          user.lon
        );
        return { ...user, distance: distance };
      }).filter((user) => user.distance <= radius);
      setNearbyUsers(filteredUsers);
    }
  }, [location, radius]);

  const startLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 5000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
    });
  };

  const handleSOS = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      await startLocationTracking();
      // await sendSOSAlert(location); //TODO: Integrate BE API to send SOS
      setSosActive(true);
      Alert.alert(
        "SOS Activated",
        `Your location is being tracked, be patient and wait for help.`,
        [
          {
            text: "View Map",
            onPress: () => setShowMap(true),
          },
          {
            text: "Cancel SOS",
            onPress: () => stopSOS(),
            style: "destructive",
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    }
  };

  const stopSOS = async () => {
    setSosActive(false);
    setShowMap(false);
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    Alert.alert("SOS Stopped", "Location sharing has been disabled");
  };

  const handleAlertPress = (alertId: string) => {
    // Handle alert selection, e.g., navigate to alert details
    console.log(`Alert ${alertId} selected`);
  };

  const getFilteredAlerts = () => {
    if (activeFilter === "all") {
      return ALERTS;
    }
    return ALERTS.filter((alert) => alert.severity === activeFilter);
  };

  const getSeverityStyle = (severity: SeverityType) => {
    switch (severity) {
      case "critical":
        return styles.criticalAlert;
      case "high":
        return styles.highAlert;
      case "medium":
        return styles.mediumAlert;
      case "low":
        return styles.lowAlert;
      default:
        return styles.mediumAlert;
    }
  };

  const getSeverityIcon = (severity: SeverityType) => {
    switch (severity) {
      case "critical":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "⚠️";
      case "low":
        return "ℹ️";
      default:
        return "ℹ️";
    }
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
          <Text style={styles.headerTitle}>Alerts</Text>
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "all" && styles.activeFilter,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "all" && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "critical" && styles.activeFilter,
              styles.criticalFilter,
            ]}
            onPress={() => setActiveFilter("critical")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "critical" && styles.activeFilterText,
              ]}
            >
              Critical
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "high" && styles.activeFilter,
              styles.highFilter,
            ]}
            onPress={() => setActiveFilter("high")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "high" && styles.activeFilterText,
              ]}
            >
              High
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "medium" && styles.activeFilter,
              styles.mediumFilter,
            ]}
            onPress={() => setActiveFilter("medium")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "medium" && styles.activeFilterText,
              ]}
            >
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "low" && styles.activeFilter,
              styles.lowFilter,
            ]}
            onPress={() => setActiveFilter("low")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "low" && styles.activeFilterText,
              ]}
            >
              Low
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Added SOS Button */}
      <TouchableOpacity
        style={[styles.sosButton, sosActive && styles.sosActive]}
        onPress={sosActive ? stopSOS : handleSOS}
      >
        <Text style={styles.sosButtonText}>
          {sosActive ? "SOS ACTIVE" : "SOS"}
        </Text>
      </TouchableOpacity>
      {/* Emergency Alerts Section */}
      <ScrollView style={styles.contentContainer}>
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>
            {activeFilter === "all"
              ? "All Alerts"
              : `${
                  activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)
                } Priority Alerts`}
          </Text>

          {getFilteredAlerts().map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, getSeverityStyle(alert.severity)]}
              onPress={() => handleAlertPress(alert.id)}
            >
              {alert.isEmergency && (
                <View style={styles.emergencyBadge}>
                  <Text style={styles.emergencyText}>EMERGENCY</Text>
                </View>
              )}

              <View style={styles.alertHeader}>
                <View style={styles.severityIcon}>
                  <Text style={styles.severityIconText}>
                    {getSeverityIcon(alert.severity)}
                  </Text>
                </View>
                <View style={styles.alertTitleContainer}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertLocation}>{alert.location}</Text>
                </View>
              </View>

              <Text style={styles.alertDescription}>{alert.description}</Text>

              <View style={styles.alertFooter}>
                <Text style={styles.alertDate}>{alert.date}</Text>
                <TouchableOpacity style={styles.shareButton}>
                  <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {/* Map Modal */}
      <Modal visible={showMap} style={AlertMapStyles.modal}>
        <View style={AlertMapStyles.mapContainer}>
          {location && (
            <>
              <MapView
                style={AlertMapStyles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                {/* Current User Location */}
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Your Location"
                  description="This is your current position"
                  pinColor="blue"
                />

                {/* Radius Circle */}
                <Circle
                  center={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  radius={radius * 1000} //Converting radius from km to meters
                  strokeColor="rgba(0, 150, 255, 0.5)"
                  fillColor="rgba(0, 150, 255, 0.2)"
                />

                {/* Nearby Users */}
                {nearbyUsers.map((user) => (
                  <Marker
                    key={user.id}
                    coordinate={{ latitude: user.lat, longitude: user.lon }}
                    title={user.name}
                    pinColor={user.status === "accepted" ? "green" : "red"}
                  />
                ))}
              </MapView>
              {/* Bottom Controls Container */}
              <View style={AlertMapStyles.bottomContainer}>
                {/* Radius Control */}
                <View style={AlertMapStyles.controls}>
                  <Text style={AlertMapStyles.radiusText}>
                    Search Radius: {radius} km
                  </Text>
                  <Slider
                    style={AlertMapStyles.slider}
                    minimumValue={1}
                    maximumValue={30}
                    step={1}
                    value={radius}
                    onValueChange={(value) => setRadius(value)}
                    minimumTrackTintColor="#1fb28a"
                    maximumTrackTintColor="#d3d3d3"
                    thumbTintColor="#1a9274"
                  />
                </View>

                {/* Nearby Members List */}
                <NearbyMembersList users={nearbyUsers} />
              </View>

              <TouchableOpacity
                style={AlertMapStyles.closeMapButton}
                onPress={() => setShowMap(false)}
              >
                <Text style={AlertMapStyles.closeMapText}>Close Map</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={AlertMapStyles.closeMapButton}
            onPress={() => setShowMap(false)}
          >
            <Text style={AlertMapStyles.closeMapText}>Close Map</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  filterContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f1f5f9",
  },
  activeFilter: {
    backgroundColor: "#4f46e5",
  },
  criticalFilter: {
    backgroundColor: "#fee2e2",
  },
  highFilter: {
    backgroundColor: "#fef3c7",
  },
  mediumFilter: {
    backgroundColor: "#e0f2fe",
  },
  lowFilter: {
    backgroundColor: "#f0fdf4",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeFilterText: {
    color: "#ffffff",
  },
  contentContainer: {
    flex: 1,
  },
  alertsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding to account for navbar
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  criticalAlert: {
    borderLeftColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  highAlert: {
    borderLeftColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  mediumAlert: {
    borderLeftColor: "#3b82f6",
    backgroundColor: "#f0f9ff",
  },
  lowAlert: {
    borderLeftColor: "#10b981",
    backgroundColor: "#f0fdfa",
  },
  emergencyBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emergencyText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  alertHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  severityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  severityIconText: {
    fontSize: 18,
  },
  alertTitleContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  alertLocation: {
    fontSize: 13,
    color: "#64748b",
  },
  alertDescription: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertDate: {
    fontSize: 12,
    color: "#64748b",
  },
  shareButton: {
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  shareButtonText: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "500",
  },
  // Add new SOS button styles

  sosButton: {
    alignSelf: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginVertical: 10,
  },
  sosActive: {
    backgroundColor: "#991b1b",
  },
  sosButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AlertsScreen;
