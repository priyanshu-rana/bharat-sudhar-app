import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import AlertMapModal from "../../components/AlertMap/AlertMapModal";
import { AlertScreenStyles } from "./AlertScreenStylesheet";
import { getSocket, initializeSocket } from "../../service/socketService";
import { getUser, UserData } from "../../service/authApiService";
import AlertStore from "../../store/AlertStore";
import { observer } from "mobx-react-lite";
import CreateSOSAlert from "../../components/CreateSOSAlert";
const LOGO = require("../../../assets/AppIcon.png");

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Alerts">;
};

const AlertsScreen = ({ navigation }: AlertsScreenProps) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  // const [radius, setRadius] = useState(1);
  const [showMap, setShowMap] = useState(false);
  const [showSOSCreateModal, setShowSOSCreateModal] = useState(false);
  const [user, setUser] = useState<UserData | null>();
  let userId = user?._id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

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
          const initialLocation = (await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Location timeout")), 10000)
            ),
          ])) as Location.LocationObject;

          console.log("Initial location acquired:", initialLocation.coords);
          setLocation(initialLocation);
        } catch (locError) {
          console.error("Failed to get initial location:", locError);
          try {
            const lowAccuracyLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Low,
            });
            console.log(
              "Low accuracy location acquired:",
              lowAccuracyLocation.coords
            );
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

  useEffect(() => {
    const setupSocket = async () => {
      try {
        await initializeSocket();
        const socket = getSocket();

        socket.on("connect", async () => {
          console.log("Socket connected");
          const user = await getUser();
          if (user?._id) {
            socket.emit("registerUser", user._id);
          }
        });

        socket.on("sosAlert", (alert) => {
          console.log("SOS Alert received:", alert);
          AlertStore.addAlert(alert);
          if (navigation.isFocused()) {
            // Show notification or update UI
            Alert.alert("SOS Alert", `Emergency: ${alert.emergencyType}`, [
              {
                text: "View",
                // onPress: () => {
                //   navigation.navigate("AlertDetails", { alert });
                // },
              },
              { text: "Cancel", style: "cancel" },
            ]);
          }
        });
      } catch (error) {
        console.error("Socket setup error:", error);
      }
    };
    setupSocket();

    return () => {
      // Cleanup on unmount
      const socket = getSocket();
      socket?.off("connect");
      socket?.off("sosAlert");
      AlertStore.clearAlerts();
    };
  }, []);

  return (
    <SafeAreaView style={AlertScreenStyles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#4f46e5", "#3730a3"]}
        style={AlertScreenStyles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={AlertScreenStyles.headerTop}>
          <Image source={LOGO} style={AlertScreenStyles.headerLogo} />
          <Text style={AlertScreenStyles.headerTitle}>SOS Alert</Text>
        </View>
      </LinearGradient>

      {/* View Map Button */}
      <View style={AlertScreenStyles.buttonContainer}>
        <TouchableOpacity
          style={AlertScreenStyles.viewMapButton}
          onPress={() => setShowMap(true)}
        >
          <Text style={AlertScreenStyles.viewMapButtonText}>View Map</Text>
        </TouchableOpacity>
      </View>

      {/* Create SOS Alert Button */}
      <View style={AlertScreenStyles.buttonContainer}>
        <TouchableOpacity
          style={AlertScreenStyles.sosButton}
          onPress={() => setShowSOSCreateModal(true)}
        >
          <Text style={AlertScreenStyles.viewMapButtonText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <AlertMapModal
        showMap={showMap}
        location={location}
        // radius={radius}
        handleMapClose={() => setShowMap(false)}
      />

      {/* SOS Create Modal */}
      <CreateSOSAlert
        userId={userId!}
        visible={showSOSCreateModal}
        onClose={() => setShowSOSCreateModal(false)}
        onSuccess={() =>
          Alert.prompt(
            "Alert Sent",
            "Your SOS alert has been sent successfully!"
          )
        }
        // onSuccess={() => {
        //   AlertStore.loadNearbyUsers(location?.coords, radius);
        // }}
      />
    </SafeAreaView>
  );
};

export default observer(AlertsScreen);
