import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { AuthStyles } from "./AuthStylesheet";
import { signup } from "../../service/authApiService";

const LOGO = require("../../../assets/AppIcon.png");

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const SignUpScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    state: STATES[0],
    district: "",
    phoneNumber: "",
    location: {
      type: "Point",
      coordinates: [0, 0], // [longitude, latitude]
      address: "",
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [locationStatus, setLocationStatus] =
    useState<Location.PermissionStatus>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationAddress, setLocationAddress] = useState("");

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status);
      if (status === "granted") {
        await getCurrentLocation();
      }
    })();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let addressText = "";
      let detectedState = "";

      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];

        // Create address string
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

        // Try to match the region/state to our STATES list
        if (address.region) {
          // Normalize the state name to match our format (if possible)
          const normalizedRegion = address.region.trim();
          const matchedState = STATES.find(
            (state) => state.toLowerCase() === normalizedRegion.toLowerCase()
          );

          if (matchedState) {
            detectedState = matchedState;
          }
        }
      } else {
        addressText = `Location coordinates: ${latitude}, ${longitude}`;
      }

      setLocationAddress(addressText);

      // Update the form with location and address info
      setFormData((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [longitude, latitude], // Note: GeoJSON uses [longitude, latitude]
          address: addressText,
        },
        ...(detectedState ? { state: detectedState } : {}),
      }));

      // Show alert if state was detected
      if (detectedState) {
        Alert.alert(
          "Location Detected",
          `Based on your location, we've set your state to: ${detectedState}`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to get location");
    }
  };

  const handleLocationPermission = async () => {
    if (locationStatus !== "granted") {
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
    } else {
      await getCurrentLocation();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Validate district
    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }

    // Validate phone number
    const phoneRegex = /^\d{10}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    // Validate location
    if (
      formData.location.coordinates[0] === 0 &&
      formData.location.coordinates[1] === 0
    ) {
      newErrors.location = "Location is required";
    }

    if (!formData.location.address) {
      newErrors.location = "Location address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (isSubmitting) return;

    if (!validateForm()) {
      Alert.alert("Error", "Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Sending signup data:", JSON.stringify(formData, null, 2));
      const response = await signup(formData);
      if (response.success) {
        Alert.alert("Success", response.message, [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stringFields = [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email Address" },
    { key: "password", label: "Password" },
    { key: "district", label: "District" },
    { key: "phoneNumber", label: "Phone Number" },
  ];

  const handleTextChange = (key: string, text: string) => {
    setFormData({ ...formData, [key]: text });
    // Clear error for this field if it exists
    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={["#4f46e5", "#3730a3"]}
        style={[
          AuthStyles.background,
          {
            paddingTop:
              Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
          },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={AuthStyles.scrollView}
            contentContainerStyle={{ paddingVertical: 10 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={[AuthStyles.container, { paddingTop: 5 }]}>
              <View style={{ alignItems: "center", marginBottom: 15 }}>
                <Image
                  source={LOGO}
                  style={{ width: 60, height: 60, marginBottom: 10 }}
                />
                <Text style={AuthStyles.header}>Create Account</Text>
                <Text style={AuthStyles.subtitle}>
                  Join our community improvement platform
                </Text>
              </View>

              <View style={AuthStyles.formContainer}>
                {stringFields.map((field) => (
                  <View key={field.key} style={{ marginBottom: 15 }}>
                    <TextInput
                      style={[
                        AuthStyles.input,
                        errors[field.key]
                          ? { borderWidth: 1, borderColor: "#FF6B6B" }
                          : {},
                        { marginBottom: errors[field.key] ? 5 : 0 },
                      ]}
                      placeholder={field.label}
                      placeholderTextColor="#666"
                      value={
                        formData[field.key as keyof typeof formData] as string
                      }
                      onChangeText={(text) => handleTextChange(field.key, text)}
                      secureTextEntry={field.key === "password"}
                      keyboardType={
                        field.key === "email"
                          ? "email-address"
                          : field.key === "phoneNumber"
                          ? "phone-pad"
                          : "default"
                      }
                      autoCapitalize={
                        field.key === "email" || field.key === "password"
                          ? "none"
                          : "words"
                      }
                    />
                    {errors[field.key] ? (
                      <Text
                        style={{
                          color: "#FF6B6B",
                          fontSize: 12,
                          marginLeft: 5,
                        }}
                      >
                        {errors[field.key]}
                      </Text>
                    ) : null}
                  </View>
                ))}

                <View
                  style={[
                    AuthStyles.picker,
                    errors.state
                      ? { borderWidth: 1, borderColor: "#FF6B6B" }
                      : {},
                  ]}
                >
                  <Picker
                    selectedValue={formData.state}
                    onValueChange={(itemValue) =>
                      setFormData({ ...formData, state: itemValue })
                    }
                    dropdownIconColor="#666"
                  >
                    {STATES.map((state) => (
                      <Picker.Item key={state} label={state} value={state} />
                    ))}
                  </Picker>
                </View>

                <View
                  style={[
                    AuthStyles.locationContainer,
                    errors.location
                      ? {
                          borderWidth: 1,
                          borderColor: "#FF6B6B",
                          marginBottom: 5,
                        }
                      : {},
                  ]}
                >
                  <Text style={AuthStyles.locationText}>
                    {formData.location.coordinates[1] !== 0
                      ? `Lat: ${formData.location.coordinates[1].toFixed(
                          4
                        )}, Lng: ${formData.location.coordinates[0].toFixed(4)}`
                      : "Location not available"}
                  </Text>
                  {formData.location.address ? (
                    <Text
                      style={[
                        AuthStyles.locationText,
                        { marginTop: 5, fontSize: 12 },
                      ]}
                    >
                      Address: {formData.location.address}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={AuthStyles.locationButton}
                    onPress={handleLocationPermission}
                  >
                    <Text style={AuthStyles.locationButtonText}>
                      {formData.location.coordinates[1] !== 0
                        ? "Update Current Location"
                        : "Get Current Location"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {errors.location ? (
                  <Text
                    style={{
                      color: "#FF6B6B",
                      fontSize: 12,
                      marginLeft: 5,
                      marginBottom: 15,
                    }}
                  >
                    {errors.location}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[AuthStyles.button, isSubmitting && { opacity: 0.6 }]}
                  onPress={handleSignup}
                  disabled={isSubmitting}
                >
                  <Text style={AuthStyles.buttonText}>
                    {isSubmitting ? "Signing Up..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={AuthStyles.linkText}>
                    Already have an account? Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SignUpScreen;
