import { UserType } from "./components/AlertMap/NearbyMember/NearbyMemberList";

export const MOCK_USERS: UserType[] = [
  {
    id: 1,
    lat: 30.293976,
    lon: 78.0579,
    name: "Zamanat",
    status: "accepted",
    distance: 0,
  },
  {
    id: 2,
    lat: 30.2858,
    lon: 78.0684,
    name: "Pankaj",
    status: "pending",
    distance: 0,
  },
  {
    id: 3,
    lat: 30.267,
    lon: 78.0909,
    name: "Saurabh",
    status: "accepted",
    distance: 0,
  },
  {
    id: 4,
    lat: 30.1158,
    lon: 78.2853,
    name: "Ujjwal",
    status: "pending",
    distance: 0,
  },
];

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
