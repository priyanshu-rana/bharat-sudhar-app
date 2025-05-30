import React, { useState, useEffect } from "react";
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
  Linking,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { reportIssueService } from "../service/issueApiService";
import { getToken } from "../service/authApiService";
import dashboardStore from "../store/DashboardStore";

const LOGO = require("../../assets/AppIcon.png");

// Define images with fallbacks
const IMAGES = {
  pothole: require("../../assets/images/RoadPotholeIssue.jpg"),
  streetlight: require("../../assets/images/StreetLightIssue.jpg"),
  water: require("../../assets/images/WaterShortageIssue.jpg"),
  garbage: require("../../assets/images/GarbageCollectionIssue.jpg"),
  traffic: require("../../assets/images/TrafficLightIssue.jpg"),
  other: require("../../assets/AppIcon.png"),
};

type ReportIssueScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ReportIssue">;
  route: {
    params?: {
      addNewIssue?: (issue: any) => void;
    };
  };
};

const ReportIssueScreen = ({ navigation, route }: ReportIssueScreenProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CATEGORIES = [
    { id: "infrastructure", name: "Infrastructure Issue", icon: "🏗️" },
    { id: "water", name: "Water Issue", icon: "💧" },
    { id: "electricity", name: "Electricity Issue", icon: "⚡" },
    { id: "safety", name: "Safety Issue", icon: "🛡️" },
    { id: "noise", name: "Noise Issue", icon: "🔊" },
    { id: "pollution", name: "Pollution Issue", icon: "🌫️" },
    { id: "other", name: "Other Issue", icon: "📌" },
  ];

  const handleAddPhoto = () => {
    Alert.alert("Add Photo", "Choose the source", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
      base64: false,
      exif: false,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages((prev) => [...prev, ...newImages].slice(0, 3));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert("Permission required", "Please allow access to your camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.7,
      allowsEditing: true,
      base64: false,
      exif: false,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setImages((prev) => [...prev, newImage].slice(0, 3));
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to use this feature",
          [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let addressText = "";
      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];
        addressText = [
          address.street,
          address.city,
          address.district,
          address.postalCode,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");
      } else {
        addressText = `Location coordinates: ${location.coords.latitude}, ${location.coords.longitude}`;
      }

      setLocationCoords([location.coords.longitude, location.coords.latitude]);
      setLocationAddress(addressText);
      setLocationText(addressText);
      setIsLoadingLocation(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location. Please try again.");
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !locationText || !category) {
      Alert.alert("Missing Fields", "Please fill in all required fields");
      return;
    }

    if (!locationCoords || !locationAddress) {
      Alert.alert("Location Required", "Please get your current location first");
      return;
    }

    try {
      setIsSubmitting(true);
      // Check if we have a valid auth token
      const token = await getToken();
      if (!token) {
        Alert.alert(
          "Authentication Required",
          "Please log in to report an issue.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
        return;
      }

      console.log("Starting issue creation...");
      console.log("Form data:", { 
        title, 
        description, 
        location: {
          coordinates: locationCoords,
          address: locationAddress
        }, 
        category 
      });

      // Convert images to base64 if needed
      let base64Image = undefined;
      if (images.length > 0) {
        console.log("Converting image to base64...");
        try {
          // For now, just use the first image
          const response = await fetch(images[0]);
          const blob = await response.blob();
          const reader = new FileReader();
          base64Image = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read image"));
            reader.readAsDataURL(blob);
          });
          console.log("Image converted successfully");
        } catch (imageError) {
          console.error("Error converting image:", imageError);
          throw new Error("Failed to process image. Please try again.");
        }
      }

      console.log("Making API call to create issue...");
      // Create issue using the API service
      const newIssue = await reportIssueService.createIssue({
        title,
        description,
        location: {
          coordinates: locationCoords,
          address: locationAddress
        },
        category,
        image: base64Image,
      });

      console.log("API response:", newIssue);

      if (!newIssue) {
        throw new Error("Failed to create issue. Please try again.");
      }

      // Refresh dashboard data and user data
      await dashboardStore.loadIssues();
      await dashboardStore.refreshUserData();

      // Show success message
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

      // Reset form
      setTitle("");
      setDescription("");
      setLocationText("");
      setCategory("");
      setImages([]);
    } catch (error: any) {
      console.error("Error submitting issue:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit your issue. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#ffffff"
            />
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
                  value={locationText}
                  onChangeText={setLocationText}
                  placeholderTextColor="#94a3b8"
                  editable={false}
                />
                <TouchableOpacity 
                  style={[
                    styles.locationButton,
                    isLoadingLocation && styles.locationButtonDisabled
                  ]} 
                  onPress={getCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.locationButtonText}>📍</Text>
                  )}
                </TouchableOpacity>
              </View>
              {locationAddress && (
                <Text style={styles.locationAddressText}>
                  {locationAddress}
                </Text>
              )}

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
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteImage(index)}
                    >
                      <Text style={styles.deleteButtonText}>x</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 3 && (
                  <TouchableOpacity
                    style={styles.imagePlaceholder}
                    onPress={handleAddPhoto}
                  >
                    <Text style={styles.plusIcon}>+</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleAddPhoto}
              >
                <Text style={styles.photoButtonIcon}>📷</Text>
                <Text style={styles.photoButtonText}>Add Photos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
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
  imageContainer: {
    position: "relative",
    width: 80,
    height: 80,
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 18,
    lineHeight: 20,
  },
  locationButtonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  locationAddressText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#6b7280",
  },
});

export default ReportIssueScreen;
