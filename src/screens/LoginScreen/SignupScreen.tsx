import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { AuthStyles } from "./AuthStyle";
import { signup } from "../../service/authApiService";
// Updated import

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
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      address: "",
    },
  });

  const [locationStatus, setLocationStatus] =
    useState<Location.PermissionStatus>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
        },
      }));
    } catch (error) {
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

  const handleSignup = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await signup(formData);
      if (response.success) {
        Alert.alert("Success", response.message, [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stringFields = ["name", "email", "password", "district", "phoneNumber"];

  return (
    <LinearGradient
      colors={["#1E3C72", "#2A5298"]}
      style={AuthStyles.background}
    >
      <View style={AuthStyles.container}>
        <Text style={AuthStyles.header}>Create Account</Text>
        <Text style={AuthStyles.subtitle}>
          Join our community improvement platform
        </Text>

        {stringFields.map((key) => (
          <TextInput
            key={key}
            style={AuthStyles.input}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            placeholderTextColor="#666"
            value={formData[key as keyof typeof formData] as string}
            onChangeText={(text) => setFormData({ ...formData, [key]: text })}
            secureTextEntry={key === "password"}
            keyboardType={
              key === "email"
                ? "email-address"
                : key === "phoneNumber"
                ? "phone-pad"
                : "default"
            }
          />
        ))}

        <View style={AuthStyles.picker}>
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

        <View style={AuthStyles.input}>
          <Text style={{ color: "#666", marginBottom: 8 }}>
            {formData.location.coordinates.latitude !== 0
              ? `Lat: ${formData.location.coordinates.latitude.toFixed(
                  4
                )}, Lng: ${formData.location.coordinates.longitude.toFixed(4)}`
              : "Location not available"}
          </Text>
          <TouchableOpacity
            style={AuthStyles.button}
            onPress={handleLocationPermission}
          >
            <Text style={AuthStyles.buttonText}>
              {formData.location.coordinates.latitude !== 0
                ? "Update Current Location"
                : "Get Current Location"}
            </Text>
          </TouchableOpacity>
        </View>

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
    </LinearGradient>
  );
};

export default SignUpScreen;
