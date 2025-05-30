import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AlertType,
  RootStackParamList,
  SOSStatusType,
} from "../../navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import AlertMapModal from "../../components/AlertMap/AlertMapModal";
import { AlertScreenStyles } from "./AlertScreenStylesheet";
import { getSocket, initializeSocket } from "../../service/socketService";
import { getUser, UserData } from "../../service/authApiService";
import AlertStore from "../../store/AlertStore";
import { observer } from "mobx-react-lite";
import CreateSOSAlert from "../../components/CreateSOSAlert";
import RespondAlertModal from "../../components/RespondAlertModal/RespondAlertModal";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const LOGO = require("../../../assets/AppIcon.png");

type AlertsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Alerts">;
};

const AlertsScreen = ({ navigation }: AlertsScreenProps) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [showMap, setShowMap] = useState(false);
  const [showSOSCreateModal, setShowSOSCreateModal] = useState(false);
  const [user, setUser] = useState<UserData | null>();
  let userId = user?._id;

  const [isRespondModalVisible, setIsRespondModalVisible] = useState(false);
  const [currentRespondingAlert, setCurrentRespondingAlert] =
    useState<AlertType | null>(null);

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
          console.warn("Location permission not granted.");
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

        const handleConnect = async () => {
          console.log("Socket connected");
          const currentUser = await getUser();
          if (currentUser?._id) {
            socket.emit("registerUser", currentUser._id);
          }
        };

        const handleSosAlert = (alertData: AlertType) => {
          console.log("SOS Alert received on screen:", alertData);
          AlertStore.addAlert(alertData);
          if (navigation.isFocused()) {
            setCurrentRespondingAlert(alertData);
            setIsRespondModalVisible(true);
          }
        };

        socket.on("connect", handleConnect);
        socket.on("sosAlert", handleSosAlert);

        AlertStore.initializeSocketListeners();
      } catch (error) {
        console.error("Socket setup error:", error);
      }
    };
    setupSocket();

    return () => {
      try {
        const socket = getSocket();
        socket.off("connect");
        socket.off("sosAlert");
        AlertStore.removeSocketListeners();
        console.log(
          "AlertsScreen: Socket and AlertStore listeners cleaned up."
        );
      } catch (error) {
        console.warn("AlertsScreen: Error during socket cleanup:", error);
      }
    };
  }, [navigation]);

  useEffect(() => {
    if (userId) AlertStore.userInvolvedAlerts(userId);
  }, [userId]);

  const getAlertItemStyle = (emergencyType: string) => {
    switch (emergencyType?.toLowerCase()) {
      case "medical":
        return AlertScreenStyles.medicalAlert;
      case "safety":
        return AlertScreenStyles.safetyAlert;
      default:
        return AlertScreenStyles.otherAlert;
    }
  };

  const getConsolidatedAlertStatus = (
    responders: AlertType["responders"],
    alert?: AlertType
  ) => {
    if (alert?.userRole === "victim") {
      return {
        text: "Your Alert",
        style: AlertScreenStyles.yourAlertStatus,
        iconName: "account-alert-outline",
      };
    }
    if (!responders || responders.length === 0) {
      return {
        text: "Pending",
        style: AlertScreenStyles.pendingStatus,
        iconName: "clock-outline",
      };
    }
    if (responders.some((r) => r.status === SOSStatusType.ACCEPTED)) {
      return {
        text: "Accepted",
        style: AlertScreenStyles.acceptedStatus,
        iconName: "check-circle-outline",
      };
    }
    if (responders.some((r) => r.status === SOSStatusType.REJECTED)) {
      return {
        text: "Rejected",
        style: AlertScreenStyles.rejectedStatus,
        iconName: "close-circle-outline",
      };
    }
    if (responders.some((r) => r.status === SOSStatusType.COMPLETED)) {
      return {
        text: "Completed",
        style: AlertScreenStyles.completedStatus,
        iconName: "check-decagram-outline",
      };
    }
    return {
      text: "Pending",
      style: AlertScreenStyles.pendingStatus,
      iconName: "clock-outline",
    }; // Default to Pending
  };

  const renderAlertItem = ({ item }: { item: AlertType }) => {
    const typeSpecificStyle = getAlertItemStyle(item.emergencyType);
    const alertStatus = getConsolidatedAlertStatus(item.responders, item);

    return (
      <TouchableOpacity
        style={[
          AlertScreenStyles.alertItem,
          {
            borderLeftColor: typeSpecificStyle.borderLeftColor,
            backgroundColor: typeSpecificStyle.backgroundColor,
          },
        ]}
        onPress={() =>
          navigation.navigate("AlertDetails", { alertId: item._id })
        }
      >
        <View style={AlertScreenStyles.alertItemHeader}>
          <Text
            style={[
              AlertScreenStyles.alertType,
              { color: typeSpecificStyle.color },
            ]}
          >
            {item.emergencyType.charAt(0).toUpperCase() +
              item.emergencyType.slice(1)}
          </Text>
          <Text style={AlertScreenStyles.alertTimestamp}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            - {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text style={AlertScreenStyles.alertDescription} numberOfLines={2}>
          {item.description || "No description provided."}
        </Text>
        {/* Add location snippet or other details if available and desired */}
        <Text style={AlertScreenStyles.alertLocationSnippet}>
          {`Location: ${
            item.location.address ??
            `${item.location.coordinates[1]}, ${item.location.coordinates[0]}`
          }`}
        </Text>

        <View style={AlertScreenStyles.statusActionRow}>
          <View style={[AlertScreenStyles.statusBadge, alertStatus.style]}>
            {Boolean(alertStatus.iconName) && (
              <MaterialCommunityIcons
                name={alertStatus.iconName}
                size={14}
                color={alertStatus.style.color || "white"}
                style={AlertScreenStyles.iconStyle}
              />
            )}
            <Text
              style={{
                color: alertStatus.style.color || "white",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {alertStatus.text}
            </Text>
          </View>

          {/* <View>
         

            <Image source={LOGO} style={AlertScreenStyles.headerLogo} />
            <Text style={AlertScreenStyles.headerTitle}>Alert Details</Text>
          </View> */}

          <Text style={AlertScreenStyles.viewDetailsHint}>View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={AlertScreenStyles.headerTitle}>SOS Alerts</Text>
        </View>
      </LinearGradient>

      <View style={AlertScreenStyles.actionButtonsContainer}>
        <TouchableOpacity
          style={AlertScreenStyles.viewMapButton}
          onPress={() => setShowMap(true)}
        >
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={20}
            color="white"
            style={AlertScreenStyles.iconStyle}
          />
          <Text style={AlertScreenStyles.viewMapButtonText}>View Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={AlertScreenStyles.sosButton}
          onPress={() => setShowSOSCreateModal(true)}
        >
          <MaterialCommunityIcons
            name="alert-decagram-outline"
            size={20}
            color="white"
            style={AlertScreenStyles.iconStyle}
          />
          <Text style={AlertScreenStyles.viewMapButtonText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <AlertMapModal
        showMap={showMap}
        location={location}
        handleMapClose={() => setShowMap(false)}
      />

      <CreateSOSAlert
        userId={userId!}
        visible={showSOSCreateModal}
        onClose={() => setShowSOSCreateModal(false)}
        onSuccess={() => {
          console.log("SOS alert has been sent successfully!");
        }}
      />

      <RespondAlertModal
        visible={isRespondModalVisible}
        alert={currentRespondingAlert}
        currentUserId={userId}
        onClose={() => {
          setIsRespondModalVisible(false);
          setCurrentRespondingAlert(null);
        }}
        onViewDetails={(alertId) => {
          setIsRespondModalVisible(false);
          setCurrentRespondingAlert(null);
          navigation.navigate("AlertDetails", { alertId });
        }}
      />

      <FlatList
        data={AlertStore.activeAlerts}
        keyExtractor={(item) => item._id}
        renderItem={renderAlertItem}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
        ListEmptyComponent={
          AlertStore.isLoading ? (
            <ActivityIndicator size={"small"} />
          ) : (
            <Text style={AlertScreenStyles.emptyListText}>
              No active alerts nearby.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
};

export default observer(AlertsScreen);
