import React from "react";
import { Modal, Text, TouchableOpacity, View, Dimensions } from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { AlertMapStyles } from "./AlertMapStylesheet";
import * as Location from "expo-location";
import { observer } from "mobx-react-lite";
import AlertStore from "../../store/AlertStore";

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
  // No need for state since we can use location prop directly
  const initialRegion = {
    latitude: location?.coords.latitude || 20.5937, // Default to India if no location
    longitude: location?.coords.longitude || 78.9629,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <Modal visible={showMap} style={AlertMapStyles.modal}>
      <View style={AlertMapStyles.container}>
        <View style={AlertMapStyles.mapContainer}>
          <MapView
            style={[
              AlertMapStyles.map,
              {
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height - 100,
              },
            ]}
            provider={PROVIDER_DEFAULT}
            initialRegion={initialRegion}
            loadingEnabled={true}
            mapType="standard"
          >
            {location && (
              <>
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Your Location"
                />
                <Circle
                  center={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  radius={500}
                  fillColor="rgba(79, 70, 229, 0.2)"
                  strokeColor="rgba(79, 70, 229, 0.5)"
                />
              </>
            )}

            {AlertStore.activeAlerts.map((alert) => (
              <Marker
                key={alert._id}
                coordinate={{
                  latitude: alert.location.coordinates[1],
                  longitude: alert.location.coordinates[0],
                }}
                title={`Emergency: ${alert.emergencyType}`}
                description={alert.description}
                pinColor="red"
              />
            ))}
          </MapView>
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
