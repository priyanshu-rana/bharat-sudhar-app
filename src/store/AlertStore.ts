import { action, makeAutoObservable } from "mobx";
import { getSocket } from "../service/socketService";
import { createSOSAlert, loadNearbyUsers } from "../service/sosApiService";

// TODO : Add types/models for the alert and user data
class AlertStore {
  activeAlerts: any[] = [];
  nearbyUsers: any[] = [];
  currentAlert: any = null;
  isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
    // this.initializeSocket();
  }

  initializeSocket() {
    const socket = getSocket();

    // socket.on("sosAlert", (alert: any) => {
    //   this.addAlert(alert);
    // });
    socket.on("sosAlert", this.addAlert);
  }

  @action
  addAlert(alert: any) {
    this.activeAlerts = [...this.activeAlerts, alert];
  }

  @action
  clearAlerts() {
    this.activeAlerts = [];
  }

  @action
  async createAlert(
    userId: string,
    location: { coordinates: [number, number] },
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
        // radius,
      });
      this.currentAlert = newAlert;
      return newAlert;
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
}

export default new AlertStore();
