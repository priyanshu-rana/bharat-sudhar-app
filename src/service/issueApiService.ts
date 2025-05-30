import axios from "axios";
import { getToken, getUser } from "./authApiService";
import { API_BASE_URL } from "./apiService";

const REPORTS_API_URL = `${API_BASE_URL}/reports`;

export interface CreateIssuePayload {
  title: string;
  description: string;
  category: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  image?: string;
  userId?: string;
}

export interface IssueResponse {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: {
    coordinates: [number, number];
    address: string;
    type?: string;
  };
  status: "pending" | "under_review" | "in_progress" | "resolved" | "rejected";
  image?: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    userStatus: string;
    reputation: {
      score: number;
      totalReports: number;
      resolvedReports: number;
      spamReports: number;
    };
  };
}

export interface GetIssuesResponse {
  issues: IssueResponse[];
  totalPages: number;
  currentPage: number;
  totalIssues: number;
}

class ReportIssueService {
  private getHeaders = async () => {
    const token = await getToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  createIssue = async (
    issueData: CreateIssuePayload
  ): Promise<IssueResponse> => {
    try {
      const headers = await this.getHeaders();
      // Get the current user
      const user = await getUser();
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }

      // Add userId to the request payload
      const requestData = {
        ...issueData,
        userId: user._id, // Include the user ID in the request
      };

      console.log("Making API request to:", `${REPORTS_API_URL}/create`);
      console.log("Request headers:", headers);
      console.log("Request data:", {
        ...requestData,
        image: requestData.image ? "base64_image_data" : undefined,
      });

      const response = await axios.post(
        `${REPORTS_API_URL}/create`,
        requestData,
        {
          headers,
        }
      );

      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log("API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("API Error Details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });

      // Provide more specific error messages based on the error type
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage =
          error.response.data?.message || error.response.data || error.message;
        throw new Error(`Server error: ${errorMessage}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error(
          "No response received from server. Please check your connection."
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  };

  getAllIssues = async () => {
    try {
      const headers = await this.getHeaders();
      console.log("Getting all issues from:", `${REPORTS_API_URL}/all`);
      console.log("Request headers:", headers);

      const response = await axios.get(`${REPORTS_API_URL}/all`, { headers });
      console.log("Get issues response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Get Issues Error Details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      throw new Error(
        error.response?.data?.message || "Failed to fetch issues"
      );
    }
  };
}

export const reportIssueService = new ReportIssueService();
