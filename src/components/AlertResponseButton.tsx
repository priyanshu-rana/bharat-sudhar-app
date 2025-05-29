import React, { useState } from "react";
import AlertStore from "../store/AlertStore";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { observer } from "mobx-react-lite";
import { SOSStatusType } from "../navigation/types";
import { AlertResponseButtonStyles as styles } from "./AlertResponseButtonStylesheet";

interface AlertResponseProps {
  alertId: string;
  userId: string;
}

const AlertResponseButton = observer(
  ({ alertId, userId }: AlertResponseProps) => {
    const [loading, setLoading] = useState(false);

    const alert = AlertStore.activeAlerts.find((a) => a._id === alertId);
    const currentResponse = alert?.responders?.find(
      (r: any) => r.userDetails?.id === userId || r.userId === userId
    );

    const handleResponse = async (status: SOSStatusType) => {
      try {
        setLoading(true);
        await AlertStore.respondToAlert(alertId, userId, status);
      } catch (e) {
        Alert.alert("Error", "An error occurred while responding to the alert");
      } finally {
        setLoading(false);
      }
    };

    if (loading) return <ActivityIndicator size={"small"} />;

    return (
      <View style={styles.container}>
        {(!currentResponse ||
          currentResponse.status === SOSStatusType.PENDING) && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handleResponse(SOSStatusType.ACCEPTED)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={() => handleResponse(SOSStatusType.REJECTED)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </>
        )}

        {currentResponse?.status === SOSStatusType.ACCEPTED && (
          <View style={styles.responseTextContainer}>
            <Text style={[styles.responseText, styles.acceptedText]}>
              Accepted ✓
            </Text>
          </View>
        )}

        {currentResponse?.status === SOSStatusType.REJECTED && (
          <View style={styles.responseTextContainer}>
            <Text style={[styles.responseText, styles.declinedText]}>
              Declined ✗
            </Text>
          </View>
        )}
      </View>
    );
  }
);

export default AlertResponseButton;
