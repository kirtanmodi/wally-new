import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { 
  Alert, 
  Animated, 
  Image, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useDispatch } from "react-redux";
import { login, setIsAuthenticated } from "../../redux/slices/userSlice";
import { scaleFontSize } from "../utils/responsive";

export default function SignupScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate signup process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user data
      const userData = {
        userId: Date.now().toString(),
        username: email.split("@")[0],
        email: email,
        token: "signup_token_" + Date.now(),
      };

      dispatch(login(userData));
      dispatch(setIsAuthenticated(true));
      router.replace("/welcome");
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Signup Error", "There was a problem creating your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#7FAFF5", "#7FAFF5"]} style={styles.signupFormContainer}>
        <View style={styles.signupHeader}>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.signupTitle}>Create Account</Text>
          <View style={{ width: 20 }} />
        </View>

        <ScrollView style={styles.formScrollView} contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Image source={require("../../assets/images/wally_logo.png")} style={styles.logoImage} />
            <Text style={styles.welcomeTitle}>Welcome to Wally</Text>
            <Text style={styles.welcomeDescription}>Your AI assistant for expense tracking</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignup} 
              disabled={isLoading} 
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#4C7ED9" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.haveAccountText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7FAFF5",
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 20,
    alignSelf: "center",
  },
  welcomeTitle: {
    fontSize: scaleFontSize(32),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 24,
    maxWidth: 320,
    alignSelf: "center",
  },
  signupFormContainer: {
    flex: 1,
  },
  signupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  backButton: {
    padding: 10,
  },
  signupTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  signupButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  signupButtonText: {
    color: "#4C7ED9",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  haveAccountText: {
    fontSize: scaleFontSize(14),
    color: "rgba(255, 255, 255, 0.8)",
  },
  loginLink: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    fontWeight: "600",
  },
});