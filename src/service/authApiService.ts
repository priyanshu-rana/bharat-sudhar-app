import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://10.0.2.2:8080/auth"; // For Android emulator

const authApiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include JWT token in requests
authApiService.interceptors.request.use(
  async (config) => {
    // Skip adding token for auth endpoints
    if (!config.url?.includes("/auth")) {
      const token = await AsyncStorage.getItem("jwtToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interface for signup request payload
interface SignupData {
  name: string;
  email: string;
  password: string;
  state: string;
  district: string;
  phoneNumber: string;
  location: {
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
}

// Interface for login request payload
interface LoginData {
  email: string;
  password: string;
}

// Interface for API responses
interface ApiResponse {
  success: boolean;
  message: string;
  jwtToken?: string;
  user?: {
    name: string;
    email: string;
  };
}

// Signup API call
export const signup = async (data: SignupData): Promise<ApiResponse> => {
  try {
    const response = await authApiService.post("/signup", data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Signup failed");
  }
};

// Login API call
export const login = async (data: LoginData): Promise<ApiResponse> => {
  try {
    const response = await authApiService.post("/login", data);
    const { jwtToken, user } = response.data;
    if (jwtToken && user) {
      await AsyncStorage.setItem("jwtToken", jwtToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
    }
    return response.data;
  } catch (error: any) {
    let errorMessage = "Login failed";
    if (error.response) {
      console.error("Server responded with:", error.response.data);
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      console.error("No response received:", error.request);
      errorMessage = "Network error - server not responding";
    } else {
      console.error("Request setup error:", error.message);
    }
    throw new Error(errorMessage);
  }
};

// Get stored token
export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("jwtToken");
};

// Get stored user
export const getUser = async (): Promise<{
  name: string;
  email: string;
} | null> => {
  const user = await AsyncStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Clear stored data on logout
export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem("jwtToken");
  await AsyncStorage.removeItem("user");
};

// Export the axios instance for other API calls
export default authApiService;
