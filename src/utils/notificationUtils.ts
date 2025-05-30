//TODO: Test and Implement

import { Alert, Platform, ToastAndroid } from "react-native";

type NotificationType = "emergency" | "info" | "success" | "warning" | "error";

/**
 * Shows a notification to the user using either Alert or Toast based on platform and type
 */
export const showNotification = (
  title: string,
  body: string,
  type: NotificationType = "info",
  onPress?: () => void
) => {
  // For emergency alerts, always use Alert dialog
  if (type === "emergency") {
    Alert.alert(title, body, [{ text: "View", onPress }, { text: "Dismiss" }], {
      cancelable: true,
    });
    return;
  }

  // For Android, use Toast for non-emergency notifications
  if (Platform.OS === "android") {
    ToastAndroid.showWithGravity(
      `${title}: ${body}`,
      ToastAndroid.LONG,
      ToastAndroid.TOP
    );
    return;
  }

  // For iOS, use Alert
  Alert.alert(title, body, [{ text: "OK", onPress }]);
};

export default showNotification;
