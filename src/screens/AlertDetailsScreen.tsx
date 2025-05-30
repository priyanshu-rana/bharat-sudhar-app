import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
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
import { getAlertCardStyles } from "../helpers";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

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

  const openMapsWithDirections = () => {
    if (alert?.location?.coordinates) {
      const lat = alert.location.coordinates[1];
      const lng = alert.location.coordinates[0];
      const label = `Emergency: ${alert.emergencyType}`;
      const url = Platform.select({
        ios: `maps://app?saddr=Current+Location&daddr=${lat},${lng}&dirflg=d`,
        android: `google.navigation:q=${lat},${lng}`,
      }) || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      
      Linking.openURL(url);
    }
  };

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

      <ScrollView 
        style={AlertDetailsScreenStyles.scrollContainer}
        contentContainerStyle={AlertDetailsScreenStyles.contentContainer}
      >
        <View style={[AlertDetailsScreenStyles.card]}>
          <View style={AlertDetailsScreenStyles.cardHeader}>
            <View style={AlertDetailsScreenStyles.typeContainer}>
              <MaterialCommunityIcons
                name={getAlertCardStyles(alert.emergencyType).icon}
                size={24}
                color={getAlertCardStyles(alert.emergencyType).color}
                style={AlertDetailsScreenStyles.typeIcon}
              />
              <Text
                style={[
                  AlertDetailsScreenStyles.cardTitle,
                  { color: getAlertCardStyles(alert.emergencyType).color },
                ]}
              >
                {alert.emergencyType.charAt(0).toUpperCase() +
                  alert.emergencyType.slice(1)}{" "}
                Alert
              </Text>
            </View>
            <View
              style={[
                AlertDetailsScreenStyles.statusBadge,
                {
                  backgroundColor: getAlertCardStyles(alert.emergencyType)
                    .backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  AlertDetailsScreenStyles.statusText,
                  { color: getAlertCardStyles(alert.emergencyType).color },
                ]}
              >
                Active
              </Text>
            </View>
          </View>

          <Text style={AlertDetailsScreenStyles.descriptionText}>
            "{alert.description}"
          </Text>

          <View style={AlertDetailsScreenStyles.timeContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#6b7280"
              style={{ marginRight: 4 }}
            />
            <Text style={AlertDetailsScreenStyles.detailText}>
              {new Date(alert.createdAt).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {alert?.location?.coordinates && (
          <View style={AlertDetailsScreenStyles.mapCard}>
            <MapView
              style={AlertDetailsScreenStyles.miniMap}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: alert.location.coordinates[1],
                longitude: alert.location.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              loadingEnabled={true}
              mapType="standard"
            >
              <Marker
                coordinate={{
                  latitude: alert.location.coordinates[1],
                  longitude: alert.location.coordinates[0],
                }}
                title={`Emergency: ${alert.emergencyType}`}
                description={alert.description}
                pinColor="red"
              />
            </MapView>
            <TouchableOpacity
              style={AlertDetailsScreenStyles.directionsButton}
              onPress={openMapsWithDirections}
            >
              <MaterialCommunityIcons
                name="directions"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={AlertDetailsScreenStyles.directionsButtonText}>
                Get Directions
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={AlertDetailsScreenStyles.card}>
          <Text style={AlertDetailsScreenStyles.sectionTitle}>
            Alert Created By
          </Text>
          <View style={AlertDetailsScreenStyles.victimDetailsContainer}>
            <View style={AlertDetailsScreenStyles.detailRow}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#4f46e5"
                style={AlertDetailsScreenStyles.iconStyle}
              />
              <Text style={AlertDetailsScreenStyles.victimName}>
                {alert.userDetails?.name ?? "Anonymous"}
              </Text>
            </View>
            <View style={AlertDetailsScreenStyles.detailRow}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color="#4f46e5"
                style={AlertDetailsScreenStyles.iconStyle}
              />
              <TouchableOpacity
                onPress={() => {
                  if (alert.userDetails?.phoneNumber) {
                    Linking.openURL(`tel:${alert.userDetails.phoneNumber}`);
                  }
                }}
              >
                <Text style={AlertDetailsScreenStyles.victimPhone}>
                  {alert.userDetails?.phoneNumber ?? "Not available"}
                </Text>
              </TouchableOpacity>
              <Text style={AlertDetailsScreenStyles.victimPhoneTooltip}>
                (* Click no. to call)
              </Text>
            </View>
          </View>
        </View>

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
              scrollEnabled={false}
            />
          ) : (
            <Text style={AlertDetailsScreenStyles.emptyText}>
              No responders yet.
            </Text>
          )}
        </View>

        {user && (
          alert.userRole !== "victim" ? (
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
          )
        )}

        <View style={AlertDetailsScreenStyles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(AlertDetailsScreen);
