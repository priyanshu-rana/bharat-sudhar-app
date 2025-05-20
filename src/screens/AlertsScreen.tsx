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
import { RootStackParamList } from "../navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { Linking } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { AlertMapStyles } from "../components/AlertMap/AlertMapStylesheet";
import { calculateDistance } from "../helpers";
import Slider from "@react-native-community/slider";
import {
  NearbyMembersList,
  UserType,
} from "../components/AlertMap/NearbyMember/NearbyMemberList";
import { getAllUsers } from "../service/sosApiService";

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

// Add a testing mode constant at the top of the file
const TESTING_MODE = true; // Set to true to include yourself in responder list for testing

// Add a storage key for persisting responded alerts
const RESPONDED_ALERTS_STORAGE_KEY = "respondedSOSAlerts";

const AlertsScreen = ({ navigation }: AlertsScreenProps) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [radius, setRadius] = useState(2);
  const [nearbyUsers, setNearbyUsers] = useState<UserType[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission Required",
            "Please enable location services in settings to use this feature",
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
        
        try {
          console.log("Getting initial location...");
          const initialLocation = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("Location timeout")), 10000)
            )
          ]) as Location.LocationObject;
          
          console.log("Initial location acquired:", initialLocation.coords);
          setLocation(initialLocation);
        } catch (locError) {
          console.error("Failed to get initial location:", locError);
          try {
            const lowAccuracyLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Low
            });
            console.log("Low accuracy location acquired:", lowAccuracyLocation.coords);
            setLocation(lowAccuracyLocation);
          } catch (lowAccError) {
            console.error("Failed even with low accuracy:", lowAccError);
          }
        }
      } catch (error) {
        console.error("Permission error:", error);
      }
    })();
  }, []);

  const fetchNearbyUsers = async (forceRefresh = false) => {
    let currentLocationObj = location;
    
    if (!currentLocationObj) {
      console.log("No location available for fetching users");
      try {
        const fetchedLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        console.log("Acquired location for fetching users:", fetchedLocation.coords);
        
        setLocation(fetchedLocation);
        currentLocationObj = fetchedLocation;
      } catch (error) {
        console.error("Failed to get location for fetching users:", error);
        Alert.alert("Error", "Could not get your location. Please ensure location services are enabled.");
        return;
      }
    }
    
    if (!currentLocationObj && !forceRefresh) {
      console.error("Still no location available after attempt to update");
      Alert.alert("Error", "Location services unavailable. Please try again later.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log("Fetching all users from API");
      const users = await getAllUsers();
      console.log(`Received ${users.length} users from API`);
      
      const userLat = currentLocationObj ? currentLocationObj.coords.latitude : 0;
      const userLon = currentLocationObj ? currentLocationObj.coords.longitude : 0;
      
      const filteredUsers = users
        .map((u) => {
          const distance = calculateDistance(
            userLat,
            userLon,
            u.lat,
            u.lon
          );
          return { ...u, distance };
        })
        .filter((u) => u.distance <= radius);
      
      console.log(`Filtered to ${filteredUsers.length} nearby users within ${radius}km`);
      setNearbyUsers(filteredUsers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to fetch nearby users. Please try again.");
    }
  };

  const handleMapClose = () => {
    setShowMap(false);
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
          <Text style={styles.headerTitle}>Nearby Users</Text>
        </View>
      </LinearGradient>

      {/* View Map Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.viewMapButton}
          onPress={() => setShowMap(true)}
        >
          <Text style={styles.viewMapButtonText}>View Map</Text>
        </TouchableOpacity>
      </View>

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
                    description={`Distance: ${user.distance?.toFixed(1)} km`}
                    pinColor="red"
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

                {/* Show refresh button to manually update nearby users */}
                <TouchableOpacity 
                  style={styles.refreshButton} 
                  onPress={() => fetchNearbyUsers(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.refreshButtonText}>
                    {isLoading ? "Refreshing..." : "Refresh Users"}
                  </Text>
                </TouchableOpacity>

                {/* Nearby Members List */}
                <NearbyMembersList users={nearbyUsers} />
              </View>

              <TouchableOpacity
                style={AlertMapStyles.closeMapButton}
                onPress={handleMapClose}
              >
                <Text style={AlertMapStyles.closeMapText}>Close Map</Text>
              </TouchableOpacity>
            </>
          )}
          {!location && (
            <TouchableOpacity
              style={AlertMapStyles.closeMapButton}
              onPress={handleMapClose}
            >
              <Text style={AlertMapStyles.closeMapText}>Close Map</Text>
            </TouchableOpacity>
          )}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  viewMapButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  viewMapButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  refreshButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: "center",
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default AlertsScreen;
