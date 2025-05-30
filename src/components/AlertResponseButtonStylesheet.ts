import { StyleSheet } from "react-native";

export const AlertResponseButtonStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    alignItems: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100, // Ensure buttons have a decent minimum width
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  acceptButton: {
    backgroundColor: "#22c55e", // Professional green (consistent with accepted status)
  },
  declineButton: {
    backgroundColor: "#ef4444", // Professional red (consistent with rejected status)
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  responseTextContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  responseText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  acceptedText: {
    color: "#22c55e",
  },
  declinedText: {
    color: "#ef4444",
  },
});
