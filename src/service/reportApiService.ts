import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://bharat-sudhar-backend.onrender.com/reports";
console.log("Using API URL:", API_BASE_URL);

const reportApiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

reportApiService.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface ReportData {
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  category: string;
  images: string[];
  state: string;
  district: string;
  userId: string;
}

export const createReport = async (data: ReportData) => {
  try {
    const response = await reportApiService.post("/create", data);
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

export const getReports = async () => {
  try {
    const response = await reportApiService.get("/location");
    return response.data;
  } catch (error) {
    console.error("Error getting reports:", error);
    throw error;
  }
};
