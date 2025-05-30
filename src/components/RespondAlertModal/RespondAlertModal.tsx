import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { observer } from "mobx-react-lite";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { RespondAlertModalStyles as styles } from "./RespondAlertModalStylesheet"; // Renamed for clarity
import { AlertType, SOSStatusType } from "../../navigation/types";
import AlertStore from "../../store/AlertStore";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import Icons

interface RespondAlertModalProps {
  visible: boolean;
  alert: AlertType | null;
  currentUserId: string | null | undefined;
  onClose: () => void;
  onViewDetails: (alertId: string) => void;
}

const RespondAlertModal = observer(
  ({
    visible,
    alert,
    currentUserId,
    onClose,
    onViewDetails,
  }: RespondAlertModalProps) => {
    const [isResponding, setIsResponding] = useState(false);

    const handleResponse = async (status: SOSStatusType) => {
      if (!alert || !currentUserId) return;
      setIsResponding(true);
      try {
        await AlertStore.respondToAlert(alert._id, currentUserId, status); // This action will handle AlertStore.isLoading
        onClose();
      } catch (error) {
        console.error("Error responding to alert:", error);
        Alert.alert(
          "Response Error",
          "Failed to submit your response. Please try again."
        );
        onClose();
      } finally {
        setIsResponding(false);
      }
    };

    if (!alert) return null;

    // Determine if the global loading indicator should be shown OR if the modal is locally busy
    const showLoadingIndicator = AlertStore.isLoading || isResponding;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalTitleContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={26}
                color={styles.modalTitle.color}
                style={styles.titleIconStyle}
              />
              <Text style={styles.modalTitleText}>Incoming SOS Alert!</Text>
            </View>

            <View style={styles.alertInfoContainer}>
              <Text style={styles.alertType}>
                {alert.emergencyType.toUpperCase()} Alert
              </Text>
              <Text style={styles.alertDescription}>"{alert.description}"</Text>
              {alert.location.address ? (
                <Text style={styles.alertAddress}>
                  Address: {alert.location.address}
                </Text>
              ) : (
                <Text style={styles.alertAddress}>
                  Location by coordinates only.
                </Text>
              )}
              {/* Optional: Mini-map for location context */}
              {alert?.location?.coordinates && (
                <MapView
                  style={styles.miniMap}
                  provider={PROVIDER_DEFAULT}
                  region={{
                    latitude: alert.location.coordinates[1],
                    longitude: alert.location.coordinates[0],
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  loadingEnabled={true}
                  mapType="standard"
                >
                  <Marker
                    coordinate={{
                      latitude: alert.location.coordinates[1],
                      longitude: alert.location.coordinates[0],
                    }}
                    pinColor="red"
                  />
                </MapView>
              )}
            </View>

            {showLoadingIndicator ? (
              <ActivityIndicator
                size="large"
                color="#4f46e5"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={() => handleResponse(SOSStatusType.ACCEPTED)}
                  disabled={isResponding} // Disable based on local responding state
                >
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={20}
                    color="white"
                    style={styles.iconStyle}
                  />
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.declineButton]}
                  onPress={() => handleResponse(SOSStatusType.REJECTED)}
                  disabled={isResponding} // Disable based on local responding state
                >
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={20}
                    color="white"
                    style={styles.iconStyle}
                  />
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[styles.button, styles.viewDetailsButton]}
              onPress={() => {
                onViewDetails(alert._id);
                // onClose(); // Keep modal open if onViewDetails is main action here before explicit dismiss
              }}
              disabled={showLoadingIndicator} // Also disable if globally loading or locally responding
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color="white"
                style={styles.iconStyle}
              />
              <Text style={styles.viewDetailsButtonText}>
                View Full Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={onClose} // This is the explicit dismiss
              disabled={isResponding} // Only disable if locally responding, not global loading
            >
              <MaterialCommunityIcons
                name="close"
                size={20}
                color="white"
                style={styles.iconStyle}
              />
              <Text style={styles.closeButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

export default RespondAlertModal;
