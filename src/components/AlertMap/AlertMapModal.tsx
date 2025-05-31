import React from "react";
import { Modal, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { AlertMapStyles } from "./AlertMapStylesheet";
import * as Location from "expo-location";
import { observer } from "mobx-react-lite";
import AlertStore from "../../store/AlertStore";
import CustomMapView from "../MapView";

interface AlertMapModalProps {
  showMap: boolean;
  location: Location.LocationObject | null;
  handleMapClose: () => void;
}

const AlertMapModal = ({
  showMap,
  location,
  handleMapClose,
}: AlertMapModalProps) => {
  return (
    <Modal visible={showMap} style={AlertMapStyles.modal}>
      <View style={AlertMapStyles.container}>
        <View style={AlertMapStyles.mapContainer}>
          <CustomMapView
            style={[
              AlertMapStyles.map,
              {
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height - 100,
              },
            ]}
            latitude={location?.coords.latitude || 20.5937}
            longitude={location?.coords.longitude || 78.9629}
            markers={[
              ...(location ? [{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                title: "Your Location"
              }] : []),
              ...AlertStore.activeAlerts.map(alert => ({
                latitude: alert.location.coordinates[1],
                longitude: alert.location.coordinates[0],
                title: `Emergency: ${alert.emergencyType}`,
                description: alert.description
              }))
            ]}
          />
        </View>
        <TouchableOpacity
          style={AlertMapStyles.closeButton}
          onPress={handleMapClose}
        >
          <Text style={AlertMapStyles.closeButtonText}>Close Map</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default observer(AlertMapModal);
