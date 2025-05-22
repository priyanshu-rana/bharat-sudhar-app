import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { AuthStyles } from "./AuthStylesheet";
import { login } from "../../service/authApiService";

// Add logo import
const LOGO = require("../../../assets/AppIcon.png");

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      const response = await login({
        email: email,
        password: password,
      });

      if (response.success) {
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", response.message);
      }
    } catch (error: any) {
      console.error("Full error object:", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
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
        <ScrollView
          style={AuthStyles.scrollView}
          contentContainerStyle={{ paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[AuthStyles.container, { paddingTop: 20 }]}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Image
                source={LOGO}
                style={{ width: 70, height: 70, marginBottom: 16 }}
              />
              <Text style={AuthStyles.header}>Bharat Sudhar</Text>
              <Text style={AuthStyles.subtitle}>
                Your platform for community improvement
              </Text>
            </View>

            <View style={AuthStyles.formContainer}>
              <View style={{ marginBottom: 15 }}>
                <TextInput
                  style={[
                    AuthStyles.input,
                    errors.email
                      ? { borderWidth: 1, borderColor: "#FF6B6B" }
                      : {},
                    { marginBottom: errors.email ? 5 : 0 },
                  ]}
                  placeholder="Email Address"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={(value) => handleTextChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? (
                  <Text
                    style={{ color: "#FF6B6B", fontSize: 12, marginLeft: 5 }}
                  >
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginBottom: 15 }}>
                <TextInput
                  style={[
                    AuthStyles.input,
                    errors.password
                      ? { borderWidth: 1, borderColor: "#FF6B6B" }
                      : {},
                    { marginBottom: errors.password ? 5 : 0 },
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#666"
                  secureTextEntry
                  value={password}
                  onChangeText={(value) => handleTextChange("password", value)}
                  autoCapitalize="none"
                />
                {errors.password ? (
                  <Text
                    style={{ color: "#FF6B6B", fontSize: 12, marginLeft: 5 }}
                  >
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={AuthStyles.button}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color="#4f46e5" />
                    <Text style={[AuthStyles.buttonText, { marginLeft: 8 }]}>
                      Logging in...
                    </Text>
                  </View>
                ) : (
                  <Text style={AuthStyles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={AuthStyles.linkText}>
                  Don't have an account? Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <View style={AuthStyles.statsContainer}>
              <View style={AuthStyles.statBox}>
                <Text style={AuthStyles.statValue}>1,240+</Text>
                <Text style={AuthStyles.statLabel}>Issues Reported</Text>
              </View>
              <View style={AuthStyles.statBox}>
                <Text style={AuthStyles.statValue}>860+</Text>
                <Text style={AuthStyles.statLabel}>Resolved</Text>
              </View>
              <View style={AuthStyles.statBox}>
                <Text style={AuthStyles.statValue}>72%</Text>
                <Text style={AuthStyles.statLabel}>Success Rate</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginScreen;
