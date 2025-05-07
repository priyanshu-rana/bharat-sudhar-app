import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

const { width } = Dimensions.get("window");

// Define images with fallbacks
const IMAGES = {
  logo: require("../../assets/logo.png"),
  cityBg: require("../../assets/city-bg.jpg"),
  pothole: require("../../assets/images/RoadPotholeIssue.jpg"),
  streetlight: require("../../assets/images/StreetLightIssue.jpg"),
  water: require("../../assets/images/WaterShortageIssue.jpg"),
  garbage: require("../../assets/images/GarbageCollectionIssue.jpg"),
  trafficSignal: require("../../assets/images/TrafficLightIssue.jpg"),
  success: require("../../assets/images/RoadRepairIssue.jpg"),
};

// Safely get image - handle case when image might be missing
const getImage = (path: any, fallbackColor = "#4f46e5") => {
  try {
    return { source: path };
  } catch (error) {
    return {
      source: undefined,
      fallbackStyle: { backgroundColor: fallbackColor },
    };
  }
};

const LOGO = require("../../assets/AppIcon.png");

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  // State to track images that failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Dummy data for featured issues
  const featuredIssues = [
    {
      id: "1",
      title: "Pothole on MG Road",
      location: "MG Road, Bangalore",
      votes: 24,
      status: "pending",
      image: IMAGES.pothole,
    },
    {
      id: "2",
      title: "Street Light Not Working",
      location: "Anna Nagar, Chennai",
      votes: 18,
      status: "in_progress",
      image: IMAGES.streetlight,
    },
    {
      id: "3",
      title: "Water Shortage",
      location: "Sector 22, Delhi",
      votes: 35,
      status: "resolved",
      image: IMAGES.water,
    },
  ];

  const statistics = [
    {
      value: "1,240+",
      label: "Issues Reported",
      icon: "📝", // Use an actual icon component in production
    },
    {
      value: "860+",
      label: "Issues Resolved",
      icon: "✅", // Use an actual icon component in production
    },
    {
      value: "72%",
      label: "Resolution Rate",
      icon: "📊", // Use an actual icon component in production
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={["#4f46e5", "#3730a3"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.welcomeSubtitle}>
            Welcome to Bharat Sudhar - your platform for community improvement
          </Text>
        </LinearGradient>

        {/* Hero Section with Background Image */}
        <View style={styles.heroBackground}>
          <ImageBackground
            source={IMAGES.cityBg}
            style={styles.heroBackground}
            onError={() => handleImageError("city-bg")}
            defaultSource={require("../../assets/placeholders/city-bg.jpg")}
          >
            <LinearGradient
              colors={["rgba(79, 70, 229, 0.9)", "rgba(55, 48, 163, 0.9)"]}
              style={styles.heroSection}
            >
              <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
                onError={() => handleImageError("logo")}
                defaultSource={require("../../assets/placeholders/logo.png")}
              />
              <Text style={styles.heroTitle}>Bharat Sudhar</Text>
              <Text style={styles.heroSubtitle}>
                Report civic issues and track their resolution
              </Text>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => navigation.navigate("ReportIssue")}
              >
                <Text style={styles.reportButtonText}>Report an Issue</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Stats Section with Icons */}
        <View style={styles.statsContainer}>
          {statistics.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Featured Issues Section with Images */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Issues</Text>
          {featuredIssues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              style={styles.issueCard}
              onPress={() => navigation.navigate("Dashboard")}
            >
              <View
                style={[
                  styles.issueImageContainer,
                  failedImages[issue.id] && styles.imagePlaceholder,
                ]}
              >
                {!failedImages[issue.id] && (
                  <Image
                    source={issue.image}
                    style={styles.issueImage}
                    resizeMode="cover"
                    onError={() => handleImageError(issue.id)}
                    defaultSource={require("../../assets/placeholders/pothole.jpg")}
                  />
                )}
                {failedImages[issue.id] && (
                  <Text style={styles.placeholderText}>{issue.title}</Text>
                )}
              </View>
              <View style={styles.issueContent}>
                <View style={styles.issueHeader}>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      issue.status === "pending"
                        ? styles.statusPending
                        : issue.status === "in_progress"
                        ? styles.statusInProgress
                        : styles.statusResolved,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {issue.status === "pending"
                        ? "Pending"
                        : issue.status === "in_progress"
                        ? "In Progress"
                        : "Resolved"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.issueLocation}>{issue.location}</Text>
                <View style={styles.issueFooter}>
                  <Text style={styles.voteCount}>{issue.votes} Votes</Text>
                  <TouchableOpacity style={styles.voteButton}>
                    <Text style={styles.voteButtonText}>Vote</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Call to Action Section with Background */}
        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={["#4f46e5", "#3730a3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>Make Your Voice Heard</Text>
            <Text style={styles.ctaText}>
              Join thousands of citizens reporting and tracking civic issues in
              their community.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Text style={styles.ctaButtonText}>View All Issues</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Recent Success Stories */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Success Stories</Text>
          <View style={styles.successStoryCard}>
            <View
              style={[
                styles.successImageContainer,
                failedImages["success"] && styles.imagePlaceholder,
              ]}
            >
              {!failedImages["success"] && (
                <Image
                  source={IMAGES.success}
                  style={styles.successImage}
                  resizeMode="cover"
                  onError={() => handleImageError("success")}
                  defaultSource={require("../../assets/placeholders/success.jpg")}
                />
              )}
              {failedImages["success"] && (
                <Text style={styles.placeholderText}>Success Story</Text>
              )}
            </View>
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>
                Road Repair in Mayur Vihar
              </Text>
              <Text style={styles.successText}>
                Thanks to community efforts, the main road in Mayur Vihar was
                repaired within 10 days of reporting.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
  scrollView: {
    flex: 1,
  },
  heroBackground: {
    width: "100%",
    height: 300,
  },
  heroSection: {
    padding: 30,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
    marginBottom: 24,
  },
  reportButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  reportButtonText: {
    color: "#4f46e5",
    fontWeight: "bold",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  sectionContainer: {
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    paddingLeft: 4,
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
  issueImageContainer: {
    width: "100%",
    height: 160,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
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
    fontSize: 12,
    fontWeight: "500",
    color: "#1e293b",
  },
  issueLocation: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
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
  voteButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  voteButtonText: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "500",
  },
  ctaContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  ctaGradient: {
    padding: 24,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 14,
    color: "#e0e7ff",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  successStoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successImageContainer: {
    width: "100%",
    height: 180,
  },
  successImage: {
    width: "100%",
    height: 180,
  },
  successContent: {
    padding: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  imagePlaceholder: {
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#64748b",
    fontWeight: "500",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#e0e7ff",
    textAlign: "center",
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === "android" ? 40 : 20,
    marginTop: Platform.OS === "ios" ? 30 : 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

export default HomeScreen;
