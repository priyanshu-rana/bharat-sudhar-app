import { StyleSheet, Dimensions } from "react-native";
import { AlertScreenStyles } from "./AlertScreen/AlertScreenStylesheet"; // Assuming this path is correct relative to the new stylesheet

export const AlertDetailsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AlertScreenStyles.container.backgroundColor, // Use common background
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  bottomSpacing: {
    height: 20, // Reduced since we don't need space for sticky button
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
    flexDirection: "row", // Add for icon and text
    alignItems: "center", // Add for icon and text
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
  iconStyle: {
    marginRight: 5,
  },
  victimDetailsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  victimName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginLeft: 8,
  },
  victimPhone: {
    fontSize: 16,
    color: "blue",
    marginLeft: 8,
  },
  victimPhoneTooltip: {
    fontSize: 12,
    marginLeft: 8,
    fontStyle: "italic",
    fontWeight: "500",
    color: "#6b7280", // Gray color for tooltip text
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  miniMap: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  directionsButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
