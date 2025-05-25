export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  ReportIssue: undefined;
  Dashboard: undefined;
  Alerts: undefined;
  AlertDetails: { alertId: string };
  Profile: undefined;
  Settings: undefined;
};

export type StatusType = "pending" | "in_progress" | "resolved";
export enum SOSStatusType {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  COMPLETED = "completed",
}

export interface AlertType {
  _id: string;
  responders: Array<{
    userId: string;
    status: string;
  }>;
  emergencyType: string;
  description: string;
  location: {
    coordinates: [number, number];
  };
  createdAt: string;
}
