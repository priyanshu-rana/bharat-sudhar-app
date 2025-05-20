import axios from "axios";

// Base URL - same as auth service but different endpoint path
const API_BASE_URL = "https://bharat-sudhar-backend.onrender.com";

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
    console.log("Fetching users from URL:", `${API_BASE_URL}/sos/users/list-all`);

    const response = await axios.get(`${API_BASE_URL}/sos/users/list-all`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Users API response:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Users API error response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("Users API error request:", error.request);
    } else {
      console.error("Users API error message:", error.message);
    }
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

export default {
  getAllUsers,
};
