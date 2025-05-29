import { StyleSheet } from "react-native";
import { AlertScreenStyles } from "./AlertScreen/AlertScreenStylesheet"; // Assuming this path is correct relative to the new stylesheet
import { SOSStatusType } from "../navigation/types";

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
  },
  // Status badge styles - designed to match AlertsScreen
  statusBadge: {
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    overflow: "hidden", // Ensures text stays within rounded corners
    textAlign: "center",
    alignSelf: "flex-start", // Ensure badge only takes necessary width
    flexDirection: 'row', // Add for icon and text
    alignItems: 'center',  // Add for icon and text
  },
  acceptedStatus: {
    backgroundColor: "#22c55e",
    color: "#ffffff",
  },
  rejectedStatus: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  completedStatus: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  pendingStatus: {
    backgroundColor: "#f59e0b", // Amber
    color: "#ffffff",
  },
  iconStyle: { // New style for icons
    marginRight: 5, // Slightly less margin for potentially smaller badges
  },
});
