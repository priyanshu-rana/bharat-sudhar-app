import { StyleSheet } from "react-native";

export const RespondAlertModalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalView: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  alertInfoContainer: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  alertType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d9534f", // A reddish color for alerts
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  alertAddress: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  miniMap: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minWidth: 120,
    marginVertical: 5,
  },
  acceptButton: {
    backgroundColor: "#5cb85c", // Green
  },
  declineButton: {
    backgroundColor: "#d9534f", // Red
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  viewDetailsButton: {
    backgroundColor: "#f0ad4e", // Orange
    width: "100%",
  },
  viewDetailsButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#999", // Grey
    width: "100%",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  iconStyle: {
    marginRight: 8,
  },
  titleIconStyle: {
    marginRight: 10,
  },
});
