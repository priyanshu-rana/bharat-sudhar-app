import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { observer } from "mobx-react-lite";
import MapView, { Marker } from "react-native-maps"; // Optional: for a mini-map
import { RespondAlertModalStyles } from "./RespondAlertModalStylesheet";
import { AlertType, SOSStatusType } from "../../navigation/types";
import AlertStore from "../../store/AlertStore";

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
    const [isLoading, setIsLoading] = useState(false);

    const handleResponse = async (status: SOSStatusType) => {
      if (!alert || !currentUserId) return;
      setIsLoading(true);
      try {
        await AlertStore.respondToAlert(alert._id, currentUserId, status);
        onClose();
      } catch (error) {
        console.error("Error responding to alert:", error);
        // Show an in-modal error message or use a global error handler
        // For now, just log and close
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (!alert) return null; // Or a loading/empty state if the modal can be visible without an alert

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={RespondAlertModalStyles.centeredView}>
          <View style={RespondAlertModalStyles.modalView}>
            <Text style={RespondAlertModalStyles.modalTitle}>
              Incoming SOS Alert!
            </Text>

            <View style={RespondAlertModalStyles.alertInfoContainer}>
              <Text style={RespondAlertModalStyles.alertType}>
                {alert.emergencyType}
              </Text>
              <Text style={RespondAlertModalStyles.alertDescription}>
                "{alert.description}"
              </Text>
              {/* Optional: Mini-map for location context */}
              {alert?.location?.coordinates && (
                <MapView
                  style={RespondAlertModalStyles.miniMap}
                  initialRegion={{
                    latitude: alert.location.coordinates[1],
                    longitude: alert.location.coordinates[0],
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
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

            {isLoading ? (
              <ActivityIndicator size="large" color="#4f46e5" />
            ) : (
              <View style={RespondAlertModalStyles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    RespondAlertModalStyles.button,
                    RespondAlertModalStyles.acceptButton,
                  ]}
                  onPress={() => handleResponse(SOSStatusType.ACCEPTED)}
                >
                  <Text style={RespondAlertModalStyles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    RespondAlertModalStyles.button,
                    RespondAlertModalStyles.declineButton,
                  ]}
                  onPress={() => handleResponse(SOSStatusType.REJECTED)}
                >
                  <Text style={RespondAlertModalStyles.buttonText}>
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              style={[
                RespondAlertModalStyles.button,
                RespondAlertModalStyles.viewDetailsButton,
              ]}
              onPress={() => {
                onViewDetails(alert._id);
                onClose();
              }}
              disabled={isLoading}
            >
              <Text style={RespondAlertModalStyles.viewDetailsButtonText}>
                View Full Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                RespondAlertModalStyles.button,
                RespondAlertModalStyles.closeButton,
              ]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={RespondAlertModalStyles.closeButtonText}>
                Dismiss
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

export default RespondAlertModal;
