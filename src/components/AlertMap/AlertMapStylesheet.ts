import { StyleSheet } from "react-native";

export const AlertMapStyles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
  },

  map: {
    // flex: 1,
    width: "100%",
    height: "75%",
  },
  closeMapButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  closeMapText: {
    color: "white",
    fontWeight: "bold",
  },
  controls: { padding: 20, backgroundColor: "white" },
  slider: { width: "100%", height: 40 },
  radiusText: { fontSize: 16, marginBottom: 10, textAlign: "center" },
  returnToAlertsButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  returnToAlertsText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
