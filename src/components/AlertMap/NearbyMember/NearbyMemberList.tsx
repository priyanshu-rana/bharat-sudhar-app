import { ScrollView, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NearbyMemberStyles } from "./NearbyMemberStylesheet";

export interface UserType {
  id: number;
  lat: number;
  lon: number;
  name: string;
  status: string;
  distance: number;
}

interface NearbyMemberListProps {
  users: UserType[];
}

export const NearbyMembersList = ({ users }: NearbyMemberListProps) => {
  return (
    <View style={NearbyMemberStyles.membersContainer}>
      <Text style={NearbyMemberStyles.membersTitle}>
        Nearby Responders ({users.length})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {users.map((user) => (
          <View
            key={user.id}
            style={[
              NearbyMemberStyles.memberCard,
              user.status === "accepted" && NearbyMemberStyles.acceptedCard,
              user.status === "declined" && NearbyMemberStyles.declinedCard,
            ]}
          >
            <View style={NearbyMemberStyles.memberHeader}>
              <MaterialCommunityIcons
                name={
                  user.status === "pending"
                    ? "clock"
                    : user.status === "accepted"
                    ? "check-circle"
                    : "close-circle"
                }
                size={24}
                color={
                  user.status === "pending"
                    ? "#666"
                    : user.status === "accepted"
                    ? "#4CAF50"
                    : "#F44336"
                }
              />
              <Text style={NearbyMemberStyles.memberDistance}>
                {user.distance.toFixed(1)} km
              </Text>
            </View>
            <Text style={NearbyMemberStyles.memberName}>{user.name}</Text>
            <Text style={NearbyMemberStyles.memberStatus}>
              Status:{" "}
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
