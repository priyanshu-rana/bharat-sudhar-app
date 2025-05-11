import { StyleSheet } from "react-native";

export const NearbyMemberStyles = StyleSheet.create({
  membersContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    width: 160,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  acceptedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  declinedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  memberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 12,
    color: "#666",
  },
  memberDistance: {
    fontSize: 12,
    color: "#888",
  },
});
