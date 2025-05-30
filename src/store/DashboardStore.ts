import { makeAutoObservable, runInAction } from "mobx";
import { reportIssueService, IssueResponse } from "../service/issueApiService";
import { getUser } from "../service/authApiService";

class DashboardStore {
  issues: IssueResponse[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  totalPages: number = 1;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  setIssues(issues: IssueResponse[]) {
    this.issues = issues;
  }

  setCurrentPage(page: number) {
    this.currentPage = page;
  }

  setTotalPages(pages: number) {
    this.totalPages = pages;
  }

  async refreshUserData() {
    try {
      // Get fresh user data to update reputation
      await getUser();
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }

  async loadIssues() {
    try {
      this.setLoading(true);
      this.setError(null);
      
      const response = await reportIssueService.getAllIssues();
      
      runInAction(() => {
        this.issues = response.issues;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
      });

      // Refresh user data after loading issues
      await this.refreshUserData();
    } catch (error: any) {
      runInAction(() => {
        this.setError(error.message || "Failed to load issues");
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }
}

export const dashboardStore = new DashboardStore();
export default dashboardStore; 