import React, { useEffect, useState, useRef } from "react";
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
  TextInput,
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
import { calculateDistance } from "../helpers";
import Slider from "@react-native-community/slider";
import {
  NearbyMembersList,
  UserType,
} from "../components/AlertMap/NearbyMember/NearbyMemberList";
import {
  getAllUsers,
  sendSOSAlert,
  cancelSOSAlert,
  pollForResponders,
  pollForAlerts,
  respondToSOSAlert,
  SOSAlertType,
} from "../service/sosApiService";
import { getUser } from "../service/authApiService";

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

// Add a testing mode constant at the top of the file
const TESTING_MODE = true; // Set to true to include yourself in responder list for testing

// Add a storage key for persisting responded alerts
const RESPONDED_ALERTS_STORAGE_KEY = "respondedSOSAlerts";

const AlertsScreen = ({ navigation }: AlertsScreenProps) => {
  const [activeFilter, setActiveFilter] = useState<SeverityType | "all">("all");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [radius, setRadius] = useState(2);
  const [nearbyUsers, setNearbyUsers] = useState<UserType[]>([]);
  const [sosActive, setSosActive] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyType, setEmergencyType] = useState<
    "medical" | "safety" | "other"
  >("medical");
  const [description, setDescription] = useState("");
  const [showSOSForm, setShowSOSForm] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const responderPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastPolledTime, setLastPolledTime] = useState<string | null>(null);
  const [lastAlertPollTime, setLastAlertPollTime] = useState<string>(new Date().toISOString());
  const [activeAlert, setActiveAlert] = useState<SOSAlertType | null>(null);
  const [responders, setResponders] = useState<any[]>([]);
  const [incomingSOSAlerts, setIncomingSOSAlerts] = useState<SOSAlertType[]>([]);
  const [showResponseOptions, setShowResponseOptions] = useState(false);
  const [currentIncomingAlert, setCurrentIncomingAlert] = useState<SOSAlertType | null>(null);
  const [respondedAlertIds, setRespondedAlertIds] = useState<string[]>([]);
  const [activePollingAlerts, setActivePollingAlerts] = useState<string[]>([]);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);

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
        
        // Get initial location right away with timeout
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
          // At least try with lower accuracy
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

  // Only fetch nearby users when SOS button is clicked, not on location changes
  // We still keep track of location changes for other features
  useEffect(() => {
    // Here we just update location, but DON'T fetch users automatically
    console.log("Location updated, but not fetching users automatically");
  }, [location]);

  // Clean up all polling intervals on unmount
  useEffect(() => {
    // On first component load, do a single poll for alerts
    if (!firstLoadComplete) {
      console.log("First component load - doing initial alert check");
      doSingleAlertCheck();
      setFirstLoadComplete(true);
    }
    
    // Clean up function for unmounting
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (responderPollingIntervalRef.current) {
        clearInterval(responderPollingIntervalRef.current);
      }
    };
  }, []);

  // Reset responded alerts when SOS is activated/deactivated
  useEffect(() => {
    // When SOS status changes, reset the responded alerts list only if we're not active
    if (!sosActive) {
      setRespondedAlertIds([]);
    }
  }, [sosActive]);

  // Poll for responders when we have an active alert
  useEffect(() => {
    if (activeAlert && sosActive) {
      startPollingForResponders();
    } else {
      stopPolling();
    }
    
    // Clean up when unmounting or when alert state changes
    return () => {
      stopPolling();
    };
  }, [activeAlert, sosActive]);

  // Watch for changes to respondedAlertIds and filter incomingSOSAlerts accordingly
  useEffect(() => {
    // Whenever the responded alerts list changes, filter out those alerts from our incoming list
    if (respondedAlertIds.length > 0) {
      console.log(`Filtering incoming alerts based on ${respondedAlertIds.length} responded IDs`);
      setIncomingSOSAlerts(prev => 
        prev.filter(alert => !respondedAlertIds.includes(alert._id))
      );
      
      // If the current alert has been responded to, hide the modal
      if (currentIncomingAlert && respondedAlertIds.includes(currentIncomingAlert._id)) {
        console.log("Current alert was responded to, hiding modal");
        setCurrentIncomingAlert(null);
        setShowResponseOptions(false);
      }
      
      // Save responded alerts to persist through app restarts
      // In a real app, you would use AsyncStorage here
      console.log("Would persist responded alerts:", respondedAlertIds);
    }
  }, [respondedAlertIds]);
  
  // Add a function to force-close the modal if needed
  const forceCloseResponseModal = () => {
    console.log("Force closing response modal");
    setShowResponseOptions(false);
    setCurrentIncomingAlert(null);
  };

  const fetchNearbyUsers = async (forceRefresh = false) => {
    let currentLocationObj = location;
    
    if (!currentLocationObj) {
      console.log("No location available for fetching users");
      try {
        const fetchedLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        console.log("Acquired location for fetching users:", fetchedLocation.coords);
        
        // Update state and also use this value immediately
        setLocation(fetchedLocation);
        currentLocationObj = fetchedLocation;
      } catch (error) {
        console.error("Failed to get location for fetching users:", error);
        Alert.alert("Error", "Could not get your location. Please ensure location services are enabled.");
        return;
      }
    }
    
    // Double check that we now have a location
    if (!currentLocationObj && !forceRefresh) {
      console.error("Still no location available after attempt to update");
      Alert.alert("Error", "Location services unavailable. Please try again later.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get current user
      const user = await getUser();
      if (!user) {
        console.error("Failed to get user for nearby users");
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching all users from API");
      const users = await getAllUsers();
      console.log(`Received ${users.length} users from API`);
      
      // Calculate distance for each user
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
          
          // Check if this user has responded to our alert
          let status = u.status;
          if (activeAlert && activeAlert.responders) {
            const responder = activeAlert.responders.find(r => r.userId === u.id);
            if (responder) {
              status = responder.status;
            }
          }
          
          return { ...u, distance, status };
        })
        // Filter by distance AND conditionally exclude current user
        .filter((u) => {
          // Skip self if user ID is available and not in testing mode
          if (user && u.id === user._id && !TESTING_MODE) return false;
          // Apply distance filter
          return u.distance <= radius;
        });
      
      console.log(`Filtered to ${filteredUsers.length} nearby users within ${radius}km`);
      setNearbyUsers(filteredUsers);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to fetch nearby users. Please try again.");
    }
  };

  const startPollingForResponders = () => {
    if (!activeAlert || !activeAlert._id) return;

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const interval = activeAlert.pollingInterval || 3000;
    console.log(`Starting to poll for responders every ${interval}ms`);

    // First poll immediately
    pollForNewResponders();

    // Then set up the interval
    pollingIntervalRef.current = setInterval(() => {
      pollForNewResponders();
    }, interval);
  };

  const pollForNewResponders = async () => {
    if (!activeAlert || !activeAlert._id) return;
    
    try {
      // Get current user
      const user = await getUser();
      if (!user) {
        console.error("No user found for polling");
        return;
      }
      
      const response = await pollForResponders(
        activeAlert._id,
        lastPolledTime || activeAlert.createdAt,
        user._id
      );
      
      // Update last polled time
      setLastPolledTime(response.currentServerTime);
      
      // Process new responders
      if (response.newResponders && response.newResponders.length > 0) {
        setResponders((prevResponders) => {
          // Merge with existing responders, ensuring no duplicates
          const combined = [...prevResponders];
          response.newResponders.forEach((newResponder) => {
            const existingIndex = combined.findIndex(
              (r) => r.userId.toString() === newResponder.userId.toString()
            );
            
            if (existingIndex >= 0) {
              // Update existing responder
              combined[existingIndex] = newResponder;
            } else {
              // Add new responder
              combined.push(newResponder);
            }
          });
          
          return combined;
        });
        
        // Refresh nearby users to reflect status changes
        fetchNearbyUsers();
      }
    } catch (error) {
      console.error("Error polling for responders:", error);
    }
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

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
      setIsLoading(true);

      // Get location first before showing form
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      console.log("Got high-accuracy location for SOS:", currentLocation.coords);
      setLocation(currentLocation);

      // Explicitly fetch nearby users when SOS button is clicked
      await fetchNearbyUsers(true);

      setIsLoading(false);
      setShowSOSForm(true);
    } catch (error) {
      setIsLoading(false);
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get your location. Please try again.");
    }
  };

  const sendSOS = async () => {
    try {
      setIsLoading(true);
      
      if (!description) {
        Alert.alert("Error", "Please provide a description");
        setIsLoading(false);
        return;
      }
      
      if (!location) {
        Alert.alert("Error", "Location not available");
        setIsLoading(false);
        return;
      }
      
      // Send SOS alert with form data using the polling API
      const alertResponse = await sendSOSAlert(
        location.coords.latitude,
        location.coords.longitude,
        emergencyType,
        description
      );
      
      console.log("SOS alert created with response:", alertResponse);
      
      // Make sure we have the alert ID for cancellation
      if (!alertResponse || !alertResponse._id) {
        console.error("No alert ID received from server");
        Alert.alert("Warning", "SOS alert created but ID not received. You may not be able to cancel it.");
      }
      
      // Store the created alert
      setActiveAlert(alertResponse);
      // Initialize last polled time
      setLastPolledTime(alertResponse.timestamp || new Date().toISOString());
      // Clear existing responders
      setResponders([]);
      
      setShowSOSForm(false);
      await startLocationTracking();
      setSosActive(true);
      setShowMap(true);
      
      setIsLoading(false);
      Alert.alert("SOS Sent", "Your alert has been sent to nearby users");
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to send SOS alert");
      console.error("SOS error:", error);
    }
  };

  const stopSOS = async () => {
    try {
      setIsLoading(true);
      console.log("Stopping SOS, active alert:", activeAlert?._id);
      
      if (activeAlert && activeAlert._id) {
        console.log("Attempting to cancel SOS alert with ID:", activeAlert._id);
        await cancelSOSAlert(activeAlert._id);
        console.log("Successfully cancelled SOS alert");
      } else {
        console.error("Cannot cancel SOS - no alert ID available");
        Alert.alert(
          "Error", 
          "Cannot cancel SOS alert because the alert ID is missing. Please try again."
        );
        setIsLoading(false);
        return;
      }
      
      // Clean up all polling and state
      stopPolling();
      setSosActive(false);
      setShowMap(false);
      setActiveAlert(null);
      setLastPolledTime(null);
      setResponders([]);
      setRespondedAlertIds([]);
      setCurrentIncomingAlert(null);
      setIncomingSOSAlerts([]);
      
      try {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log("Location tracking stopped");
      } catch (locationError) {
        console.error("Error stopping location tracking:", locationError);
        // Continue anyway
      }
      
      setIsLoading(false);
      Alert.alert("SOS Stopped", "Your alert has been cancelled");
    } catch (error) {
      setIsLoading(false);
      console.error("Error stopping SOS:", error);
      
      // Try to stop location updates and UI elements even if cancellation failed
      stopPolling();
      setSosActive(false);
      setShowMap(false);
      setActiveAlert(null);
      setResponders([]);
      setRespondedAlertIds([]);
      setCurrentIncomingAlert(null);
      setIncomingSOSAlerts([]);
      
      try {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      } catch {}
      
      Alert.alert(
        "Error", 
        "Failed to cancel SOS alert on the server, but tracking has been stopped locally."
      );
    }
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

  const startPollingForAlerts = async (shouldShowModal = false) => {
    console.log("Starting to poll for alerts. Should show modal:", shouldShowModal);
    
    // Clear any existing polling interval
    if (responderPollingIntervalRef.current) {
      clearInterval(responderPollingIntervalRef.current);
      responderPollingIntervalRef.current = null;
    }
    
    // Load previously responded alerts
    try {
      // In a real app, you'd load this from AsyncStorage/local storage
      // For now we'll just use the state we have
      console.log("Current responded alert IDs:", respondedAlertIds);
    } catch (error) {
      console.error("Failed to load responded alerts from storage:", error);
    }
    
    // Function to poll for new alerts
    const checkForNewAlerts = async () => {
      // If we're already showing a response modal or handling an SOS, don't check for new alerts
      if (showResponseOptions || sosActive || isLoading) {
        console.log("Skipping alert check - already handling alerts or SOS");
        return;
      }

      let currentLocationObj = location;
      
      if (!currentLocationObj) {
        console.log("No location available for polling");
        try {
          // Try to get current location with lower accuracy for polling
          const fetchedLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low
          });
          console.log("Updated location for polling:", fetchedLocation.coords);
          
          // Update state, but also use this value immediately
          setLocation(fetchedLocation);
          currentLocationObj = fetchedLocation;
        } catch (locationError) {
          console.error("Failed to get location for alert polling:", locationError);
          return;
        }
      }
      
      try {
        // Get current user for fresh reference
        const user = await getUser();
        if (!user) {
          console.error("No user found for polling alerts");
          return;
        }

        // Validate location again for safety
        if (!currentLocationObj) {
          console.error("Location is still null after attempt to update");
          return;
        }

        // Only poll for alerts if we have valid coordinates
        const lat = currentLocationObj.coords.latitude;
        const lon = currentLocationObj.coords.longitude;
        
        if (!lat || !lon) {
          console.error("Invalid coordinates for polling:", lat, lon);
          return;
        }

        console.log(`Polling for alerts at lat:${lat}, lon:${lon} with time: ${lastAlertPollTime}`);
        
        const response = await pollForAlerts(
          lastAlertPollTime,
          lat,
          lon,
          user._id,
          radius * 1000 // Convert km to meters
        );
        
        // Update last polled time
        setLastAlertPollTime(response.currentServerTime);
        
        // Immediately filter out alerts we've already responded to before processing
        const filteredAlerts = response.alerts ? 
          response.alerts.filter(alert => !respondedAlertIds.includes(alert._id)) : 
          [];
          
        console.log(`Received ${response.alerts?.length || 0} alerts, ${filteredAlerts.length} after filtering responded ones`);
        
        // Process new alerts - only if we have any after filtering
        if (filteredAlerts.length > 0) {            
          // Update the alerts list, but filter out already responded alerts
          setIncomingSOSAlerts(prev => {
            // Start with a clean prev with no responded alerts
            const filteredPrev: SOSAlertType[] = prev.filter(alert => !respondedAlertIds.includes(alert._id));
            
            // Then add new alerts that haven't been responded to
            const updatedAlerts = [...filteredPrev];
            
            filteredAlerts.forEach(newAlert => {
              // In testing mode, include self alerts, otherwise skip
              if (newAlert.userId === user._id && !TESTING_MODE) return;
              
              // Check if alert already exists in our filtered list
              const existingIndex = updatedAlerts.findIndex(a => a._id === newAlert._id);
              if (existingIndex >= 0) {
                // Update existing alert
                updatedAlerts[existingIndex] = newAlert;
              } else {
                // Add new alert
                updatedAlerts.push(newAlert);
              }
            });
            
            return updatedAlerts;
          });
          
          // Show alert modal ONLY if specifically requested and all conditions allow it
          if (shouldShowModal && !sosActive && !showResponseOptions && !isLoading && !currentIncomingAlert) {
            // In testing mode, use any alert, otherwise filter out self alerts
            const alertsToConsider = TESTING_MODE 
              ? filteredAlerts.filter(alert => !respondedAlertIds.includes(alert._id))
              : filteredAlerts.filter(alert => alert.userId !== user._id && !respondedAlertIds.includes(alert._id));
              
            if (alertsToConsider.length > 0) {
              console.log("Found alert to show:", alertsToConsider[0]);
              setCurrentIncomingAlert(alertsToConsider[0]);
              setShowResponseOptions(true);
            }
          }
        }
      } catch (error) {
        console.error("Error polling for alerts:", error);
      }
    };
    
    // Initial check
    await checkForNewAlerts();
    
    // Set up interval for checking (every 5 seconds)
    responderPollingIntervalRef.current = setInterval(checkForNewAlerts, 5000);
    
    console.log("Alert polling interval set up");
  };
  
  // Handle responder decision (accept/reject)
  const handleSOSResponse = async (alertId: string, accepted: boolean) => {
    console.log(`Handling SOS response for alert ${alertId}, accepted: ${accepted}`);
    setIsLoading(true);
    setShowResponseOptions(false);
    
    // Track that we're actively processing this alert
    setActivePollingAlerts(prev => [...prev, alertId]);
    
    try {
      // Get current user
      const user = await getUser();
      if (!user) {
        console.error("No user found for responding to alert");
        setIsLoading(false);
        return;
      }
      
      console.log(`User ${user._id} responding to alert ${alertId}`);
      
      // Add this alert to our responded list to prevent showing it again
      // Clone the array first to ensure state updates
      const updatedResponded = [...respondedAlertIds, alertId];
      setRespondedAlertIds(updatedResponded);
      console.log("Updated responded alert IDs:", updatedResponded);
      
      // Remove this alert from our incoming alerts list immediately
      if (currentIncomingAlert) {
        setIncomingSOSAlerts((prev) => {
          return prev.filter(alert => alert._id !== currentIncomingAlert._id);
        });
        setCurrentIncomingAlert(null);
      }
      
      // Call API to respond to the alert
      const response = await respondToSOSAlert(
        alertId,
        user._id,
        accepted ? "accepted" : "rejected"
      );
      
      console.log("Response API result:", response);
      
      if (accepted) {
        // Show the map with the alert location
        if (currentIncomingAlert && currentIncomingAlert.location) {
          const coords = currentIncomingAlert.location.coordinates;
          
          // Make sure coordinates are valid
          if (coords && coords.length === 2) {
            console.log(`Setting map to coordinates: ${coords[0]}, ${coords[1]}`);
            
            setLocation({
              coords: {
                latitude: coords[1], // GeoJSON format is [longitude, latitude]
                longitude: coords[0],
                accuracy: 0,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
              },
              timestamp: Date.now(),
            });
            setShowMap(true);
          }
        }
        
        // Update nearby users to reflect the accepted status
        await fetchNearbyUsers(true);
        
        Alert.alert(
          "Response Sent",
          "You have accepted the SOS alert. Please proceed to the location."
        );
      } else {
        Alert.alert(
          "Response Sent",
          "You have declined the SOS alert.",
          [
            {
              text: "OK",
              onPress: () => {
                // If declined, restart polling for other alerts
                restartPollingForAlerts();
              }
            }
          ]
        );
      }
      
      // Make sure we've removed this alert from our state
      setIncomingSOSAlerts((prev) => {
        return prev.filter(alert => updatedResponded.includes(alert._id));
      });
      
      // Now that we've handled the alert, remove it from active processing
      setActivePollingAlerts(prev => prev.filter(id => id !== alertId));
      
    } catch (error) {
      console.error("Error responding to SOS alert:", error);
      Alert.alert(
        "Error",
        "Failed to send your response. Please try again."
      );
      
      // Remove from active polling in case of error
      setActivePollingAlerts(prev => prev.filter(id => id !== alertId));
      
      // Restart polling in case of error
      restartPollingForAlerts();
    }
    
    setIsLoading(false);
  };

  // Add a function to restart polling if needed
  const restartPollingForAlerts = () => {
    // Only restart if we don't already have an active polling interval
    if (!responderPollingIntervalRef.current) {
      console.log("Manually restarting polling for alerts");
      startPollingForAlerts(false); // Don't show modal when restarting
    }
  };

  // Perform a single alert check without setting up recurring polling
  const doSingleAlertCheck = async () => {
    console.log("Performing single alert check");
    
    let currentLocationObj = location;
    
    if (!currentLocationObj) {
      console.log("No location available for alert check");
      try {
        const fetchedLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        console.log("Updated location for alert check:", fetchedLocation.coords);
        
        // Update state, but also use this value immediately
        setLocation(fetchedLocation);
        currentLocationObj = fetchedLocation;
      } catch (locationError) {
        console.error("Failed to get location for alert check:", locationError);
        return;
      }
    }
    
    try {
      // Get current user for fresh reference
      const user = await getUser();
      if (!user) {
        console.error("No user found for alert check");
        return;
      }

      // Validate location again for safety
      if (!currentLocationObj) {
        console.error("Location is still null after attempt to update");
        return;
      }

      // Only check for alerts if we have valid coordinates
      const lat = currentLocationObj.coords.latitude;
      const lon = currentLocationObj.coords.longitude;
      
      if (!lat || !lon) {
        console.error("Invalid coordinates for alert check:", lat, lon);
        return;
      }

      console.log(`Checking for alerts at lat:${lat}, lon:${lon}`);
      
      // Use a recent timestamp to get current alerts only
      const response = await pollForAlerts(
        new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        lat,
        lon,
        user._id,
        radius * 1000 // Convert km to meters
      );
      
      // Update last polled time
      setLastAlertPollTime(response.currentServerTime);
      
      // Filter out alerts we've already responded to
      const filteredAlerts = response.alerts ? 
        response.alerts.filter(alert => !respondedAlertIds.includes(alert._id)) : 
        [];
        
      console.log(`Initial check found ${filteredAlerts.length} alerts after filtering`);
      
      // Update the alerts list
      if (filteredAlerts.length > 0) {
        setIncomingSOSAlerts(prev => {
          const filteredPrev: SOSAlertType[] = [];
          
          filteredAlerts.forEach(newAlert => {
            // In testing mode, include self alerts, otherwise skip
            if (newAlert.userId === user._id && !TESTING_MODE) return;
            
            filteredPrev.push(newAlert);
          });
          
          return filteredPrev;
        });
        
        // On first load, show the first alert if there are any
        if (!sosActive && !showResponseOptions && !currentIncomingAlert) {
          // In testing mode, use any alert, otherwise filter out self alerts
          const alertsToConsider = TESTING_MODE 
            ? filteredAlerts
            : filteredAlerts.filter(alert => alert.userId !== user._id);
            
          if (alertsToConsider.length > 0) {
            console.log("Found initial alert to show:", alertsToConsider[0]);
            setCurrentIncomingAlert(alertsToConsider[0]);
            setShowResponseOptions(true);
          }
        }
      }
    } catch (error) {
      console.error("Error in initial alert check:", error);
    }
  };

  // Modify the refresh alerts function to be the exclusive way to check for new alerts
  const refreshAlertsAndShowModal = async () => {
    console.log("Manually refreshing alerts...");
    setIsLoading(true);
    
    // Get current location
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setLocation(currentLocation);
      
      // Get current user
      const user = await getUser();
      if (!user) {
        console.error("No user found for alert refresh");
        setIsLoading(false);
        return;
      }
      
      // Poll for alerts manually with a recent start time
      const response = await pollForAlerts(
        new Date(Date.now() - 60000).toISOString(), // Only from the last minute
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        user._id,
        radius * 1000 // Convert km to meters
      );
      
      // Update last polled time
      setLastAlertPollTime(response.currentServerTime);
      
      // Filter out alerts we've already responded to
      const filteredAlerts = response.alerts ? 
        response.alerts.filter(alert => !respondedAlertIds.includes(alert._id)) : 
        [];
      
      console.log(`Manual refresh found ${filteredAlerts.length} new alerts after filtering`);
      
      if (filteredAlerts.length > 0) {
        // Update the incoming alerts list
        setIncomingSOSAlerts(prev => {
          // Start with previously un-responded alerts
          const filteredPrev: SOSAlertType[] = prev.filter(alert => !respondedAlertIds.includes(alert._id));
          
          // Add newly found alerts
          filteredAlerts.forEach(newAlert => {
            if (newAlert.userId === user._id && !TESTING_MODE) return;
            
            // Check if alert already exists
            const existingIndex = filteredPrev.findIndex(a => a._id === newAlert._id);
            if (existingIndex >= 0) {
              filteredPrev[existingIndex] = newAlert;
            } else {
              filteredPrev.push(newAlert);
            }
          });
          
          return filteredPrev;
        });
        
        // Show the first available alert when the user manually checks
        const alertsToShow = TESTING_MODE 
          ? filteredAlerts.filter(alert => !respondedAlertIds.includes(alert._id))
          : filteredAlerts.filter(alert => alert.userId !== user._id && !respondedAlertIds.includes(alert._id));
        
        if (alertsToShow.length > 0) {
          // Show the first alert
          setCurrentIncomingAlert(alertsToShow[0]);
          setShowResponseOptions(true);
        } else {
          Alert.alert("No Alerts", "No new alerts found in your area.");
        }
      } else {
        Alert.alert("No Alerts", "No new alerts found in your area.");
      }
    } catch (error) {
      console.error("Error refreshing alerts:", error);
      Alert.alert("Error", "Failed to refresh alerts. Please try again.");
    }
    
    setIsLoading(false);
  };

  // Update the map close function to restart polling
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

      {/* SOS Button and View Map Button */}
      <View style={styles.sosButtonContainer}>
        <TouchableOpacity
          style={[
            styles.sosButton,
            sosActive && styles.sosActive,
            isLoading && styles.sosDisabled,
          ]}
          onPress={sosActive ? stopSOS : handleSOS}
          disabled={isLoading}
        >
          <Text style={styles.sosButtonText}>
            {isLoading ? "LOADING..." : sosActive ? "SOS ACTIVE" : "SOS"}
          </Text>
        </TouchableOpacity>
        
        {sosActive && (
          <TouchableOpacity
            style={styles.viewMapButton}
            onPress={() => setShowMap(true)}
          >
            <Text style={styles.viewMapButtonText}>View Map</Text>
          </TouchableOpacity>
        )}
        
        {!sosActive && (
          <TouchableOpacity
            style={styles.refreshAlertsButton}
            onPress={refreshAlertsAndShowModal}
            disabled={isLoading}
          >
            <Text style={styles.refreshAlertsButtonText}>
              {isLoading ? "Refreshing..." : "Check Alerts"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
                {nearbyUsers.map((user) => {
                  // Determine marker color based on user status
                  let pinColor = "red";
                  if (user.status === "accepted") {
                    pinColor = "green";
                  } else if (user.status === "rejected") {
                    pinColor = "gray";
                  }
                  
                  return (
                    <Marker
                      key={user.id}
                      coordinate={{ latitude: user.lat, longitude: user.lon }}
                      title={user.name}
                      description={`Status: ${user.status || "unknown"}`}
                      pinColor={pinColor}
                    />
                  );
                })}
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

      {/* SOS Form Modal */}
      <Modal visible={showSOSForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.sosFormContainer}>
            <Text style={styles.sosFormTitle}>Send SOS Alert</Text>

            <Text style={styles.sosFormLabel}>Emergency Type:</Text>
            <View style={styles.emergencyTypeContainer}>
              {["medical", "safety", "other"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.emergencyTypeButton,
                    emergencyType === type && styles.emergencyTypeSelected,
                  ]}
                  onPress={() =>
                    setEmergencyType(type as "medical" | "safety" | "other")
                  }
                >
                  <Text
                    style={[
                      styles.emergencyTypeText,
                      emergencyType === type &&
                        styles.emergencyTypeTextSelected,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sosFormLabel}>Description:</Text>
            <TextInput
              style={styles.sosDescriptionInput}
              placeholder="Describe your emergency..."
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.sosFormButtons}>
              <TouchableOpacity
                style={styles.cancelSOSButton}
                onPress={() => setShowSOSForm(false)}
              >
                <Text style={styles.cancelSOSText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendSOSButton}
                onPress={sendSOS}
                disabled={isLoading}
              >
                <Text style={styles.sendSOSText}>
                  {isLoading ? "Sending..." : "Send Alert"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SOS Response Options Modal */}
      <Modal visible={showResponseOptions} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.sosResponseContainer}>
            <Text style={styles.sosFormTitle}>SOS Alert</Text>
            
            {/* Add close button at the top right */}
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={forceCloseResponseModal}
            >
              <Text style={styles.closeModalText}>✕</Text>
            </TouchableOpacity>
            
            {currentIncomingAlert && (
              <>
                <View style={styles.emergencyIconContainer}>
                  <Text style={styles.emergencyIcon}>
                    {currentIncomingAlert.emergencyType === "medical" 
                      ? "🚑" 
                      : currentIncomingAlert.emergencyType === "safety" 
                        ? "🚨" 
                        : "⚠️"}
                  </Text>
                </View>
                
                <Text style={styles.sosAlertTitle}>
                  {currentIncomingAlert.userName || "Someone"} needs help!
                </Text>
                
                <Text style={styles.sosAlertType}>
                  {currentIncomingAlert.emergencyType.toUpperCase()} EMERGENCY
                </Text>
                
                <Text style={styles.sosAlertDescription}>
                  {currentIncomingAlert.description}
                </Text>
                
                <View style={styles.sosFormButtons}>
                  <TouchableOpacity 
                    style={styles.rejectSOSButton}
                    onPress={() => handleSOSResponse(currentIncomingAlert._id, false)}
                  >
                    <Text style={styles.rejectSOSText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.acceptSOSButton}
                    onPress={() => handleSOSResponse(currentIncomingAlert._id, true)}
                  >
                    <Text style={styles.acceptSOSText}>I'll Help</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
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

  sosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    gap: 10,
  },
  sosButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sosActive: {
    backgroundColor: "#991b1b",
  },
  sosDisabled: {
    backgroundColor: "#9ca3af",
    opacity: 0.7,
  },
  sosButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sosFormContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  sosFormTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sosFormLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  emergencyTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  emergencyTypeButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    alignItems: "center",
  },
  emergencyTypeSelected: {
    backgroundColor: "#4f46e5",
  },
  emergencyTypeText: {
    color: "#64748b",
    fontWeight: "500",
  },
  emergencyTypeTextSelected: {
    color: "white",
  },
  sosDescriptionInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  sosFormButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelSOSButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    alignItems: "center",
  },
  sendSOSButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelSOSText: {
    color: "#64748b",
    fontWeight: "500",
  },
  sendSOSText: {
    color: "white",
    fontWeight: "500",
  },
  // SOS Response styles
  sosResponseContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  emergencyIconContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  emergencyIcon: {
    fontSize: 48,
  },
  sosAlertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  sosAlertType: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  sosAlertDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#374151",
  },
  acceptSOSButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignItems: "center",
  },
  rejectSOSButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    alignItems: "center",
  },
  acceptSOSText: {
    color: "white",
    fontWeight: "500",
  },
  rejectSOSText: {
    color: "#64748b",
    fontWeight: "500",
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
  closeModalButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeModalText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  refreshAlertsButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  refreshAlertsButtonText: {
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
