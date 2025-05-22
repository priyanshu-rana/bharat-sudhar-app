import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { StatusType } from "../navigation/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { logout, getUser } from "../service/authApiService";

const LOGO = require("../../assets/AppIcon.png");

// Default user data
const DEFAULT_USER_DATA = {
  id: "user123",
  name: "Bharat User",
  email: "user@example.com",
  phone: "+91 98765 43210",
  location: "India",
  bio: "Passionate about making my city better! Active citizen helping to improve our community infrastructure.",
  joinDate: "2023",
  issuesReported: 0,
  issuesResolved: 0,
  profileImage: LOGO,
  badgeLevel: "New Citizen",
  points: 0,
};

interface Activity {
  id: string;
  type: "report" | "update" | "comment" | "upvote";
  title: string;
  description?: string;
  location?: string;
  date: string;
  status: StatusType;
}

// Sample activity data
const ACTIVITIES: Activity[] = [
  {
    id: "act1",
    type: "report",
    title: "Reported a Pothole",
    location: "MG Road, Delhi",
    date: "2 days ago",
    status: "pending",
  },
  {
    id: "act2",
    type: "update",
    title: "Issue Status Updated",
    description: "Street Light Repair",
    date: "1 week ago",
    status: "in_progress",
  },
  {
    id: "act3",
    type: "comment",
    title: "Commented on an Issue",
    description: "Water Supply Disruption",
    date: "2 weeks ago",
    status: "resolved",
  },
  {
    id: "act4",
    type: "upvote",
    title: "Upvoted an Issue",
    description: "Garbage Collection",
    date: "3 weeks ago",
    status: "pending",
  },
];

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [userData, setUserData] = useState(DEFAULT_USER_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getUser();

      if (user) {
        // Map API user data to our UI format
        setUserData({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phoneNumber,
          location: `${user.district}, ${user.state}`,
          bio: "Citizen helping to improve community infrastructure.",
          joinDate: new Date().getFullYear().toString(),
          issuesReported: user.reputation?.totalReports || 0,
          issuesResolved: user.reputation?.resolvedReports || 0,
          profileImage:
            user.name == "Priyanshu Rana" //TODO: Remove all these checks lateron
              ? {
                  uri: "https://avatars.githubusercontent.com/u/100445654?v=4",
                }
              : LOGO,
          badgeLevel:
            user.name == "Priyanshu Rana"
              ? getUserLevel(1000)
              : getUserLevel(user.reputation?.score || 0),
          points:
            user.name == "Priyanshu Rana" ? 1000 : user.reputation?.score || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine user level based on reputation score
  const getUserLevel = (score: number): string => {
    if (score >= 1000) return "Gold Citizen";
    if (score >= 500) return "Silver Citizen";
    if (score >= 100) return "Bronze Citizen";
    return "New Citizen";
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      "Edit Profile",
      "Edit profile functionality will be implemented in the next update."
    );
  };

  const handleShareProfile = () => {
    Alert.alert(
      "Share Profile",
      "Share profile functionality will be implemented in the next update."
    );
  };

  const getStatusStyle = (status: StatusType) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "in_progress":
        return styles.statusInProgress;
      case "resolved":
        return styles.statusResolved;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: StatusType) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return "Pending";
    }
  };

  // Calculate success rate
  const successRate =
    userData.issuesReported > 0
      ? Math.round((userData.issuesResolved / userData.issuesReported) * 100)
      : 0;

  // Stats to display
  const STATS = [
    {
      title: "Issues Reported",
      value: userData.issuesReported,
      icon: "📝",
    },
    {
      title: "Issues Resolved",
      value: userData.issuesResolved,
      icon: "✅",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: "📊",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Profile Header with Gradient Background */}
      <LinearGradient
        colors={["#4f46e5", "#3730a3"]}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <Image source={LOGO} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image source={userData.profileImage} style={styles.profileImage} />
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{userData.badgeLevel}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileLocation}>{userData.location}</Text>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>Points:</Text>
              <Text style={styles.pointsValue}>{userData.points}</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleShareProfile}
          >
            <Text style={styles.actionButtonTextSecondary}>Share Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs Navigation */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "activity" && styles.activeTab]}
          onPress={() => setActiveTab("activity")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "activity" && styles.activeTabText,
            ]}
          >
            Activity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "achievements" && styles.activeTab]}
          onPress={() => setActiveTab("achievements")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "achievements" && styles.activeTabText,
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <Text style={styles.bioText}>{userData.bio}</Text>
              <View style={styles.joinedContainer}>
                <Text style={styles.joinedText}>
                  Joined {userData.joinDate}
                </Text>
              </View>
            </View>

            {/* Stats Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              <View style={styles.statsContainer}>
                {STATS.map((stat, index) => (
                  <View key={index} style={styles.statCard}>
                    <Text style={styles.statIcon}>{stat.icon}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Contact Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{userData.email}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{userData.phone}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{userData.location}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Activity Tab Content */}
        {activeTab === "activity" && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>

              {ACTIVITIES.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIconContainer}>
                    <Text style={styles.activityIcon}>
                      {activity.type === "report"
                        ? "📝"
                        : activity.type === "update"
                        ? "🔄"
                        : activity.type === "comment"
                        ? "💬"
                        : "👍"}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    {activity.description && (
                      <Text style={styles.activityDescription}>
                        {activity.description}
                      </Text>
                    )}
                    {activity.location && (
                      <Text style={styles.activityLocation}>
                        {activity.location}
                      </Text>
                    )}
                    <View style={styles.activityFooter}>
                      <Text style={styles.activityDate}>{activity.date}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          getStatusStyle(activity.status),
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getStatusText(activity.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllButtonText}>
                  View All Activities
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Achievements Tab Content */}
        {activeTab === "achievements" && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Badges & Achievements</Text>

              <View style={styles.achievementsContainer}>
                <View style={styles.achievementItem}>
                  <View
                    style={[
                      styles.achievementBadge,
                      styles.achievementCompleted,
                    ]}
                  >
                    <Text style={styles.achievementIcon}>🏆</Text>
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementTitle}>
                      First Issue Reported
                    </Text>
                    <Text style={styles.achievementDescription}>
                      Report your first civic issue
                    </Text>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.achievementItem}>
                  <View
                    style={[
                      styles.achievementBadge,
                      styles.achievementCompleted,
                    ]}
                  >
                    <Text style={styles.achievementIcon}>⭐</Text>
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementTitle}>Issue Resolver</Text>
                    <Text style={styles.achievementDescription}>
                      Get 5 issues resolved
                    </Text>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.achievementItem}>
                  <View
                    style={[
                      styles.achievementBadge,
                      styles.achievementInProgress,
                    ]}
                  >
                    <Text style={styles.achievementIcon}>🔍</Text>
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementTitle}>
                      Community Champion
                    </Text>
                    <Text style={styles.achievementDescription}>
                      Report 20 valid civic issues
                    </Text>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${(userData.issuesReported / 20) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {userData.issuesReported}/20 Completed
                    </Text>
                  </View>
                </View>

                <View style={styles.achievementItem}>
                  <View
                    style={[styles.achievementBadge, styles.achievementLocked]}
                  >
                    <Text style={styles.achievementIcon}>🌟</Text>
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementTitle}>Civic Hero</Text>
                    <Text style={styles.achievementDescription}>
                      Reach 1000 points in your profile
                    </Text>
                    <View style={styles.progressContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${(userData.points / 1000) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {userData.points}/1000 Points
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Logout Button at the bottom of the screen */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  headerContainer: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    marginTop: Platform.OS === "ios" ? 30 : 0,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
  },
  badgeContainer: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#fcd34d",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "white",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#78350f",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  pointsLabel: {
    fontSize: 12,
    color: "white",
    marginRight: 4,
  },
  pointsValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  profileActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  actionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
    marginRight: 0,
  },
  actionButtonText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 14,
  },
  actionButtonTextSecondary: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingVertical: 16,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 22,
  },
  joinedContainer: {
    marginTop: 12,
    backgroundColor: "#f1f5f9",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  joinedText: {
    fontSize: 12,
    color: "#64748b",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginHorizontal: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  contactValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  activityFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: "600",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
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
    fontSize: 11,
    fontWeight: "500",
    color: "#1e293b",
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
  },
  achievementBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  achievementCompleted: {
    backgroundColor: "#dcfce7",
  },
  achievementInProgress: {
    backgroundColor: "#dbeafe",
  },
  achievementLocked: {
    backgroundColor: "#f1f5f9",
  },
  achievementIcon: {
    fontSize: 22,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  completedBadge: {
    backgroundColor: "#dcfce7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  completedText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#166534",
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4f46e5",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4f46e5",
    marginTop: 16,
  },
});

export default ProfileScreen;
