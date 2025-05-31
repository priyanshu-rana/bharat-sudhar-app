import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface CustomMapViewProps {
  latitude: number;
  longitude: number;
  style?: any;
  markers?: Array<{
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
  }>;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({
  latitude,
  longitude,
  style,
  markers = [],
}) => {
  const allMarkers = [
    { latitude, longitude },
    ...markers,
  ];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { margin: 0; }
          #map { height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${latitude}, ${longitude}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          ${allMarkers.map((marker, index) => `
            L.marker([${marker.latitude}, ${marker.longitude}])
              .addTo(map)
              ${marker.title ? `.bindPopup("${marker.title}${marker.description ? '<br>' + marker.description : ''}")` : ''};
          `).join('')}
        </script>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        style={styles.map}
        source={{ html: htmlContent }}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});

export default CustomMapView; 