import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface IssueLocationModalProps {
  visible: boolean;
  onClose: () => void;
  location: {
    coordinates: [number, number];
    address: string;
  };
  title: string;
}

const IssueLocationModal = ({
  visible,
  onClose,
  location,
  title,
}: IssueLocationModalProps) => {
  const openMapsWithDirections = () => {
    const lat = location.coordinates[1];
    const lng = location.coordinates[0];
    const label = `Issue: ${title}`;
    const url = Platform.select({
      ios: `maps://app?saddr=Current+Location&daddr=${lat},${lng}&dirflg=d`,
      android: `google.navigation:q=${lat},${lng}`,
    }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Issue Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: location.coordinates[1],
              longitude: location.coordinates[0],
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coordinates[1],
                longitude: location.coordinates[0],
              }}
              title={title}
              description={location.address}
            />
          </MapView>

          <Text style={styles.address}>{location.address}</Text>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={openMapsWithDirections}
          >
            <MaterialCommunityIcons
              name="directions"
              size={20}
              color="white"
              style={styles.directionsIcon}
            />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 5,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 15,
  },
  address: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  directionsButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  directionsIcon: {
    marginRight: 8,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IssueLocationModal; 