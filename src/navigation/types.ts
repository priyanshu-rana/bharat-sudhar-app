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
  emergencyType: string;
  description: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  responders: Array<{
    userDetails: {
      id: string;
      name: string;
      phoneNumber: string;
    };
    status: string;
  }>;
  userRole: "victim" | "helper";
  createdAt: string;
}
