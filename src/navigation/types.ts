export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Dashboard: undefined;
  ReportIssue:
    | {
        addNewIssue?: (issue: any) => void;
      }
    | undefined;
  Profile: undefined;
  Settings: undefined;
};

export type StatusType = "pending" | "in_progress" | "resolved";
