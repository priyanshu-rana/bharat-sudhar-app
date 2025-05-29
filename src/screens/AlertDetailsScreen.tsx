import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import AlertStore from "../store/AlertStore";
import AlertResponseButton from "../components/AlertResponseButton";
import { getUser, UserData } from "../service/authApiService";
import { observer } from "mobx-react-lite";
import { AlertScreenStyles } from "./AlertScreen/AlertScreenStylesheet";
import { AlertDetailsScreenStyles } from "./AlertDetailsScreenStylesheet";
import { SOSStatusType } from "../navigation/types";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const LOGO = require("../../assets/AppIcon.png");

const AlertDetailsScreen = ({ route, navigation }: any) => {
  const [user, setUser] = useState<UserData | null>(null);
  const { alertId } = route.params;
  const alert = AlertStore.activeAlerts.find((a) => a._id === alertId);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  if (!alert) {
    return (
      <SafeAreaView style={AlertDetailsScreenStyles.container}>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={["#4f46e5", "#3730a3"]}
          style={AlertScreenStyles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={AlertScreenStyles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginRight: 10, padding: 5 }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <Image source={LOGO} style={AlertScreenStyles.headerLogo} />
            <Text style={AlertScreenStyles.headerTitle}>Alert Details</Text>
          </View>
        </LinearGradient>
        <View style={AlertDetailsScreenStyles.contentContainer}>
          <Text style={AlertDetailsScreenStyles.errorText}>
            Alert not found or an error occurred.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getResponderStatusStyle = (status: SOSStatusType) => {
    switch (status) {
      case SOSStatusType.ACCEPTED:
        return {
          style: AlertDetailsScreenStyles.acceptedStatus,
          iconName: "check-circle-outline",
        };
      case SOSStatusType.REJECTED:
        return {
          style: AlertDetailsScreenStyles.rejectedStatus,
          iconName: "close-circle-outline",
        };
      case SOSStatusType.COMPLETED:
        return {
          style: AlertDetailsScreenStyles.completedStatus,
          iconName: "check-decagram-outline",
        };
      case SOSStatusType.PENDING:
      default:
        return {
          style: AlertDetailsScreenStyles.pendingStatus,
          iconName: "clock-outline",
        };
    }
  };

  const renderResponderItem = ({ item }: { item: any }) => {
    const statusInfo = getResponderStatusStyle(item.status as SOSStatusType);
    return (
      <View style={AlertDetailsScreenStyles.responderItem}>
        <Text style={AlertDetailsScreenStyles.responderName}>
          {item.userDetails?.name}
        </Text>
        <View style={[AlertDetailsScreenStyles.statusBadge, statusInfo.style]}>
          {Boolean(statusInfo.iconName) && (
            <MaterialCommunityIcons
              name={statusInfo.iconName}
              size={14}
              color={statusInfo.style.color || "white"}
              style={AlertDetailsScreenStyles.iconStyle}
            />
          )}
          <Text
            style={{
              color: statusInfo.style.color || "white",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={AlertDetailsScreenStyles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#4f46e5", "#3730a3"]}
        style={AlertScreenStyles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={AlertScreenStyles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 10, padding: 5 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Image source={LOGO} style={AlertScreenStyles.headerLogo} />
          <Text style={AlertScreenStyles.headerTitle}>Alert Details</Text>
        </View>
      </LinearGradient>

      <View style={AlertDetailsScreenStyles.contentContainer}>
        <View style={AlertDetailsScreenStyles.card}>
          <Text style={AlertDetailsScreenStyles.cardTitle}>
            {alert.emergencyType} Alert
          </Text>
          <Text style={AlertDetailsScreenStyles.descriptionText}>
            "{alert.description}"
          </Text>
          <Text style={AlertDetailsScreenStyles.detailText}>
            Reported at: {new Date(alert.createdAt).toLocaleString()}
          </Text>
        </View>
        {user &&
          (alert.userRole !== "victim" ? (
            <View style={AlertDetailsScreenStyles.card}>
              <Text style={AlertDetailsScreenStyles.sectionTitle}>
                Your Response
              </Text>
              <AlertResponseButton alertId={alertId} userId={user._id} />
            </View>
          ) : (
            <View style={AlertDetailsScreenStyles.card}>
              <Text style={AlertDetailsScreenStyles.sectionTitle}>
                Alert Status
              </Text>
              <Text style={AlertDetailsScreenStyles.descriptionText}>
                Your alert has been circulated to nearby users. Please be
                patient as responders are notified.
              </Text>
            </View>
          ))}
        <View style={AlertDetailsScreenStyles.card}>
          <Text style={AlertDetailsScreenStyles.sectionTitle}>
            Responders ({alert.responders?.length || 0})
          </Text>
          {alert.responders && alert.responders.length > 0 ? (
            <FlatList
              data={alert.responders}
              renderItem={renderResponderItem}
              keyExtractor={(item) => item.userDetails.id}
              style={AlertDetailsScreenStyles.responderList}
            />
          ) : (
            <Text style={AlertDetailsScreenStyles.emptyText}>
              No responders yet.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default observer(AlertDetailsScreen);
