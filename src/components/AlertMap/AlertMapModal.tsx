import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { AlertMapStyles } from "./AlertMapStylesheet";
import * as Location from "expo-location";
import { observer } from "mobx-react-lite";
import AlertStore from "../../store/AlertStore";

interface AlertMapModalProps {
  showMap: boolean;
  location: Location.LocationObject | null;
  // radius: number;
  handleMapClose: () => void;
}

const AlertMapModal = ({
  showMap,
  location,
  // radius,
  handleMapClose,
}: AlertMapModalProps) => {
  return (
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

              {/*Active Alerts*/}
              {AlertStore.activeAlerts.map((alert) => (
                <Marker
                  key={alert.id}
                  coordinate={{
                    latitude: alert.location.coordinates[1], // **Not Tested**
                    longitude: alert.location.coordinates[0], // **Not Tested**
                  }}
                  title={`Emergency: ${alert.emergencyType}`}
                  description={alert.description}
                  pinColor="red"
                />
              ))}

              {/* Radius Circle */}
              {/* <Circle
                center={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                radius={radius * 1000} //Converting radius from km to meters
                strokeColor="rgba(0, 150, 255, 0.5)"
                fillColor="rgba(0, 150, 255, 0.2)"
              /> */}

              {/* Nearby Users */}
              {/*nearbyUsers.map((user) => (
              <Marker
                key={user.id}
                coordinate={{ latitude: user.lat, longitude: user.lon }}
                title={user.name}
                description={`Distance: ${user.distance?.toFixed(1)} km`}
                pinColor="red"  
              />
            ))*/}
            </MapView>
            {/* Bottom Controls Container */}
            {/* <View style={AlertMapStyles.bottomContainer}>
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
            </View> */}

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
  );
};

export default observer(AlertMapModal);
