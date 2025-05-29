import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import Slider from "@react-native-community/slider";
import AlertStore from "../store/AlertStore";
import { observer } from "mobx-react-lite";

const EMERGENCY_TYPES = [
  { id: "medical", label: "Medical", color: "#f44336" },
  { id: "safety", label: "Safety", color: "#ff9800" },
  { id: "other", label: "Other", color: "#9c27b0" },
];

interface CreateSOSAlertProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const CreateSOSAlert = ({
  visible,
  onClose,
  onSuccess,
  userId,
}: CreateSOSAlertProps) => {
  const [selectedType, setSelectedType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertRadius, setAlertRadius] = useState(1000); // Default 1000 meters
  const [address, setAddress] = useState<string>("");

  // Get current location when modal opens
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (location) {
        try {
          const fetchedAddress = await addressResponse();
          setAddress(fetchedAddress);
        } catch (e) {
          console.error("Error fetching address in useEffect:", e);
          setAddress("Error fetching address");
        }
      } else {
        setAddress(""); // Clear address if location is not available
      }
    };

    fetchAddress();
  }, [location]); // Add location to the dependency array

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission is required to send an alert");
        return;
      }

      setIsLoading(true);
      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setLocation(userLocation);

      // Load nearby users for the initial default radius once location is available
      if (userLocation && userId) {
        AlertStore.loadNearbyUsers(
          [userLocation.coords.longitude, userLocation.coords.latitude],
          alertRadius, // Default radius of 1000 meters
          userId
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Failed to get your location. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert("Error", "Please select an emergency type");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    if (!location) {
      Alert.alert(
        "Error",
        "Location is required. Please wait for location or try again."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const alertData = {
        userId,
        location: {
          coordinates: [
            location.coords.longitude,
            location.coords.latitude,
          ] as [number, number],
          address,
        },
        emergencyType: selectedType,
        description: description.trim(),
        nearbyUserIds: AlertStore.nearbyUsers,
        // radius: alertRadius,
      };

      console.log("Sending SOS alert with data:", alertData);

      await AlertStore.createAlert(
        alertData.userId,
        alertData.location,
        alertData.emergencyType,
        alertData.description,
        alertData.nearbyUserIds
      );

      setIsLoading(false);
      Alert.alert("Success", "Alert sent to nearby users!");

      // Reset form
      setSelectedType("");
      setDescription("");

      // Notify parent of success
      onSuccess();

      // Close the modal
      onClose();
    } catch (error: any) {
      console.error("Error creating alert:", error);
      setIsLoading(false);

      let errorMessage = "Failed to create SOS alert. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    }
  };

  const handleSlidingComplete = (radius: number) => {
    if (location && userId) {
      AlertStore.loadNearbyUsers(
        [location.coords.longitude, location.coords.latitude],
        radius,
        userId
      );
      console.log("API calling onSlidingComplete for radius:", radius);
    }
  };

  let addressResponse = async () => {
    if (!location) return "No location available";
    const response = await Location.reverseGeocodeAsync({
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
    });
    let addressText = "";
    if (response && response.length > 0) {
      const address = response[0];

      // Create address string
      addressText = [
        address.street,
        address.city,
        address.district,
        address.postalCode,
        address.region,
        address.country,
      ]
        .filter(Boolean)
        .join(", ");
      return addressText;
    }
    return "No address found";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Create SOS Alert</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>Select Emergency Type:</Text>
          <View style={styles.typeContainer}>
            {EMERGENCY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  { backgroundColor: type.color },
                  selectedType === type.id && styles.selectedType,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text style={styles.typeText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Description:</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your emergency..."
            placeholderTextColor="#888"
          />

          <View style={styles.radiusInfoContainer}>
            <Text style={styles.labelNoMargin}>
              Alert Radius: {alertRadius / 1000} km
            </Text>
            {location &&
              (AlertStore.isLoading ? (
                <View style={styles.userCountLoadingContainer}>
                  <ActivityIndicator size="small" color="#4f46e5" />
                  <Text style={styles.loadingText}> Finding people...</Text>
                </View>
              ) : (
                <Text style={styles.userCountText}>
                  ({AlertStore.nearbyUsers.length}{" "}
                  {AlertStore.nearbyUsers.length === 1 ? "person" : "people"}{" "}
                  found)
                </Text>
              ))}
          </View>

          <Slider
            style={styles.slider}
            minimumValue={500}
            maximumValue={50000}
            step={500}
            value={alertRadius}
            onValueChange={(radius) => setAlertRadius(radius)}
            onSlidingComplete={handleSlidingComplete}
            minimumTrackTintColor="#4f46e5"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#4f46e5"
          />

          <Text style={styles.radiusDescription}>
            Choose how far to broadcast your alert (500m to 50km)
          </Text>

          <View style={styles.locationInfoContainer}>
            <View style={styles.statusLine}>
              <Text style={[styles.statusLabel, styles.fixedWidthLabel]}>
                Location:
              </Text>
              {isLoading && !location ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <Text style={styles.statusValue}>
                  {location ? "Ready" : "Waiting..."}
                </Text>
              )}
            </View>

            {location && (
              <View style={styles.statusLine}>
                <Text style={[styles.statusLabel, styles.fixedWidthLabel]}>
                  Current Address:
                </Text>
                {(() => {
                  if (address === "" && location) {
                    return (
                      <Text style={styles.statusValueMuted}>Fetching...</Text>
                    );
                  } else if (
                    address === "Error fetching address" ||
                    address === "No location available" ||
                    address === "No address found"
                  ) {
                    return (
                      <Text style={styles.statusValueMuted}>{address}</Text>
                    );
                  } else if (address) {
                    return <Text style={styles.addressValue}>{address}</Text>;
                  }
                  return null;
                })()}
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (isLoading || !location || !userId) && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isLoading || !location || !userId}
            >
              <Text style={styles.sendButtonText}>Send Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
  },
  labelNoMargin: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedType: {
    borderWidth: 2,
    borderColor: "#000",
  },
  typeText: {
    color: "white",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  slider: {
    width: "100%",
    height: 40,
    textAlign: "center",
  },
  radiusDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  locationInfoContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statusLabel: {
    fontWeight: "600",
    fontSize: 15,
    color: "#212529",
    marginRight: 8,
  },
  fixedWidthLabel: {
    width: 120,
  },
  statusValue: {
    fontSize: 15,
    color: "#495057",
    flexShrink: 1,
  },
  addressValue: {
    fontSize: 15,
    color: "#6c757d",
    flexShrink: 1,
    fontStyle: "italic",
    // fontWeight: "500",
  },
  statusValueMuted: {
    fontSize: 15,
    color: "#6c757d",
    fontStyle: "italic",
    flexShrink: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: "#4f46e5",
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  sendButtonText: {
    fontWeight: "bold",
    color: "white",
  },
  cancelButtonText: {
    fontWeight: "bold",
    color: "#000",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: "#d32f2f",
  },
  radiusInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  userCountLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#4f46e5",
  },
  userCountText: {
    fontSize: 14,
    color: "#333",
    marginTop: 10,
    marginLeft: 5,
  },
});

export default observer(CreateSOSAlert);
