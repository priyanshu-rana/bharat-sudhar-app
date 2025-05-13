import { StyleSheet } from "react-native";

export const AuthStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  background: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 10,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  linkText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  statBox: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 15,
    width: "30%",
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 5,
  },
  picker: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    marginBottom: 15,
  },
});
