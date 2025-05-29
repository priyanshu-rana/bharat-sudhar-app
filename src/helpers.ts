import { UserType } from "./components/AlertMap/NearbyMember/NearbyMemberList";

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  // Haversine formula
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180); // degrees to radians
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getAlertCardStyles = (emergencyType: string) => {
  switch (emergencyType.toLowerCase()) {
    case "medical":
      return {
        icon: "medical-bag",
        color: "#ef4444",
        backgroundColor: "#fee2e2",
      };
    case "safety":
      return {
        icon: "shield-alert",
        color: "#f59e0b",
        backgroundColor: "#fef3c7",
      };
    default:
      return {
        icon: "alert-circle",
        color: "#4f46e5",
        backgroundColor: "#ede9fe",
      };
  }
};
