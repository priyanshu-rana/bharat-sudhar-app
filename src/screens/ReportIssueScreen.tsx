import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { LinearGradient } from "expo-linear-gradient";

const LOGO = require("../../assets/AppIcon.png");

type ReportIssueScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ReportIssue">;
};

const ReportIssueScreen = ({ navigation }: ReportIssueScreenProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const CATEGORIES = [
    { id: "pothole", name: "Road Pothole", icon: "🛣️" },
    { id: "streetlight", name: "Street Light Issue", icon: "💡" },
    { id: "water", name: "Water Shortage", icon: "💧" },
    { id: "garbage", name: "Garbage Collection", icon: "🗑️" },
    { id: "traffic", name: "Traffic Signal", icon: "🚦" },
    { id: "other", name: "Other", icon: "📌" },
  ];

  const handleSubmit = () => {
    if (!title || !description || !location || !category) {
      Alert.alert("Missing Fields", "Please fill in all required fields");
      return;
    }

    // In a real app, you would submit the issue to your backend here
    Alert.alert(
      "Issue Reported",
      "Your issue has been reported successfully. You can track its status in the dashboard.",
      [
        {
          text: "Go to Dashboard",
          onPress: () => navigation.navigate("Dashboard"),
        },
        {
          text: "OK",
          onPress: () => navigation.navigate("Home"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#4f46e5", "#3730a3"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Image source={LOGO} style={styles.headerLogo} />
          <Text style={styles.headerTitle}>Report Issue</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Issue Details</Text>
              <Text style={styles.formLabel}>Issue Title*</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a short, descriptive title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#94a3b8"
              />

              <Text style={styles.formLabel}>Category*</Text>
              <View style={styles.categoryContainer}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.categoryButtonText,
                        category === cat.id && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Location*</Text>
              <View style={styles.locationInputContainer}>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Enter the location of the issue"
                  value={location}
                  onChangeText={setLocation}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity style={styles.locationButton}>
                  <Text style={styles.locationButtonText}>📍</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Description*</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the issue in detail"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Evidence</Text>
              <Text style={styles.sectionDescription}>
                Adding photos helps authorities understand and resolve the issue
                faster
              </Text>

              <View style={styles.imagesPreviewContainer}>
                <TouchableOpacity style={styles.imagePlaceholder}>
                  <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePlaceholder}>
                  <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePlaceholder}>
                  <Text style={styles.plusIcon}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.photoButton}>
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>Add Photos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                By submitting this report, you acknowledge that the information
                provided is accurate to the best of your knowledge.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  locationInputContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  locationInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: 14,
    fontSize: 16,
    color: "#1e293b",
  },
  locationButton: {
    backgroundColor: "#4f46e5",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  locationButtonText: {
    fontSize: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  categoryButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: "#4f46e5",
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#64748b",
  },
  categoryButtonTextActive: {
    color: "#ffffff",
  },
  imagesPreviewContainer: {
    flexDirection: "row",
    marginVertical: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  plusIcon: {
    fontSize: 24,
    color: "#94a3b8",
  },
  photoButton: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  photoButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: "#4f46e5",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  disclaimer: {
    marginBottom: 40,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
  },
});

export default ReportIssueScreen;
