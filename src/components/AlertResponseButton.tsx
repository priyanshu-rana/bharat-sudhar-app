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

interface AlertResponseProps {
  alertId: string;
  userId: string;
}

const AlertResponseButton = ({ alertId, userId }: AlertResponseProps) => {
  const [loading, setLoading] = useState(false);

  const currentResponse = AlertStore.activeAlerts
    .find((a) => a._id === alertId)
    ?.responders?.find((r: any) => r.userId === userId);

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
    <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
      {(!currentResponse || currentResponse.status === "pending") && (
        <>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: "#4CAF50", borderRadius: 5 }}
            onPress={() => handleResponse(SOSStatusType.ACCEPTED)}
          >
            <Text style={{ color: "white" }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: "#4CAF50", borderRadius: 5 }}
            onPress={() => handleResponse(SOSStatusType.REJECTED)}
          >
            <Text style={{ color: "white" }}>Decline</Text>
          </TouchableOpacity>
        </>
      )}

      {currentResponse?.status === SOSStatusType.ACCEPTED && (
        <Text style={{ color: "#4CAF50", padding: 10 }}>Accepted ✓</Text>
      )}

      {currentResponse?.status === SOSStatusType.REJECTED && (
        <Text style={{ color: "#f44336", padding: 10 }}>Declined ✗</Text>
      )}
    </View>
  );
};

export default observer(AlertResponseButton);
