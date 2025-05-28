import axios from "axios";
import { SOSStatusType } from "../navigation/types";

// Base URL configuration
const DEVICE_IP = "192.100.0.00"; // Your local IP address
const API_BASE_URL = `http://${DEVICE_IP}:8080`;
// const API_BASE_URL = "https://bharat-sudhar-backend.onrender.com";

console.log("SOS API using base URL:", API_BASE_URL);

const sosApiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// User type for nearby users
export interface UserType {
  id: string;
  lat: number;
  lon: number;
  name: string;
  status: string;
  distance?: number; // Optional as it will be calculated client-side
}

// Get all users from the API
export const getAllUsers = async (): Promise<UserType[]> => {
  try {
    console.log(
      "Fetching users from URL:",
      `${API_BASE_URL}/sos/users/list-all`
    );
    const response = await sosApiService.get("/sos/users/list-all");
    console.log("Users API response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Users API error:", error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

export const loadNearbyUsers = async (data: {
  coordinates: [number, number];
  radius: number;
  userId: string;
}): Promise<string[]> => {
  try {
    const response = await sosApiService.post("/sos/users/nearby", {
      location: {
        type: "Point",
        coordinates: data.coordinates,
      },
      radius: data.radius,
      userId: data.userId,
    });
    return response.data.map((user: any) => user.id);
  } catch (error: any) {
    console.error("Nearby users error:", error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch nearby users"
    );
  }
};

// // Get active alerts for a user
// export const getActiveAlerts = async (
//   userId: string
// ): Promise<SOSAlertType[]> => {
//   try {
//     const response = await sosApiService.get(
//       `/sos/alerts/active?userId=${userId}`
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching active alerts:", error);
//     throw new Error(
//       error.response?.data?.message || "Failed to fetch active alerts"
//     );
//   }
// };

export const userInvolvedAlerts = async (userId: string) => {
  try {
    const response = await sosApiService.get(
      `/sos/user/${userId}/involved-alerts`
    );
    return response.data;
  } catch (error: any) {
    console.error("Respond to alert error:", error.message);
    throw error;
  }
};

export const createSOSAlert = async (data: {
  userId: string;
  location: { coordinates: [number, number] };
  emergencyType: string;
  description: string;
  nearbyUserIds?: string[];
  // radius?: number;
}) => {
  try {
    console.log("Creating SOS alert with data:", data);
    const response = await sosApiService.post("/sos/create", data);
    return response.data;
  } catch (error: any) {
    console.error("Create SOS alert error:", error.message);
    throw error;
  }
};

// // Respond to an SOS alert
export const respondToAlert = async (data: {
  alertId: string;
  userId: string;
  status?: SOSStatusType;
}) => {
  try {
    const response = await sosApiService.post("/sos/respond", data);
    return response.data;
  } catch (error: any) {
    console.error("Respond to alert error:", error.message);
    throw error;
  }
};

// // Close an SOS alert
// export const closeAlert = async (
//   userId: string,
//   alertId: string
// ): Promise<any> => {
//   try {
//     const response = await sosApiService.put(`/sos/close/${alertId}`, {
//       userId,
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Close alert error:", error.message);
//     throw error;
//   }
// };

export default {
  getAllUsers,
  // getActiveAlerts,
  createSOSAlert,
  respondToAlert,
  userInvolvedAlerts,
  // closeAlert,
};
