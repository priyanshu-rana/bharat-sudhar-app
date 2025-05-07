import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { LinearGradient } from "expo-linear-gradient";

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Dashboard">;
};

const { width } = Dimensions.get("window");

// Define images with fallbacks
const IMAGES = {
  pothole: require("../../assets/images/RoadPotholeIssue.jpg"),
  streetlight: require("../../assets/images/StreelLightIssue.jpg"),
  water: require("../../assets/images/WaterShortageIssue.jpg"),
  garbage: require("../../assets/images/GrabageCollectionIssue.jpg"),
  trafficSignal: require("../../assets/images/TrafficLightIssue.jpg"),
  roadRepair: require("../../assets/images/RoadReapirIssue.jpg"),
};

const LOGO = require("../../assets/AppIcon.png");

const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
  const [activeFilter, setActiveFilter] = useState("all");

  // Sample issues data
  const issues = [
    {
      id: "1",
      title: "Pothole on MG Road",
      description: "Large pothole causing traffic and safety hazard",
      location: "MG Road, Bangalore",
      date: "2 days ago",
      status: "pending",
      upvotes: 24,
      image: IMAGES.pothole,
    },
    {
      id: "2",
      title: "Street Light Not Working",
      description:
        "Street light has been out for a week causing safety concerns",
      location: "Anna Nagar, Chennai",
      date: "1 week ago",
      status: "in_progress",
      upvotes: 18,
      image: IMAGES.streetlight,
    },
    {
      id: "3",
      title: "Water Shortage",
      description: "No water supply for the past 3 days",
      location: "Sector 22, Delhi",
      date: "3 days ago",
      status: "resolved",
      upvotes: 35,
      image: IMAGES.water,
    },
    {
      id: "4",
      title: "Garbage Collection Missed",
      description: "Garbage has not been collected for 5 days",
      location: "Koramangala, Bangalore",
      date: "5 days ago",
      status: "pending",
      upvotes: 12,
      image: IMAGES.garbage,
    },
    {
      id: "5",
      title: "Traffic Signal Malfunction",
      description: "Traffic signal not working properly during peak hours",
      location: "Connaught Place, Delhi",
      date: "1 day ago",
      status: "in_progress",
      upvotes: 28,
      image: IMAGES.trafficSignal,
    },
  ];

  // Filter issues based on active filter
  const filteredIssues = issues.filter((issue) => {
    if (activeFilter === "all") return true;
    return issue.status === activeFilter;
  });

  const renderIssueItem = ({ item }: { item: any }) => (
    <View style={styles.issueCard}>
      <Image source={item.image} style={styles.issueImage} resizeMode="cover" />
      <View style={styles.issueContent}>
        <View style={styles.issueHeader}>
          <Text style={styles.issueTitle}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "pending"
                ? styles.statusPending
                : item.status === "in_progress"
                ? styles.statusInProgress
                : styles.statusResolved,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "pending"
                  ? styles.statusTextPending
                  : item.status === "in_progress"
                  ? styles.statusTextInProgress
                  : styles.statusTextResolved,
              ]}
            >
              {item.status === "pending"
                ? "Pending"
                : item.status === "in_progress"
                ? "In Progress"
                : "Resolved"}
            </Text>
          </View>
        </View>
        <Text style={styles.issueLocation}>{item.location}</Text>
        <Text style={styles.issueDescription}>{item.description}</Text>
        <Text style={styles.issueDate}>Reported on: {item.date}</Text>
        <View style={styles.issueFooter}>
          <Text style={styles.voteCount}>{item.upvotes} Votes</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Details</Text>
            </TouchableOpacity>
            {item.status !== "resolved" && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Vote</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient
          colors={["#4f46e5", "#3730a3"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <Image source={LOGO} style={styles.headerLogo} />
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
        </LinearGradient>

        <StatusBar style="light" backgroundColor="transparent" translucent />

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statNumber}>{issues.length}</Text>
            <Text style={styles.statLabel}>Total Issues</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statNumber}>
              {issues.filter((i) => i.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>
              {issues.filter((i) => i.status === "resolved").length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "all" && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "pending" && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter("pending")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "pending" && styles.filterTextActive,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "in_progress" && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter("in_progress")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "in_progress" && styles.filterTextActive,
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === "resolved" && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter("resolved")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "resolved" && styles.filterTextActive,
              ]}
            >
              Resolved
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredIssues}
          renderItem={renderIssueItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 16,
    marginBottom: 10,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    marginTop: Platform.OS === "ios" ? 30 : 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: "#4f46e5",
  },
  filterText: {
    fontSize: 14,
    color: "#64748b",
  },
  filterTextActive: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  issueCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  issueImage: {
    width: "100%",
    height: 160,
  },
  issueContent: {
    padding: 16,
  },
  issueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusInProgress: {
    backgroundColor: "#dbeafe",
  },
  statusResolved: {
    backgroundColor: "#dcfce7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  statusTextPending: {
    color: "#d97706",
  },
  statusTextInProgress: {
    color: "#2563eb",
  },
  statusTextResolved: {
    color: "#16a34a",
  },
  issueLocation: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  issueDescription: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
    lineHeight: 20,
  },
  issueDate: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 12,
  },
  issueFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  voteCount: {
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: "500",
  },
  buttonGroup: {
    flexDirection: "row",
  },
  actionButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "bold",
  },
});

export default DashboardScreen;
