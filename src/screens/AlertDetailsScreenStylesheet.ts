import { StyleSheet } from "react-native";
import { AlertScreenStyles } from "./AlertScreen/AlertScreenStylesheet"; // Assuming this path is correct relative to the new stylesheet

export const AlertDetailsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AlertScreenStyles.container.backgroundColor, // Use common background
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: AlertScreenStyles.alertType.color, // Use common color
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#777",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  responderList: {
    // Styles for the list itself if needed, e.g. maxHeight
  },
  responderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  responderName: {
    fontSize: 16,
    color: "#444",
  },
  responderStatus: {
    fontSize: 14,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 10,
  }
});

// Function to get status color, can also be part of the stylesheet or a helper utils file
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "accepted":
      return "#4CAF50"; // Green
    case "declined":
      return "#f44336"; // Red
    default:
      return "#FFC107"; // Amber
  }
}; 