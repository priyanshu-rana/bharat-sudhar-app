import { action, makeAutoObservable } from "mobx";
import { getSocket } from "../service/socketService";
import {
  createSOSAlert,
  loadNearbyUsers,
  respondToAlert,
  userInvolvedAlerts,
} from "../service/sosApiService";
import { AlertType, SOSStatusType } from "../navigation/types";

// TODO : Add types/models for the alert and user data
class AlertStore {
  activeAlerts: AlertType[] = [];
  nearbyUsers: any[] = [];
  currentAlert: AlertType | null = null;
  isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  @action
  private handleRespondAlert = (update: any) => {
    this.updateAlertResponders(update);
  };

  public initializeSocketListeners() {
    try {
      const socket = getSocket();
      socket.off("respondAlert", this.handleRespondAlert);
      socket.on("respondAlert", this.handleRespondAlert);
      console.log("AlertStore: Socket listeners initialized for respondAlert.");
    } catch (error) {
      console.error("AlertStore: Failed to initialize socket listeners", error);
    }
  }

  public removeSocketListeners() {
    try {
      const socket = getSocket();
      socket.off("respondAlert", this.handleRespondAlert);
      console.log("AlertStore: Socket listeners removed for respondAlert.");
    } catch (error) {
      console.warn(
        "AlertStore: Failed to remove socket listeners (socket might not be initialized):",
        error
      );
    }
  }

  @action
  addAlert(alert: AlertType) {
    const existingAlertIndex = this.activeAlerts.findIndex(
      (a) => a._id === alert._id
    );
    if (existingAlertIndex === -1) {
      this.activeAlerts = [...this.activeAlerts, alert];
    } else {
      console.log(
        `AlertStore: Alert with ID ${alert._id} already exists. Not adding duplicate.`
      );
    }
  }

  @action
  clearAlerts() {
    this.activeAlerts = [];
  }

  @action
  async createAlert(
    userId: string,
    location: { coordinates: [number, number]; address?: string },
    emergencyType: string,
    description: string,
    nearbyUserIds?: string[]
    // radius?: number
  ) {
    this.isLoading = true;
    try {
      const newAlert = await createSOSAlert({
        userId,
        location,
        emergencyType,
        description,
        nearbyUserIds,
      });
      this.currentAlert = newAlert;
      await this.userInvolvedAlerts(userId);
      return newAlert;
    } catch (error) {
      console.error("Error in AlertStore.createAlert:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async loadNearbyUsers(
    coordinates: [number, number],
    radius: number,
    userId: string
  ) {
    this.isLoading = true;

    try {
      this.nearbyUsers = await loadNearbyUsers({ coordinates, radius, userId });
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async respondToAlert(
    alertId: string,
    userId: string,
    status?: SOSStatusType
  ) {
    this.isLoading = true;
    try {
      const response = await respondToAlert({ alertId, userId, status });

      const alertIndex = this.activeAlerts.findIndex((a) => a._id === alertId);
      if (alertIndex > -1 && response) {
        // Create a new array reference for MobX
        const newAlerts = [...this.activeAlerts];
        newAlerts[alertIndex] = {
          ...newAlerts[alertIndex],
          ...response,
        };
        this.activeAlerts = newAlerts;
      }
      return this.activeAlerts[alertIndex];
    } catch (error) {
      console.error("Respond to alert error:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  updateAlertResponders(update: any) {
    console.log("updateAlertResponders - update:", update);
    const index = this.activeAlerts.findIndex((a) => a._id === update.alertId);
    if (index > -1) {
      // Create a new array reference for MobX
      const newAlerts = [...this.activeAlerts];
      newAlerts[index] = {
        ...newAlerts[index],
        responders: update.data.responders,
      };
      this.activeAlerts = newAlerts;
    }
  }

  @action
  async userInvolvedAlerts(userId: string) {
    try {
      this.isLoading = true;
      const response = await userInvolvedAlerts(userId);
      this.activeAlerts = response;
    } finally {
      this.isLoading = false;
    }
  }
}

export default new AlertStore();
