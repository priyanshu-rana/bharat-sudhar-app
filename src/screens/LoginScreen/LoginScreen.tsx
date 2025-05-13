import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthStyles } from "./AuthStyle";
import { login } from "../../service/authApiService";

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      setIsSubmitting(true);
      const testEmail = "test@example.com";
      const testPassword = "Test@1234";

      const response = await login({
        email: testEmail,
        password: testPassword,
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
  return (
    <LinearGradient
      colors={["#1E3C72", "#2A5298"]}
      style={AuthStyles.background}
    >
      <View style={AuthStyles.container}>
        <Text style={AuthStyles.header}>Bharat Sudhar</Text>
        <Text style={AuthStyles.subtitle}>
          Your platform for community improvement
        </Text>

        <TextInput
          style={AuthStyles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          style={AuthStyles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={AuthStyles.button} onPress={handleLogin}>
          <Text style={AuthStyles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={AuthStyles.linkText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>

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
    </LinearGradient>
  );
};

export default LoginScreen;
