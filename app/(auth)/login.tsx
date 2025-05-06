import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/userSlice";
import { scaleFontSize } from "../utils/responsive";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (email === "demo@example.com" && password === "password") {
        dispatch(
          login({
            userId: "user123",
            username: "demo_user",
            email: "demo@example.com",
            token: "mock-token-123",
          })
        );

        router.replace("/(tabs)");
      } else {
        Alert.alert("Login Failed", "Invalid email or password. For demo, use email: demo@example.com and password: password");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Error", "There was a problem logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Google Sign In Error", "There was a problem signing in with Google.");
    }
  };

  const renderLoginForm = () => (
    <LinearGradient colors={["#7FAFF5", "#7FAFF5"]} style={styles.loginFormContainer}>
      <View style={styles.loginHeader}>
        <View style={{ width: 20 }} />
        <Text style={styles.loginTitle}>Sign In</Text>
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
            <FontAwesome name="envelope" size={20} color="#FFFFFF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#FFFFFF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />
            <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={isLoading} activeOpacity={0.9}>
            {isLoading ? <ActivityIndicator color="#4C7ED9" size="small" /> : <Text style={styles.signInButtonText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.createAccountButton} onPress={handleGoogleSignIn} activeOpacity={0.7}>
            <Text style={styles.createAccountButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => {
              setEmail("demo@example.com");
              setPassword("password");
            }}
          >
            <Text style={styles.demoButtonText}>Use Demo Account</Text>
          </TouchableOpacity>

          <View style={styles.signupLinkContainer}>
            <Text style={styles.noAccountText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderLoginForm()}
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

  desktopContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  desktopContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 500,
    padding: 20,
  },
  desktopButtonContainer: {
    width: "100%",
    marginTop: 40,
  },

  welcomeContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  welcomeTitle: {
    fontSize: scaleFontSize(32),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 320,
    alignSelf: "center",
  },
  welcomeButtonContainer: {
    paddingHorizontal: 30,
    width: "100%",
    marginBottom: 50,
  },

  loginFormContainer: {
    flex: 1,
  },
  loginHeader: {
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
  loginTitle: {
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
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    height: "100%",
  },
  passwordToggle: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  signInButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInButtonText: {
    color: "#5B6EF5",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  createAccountButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  createAccountButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  orText: {
    marginHorizontal: 12,
    color: "#FFFFFF",
    fontSize: scaleFontSize(14),
  },
  demoButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  demoButtonText: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    fontWeight: "500",
  },
  signupLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  noAccountText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(14),
  },
  signupLink: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    marginLeft: 4,
  },
});
