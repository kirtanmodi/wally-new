import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
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
import { extractGoogleUserProfile, useGoogleAuth } from "../../app/services/AuthService";
import { googleLogin, login } from "../../redux/slices/userSlice";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Google Auth
  const { userInfo, loading: googleLoading, error: googleError, signInWithGoogle } = useGoogleAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Effect to handle Google auth response
  useEffect(() => {
    if (userInfo) {
      // Process Google authentication
      const profile = extractGoogleUserProfile(userInfo);
      if (profile) {
        dispatch(
          googleLogin({
            userId: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            avatar: profile.avatar,
            token: "google-auth-token", // In a real app, you would use the actual token
          })
        );
        router.replace("/(tabs)");
      }
    }
  }, [userInfo, dispatch, router]);

  // Handle login with email/password
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password");
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll use mock data
      if (email === "demo@example.com" && password === "password") {
        // Dispatch login action to Redux
        dispatch(
          login({
            userId: "user123",
            username: "demo_user",
            email: "demo@example.com",
            token: "mock-token-123",
          })
        );

        // Navigate to tabs
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

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Google Sign In Error", "There was a problem signing in with Google.");
    }
  };

  // Handle page change
  const handleNextPage = () => {
    setCurrentPage(1);
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  // Mobile welcome screen
  const renderWelcomeScreen = () => (
    <LinearGradient colors={["#6684ED", "#7E6EE8"]} style={styles.welcomeContainer}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.welcomeContent}>
        <Image source={require("../../assets/images/icon.png")} style={styles.welcomeImage} />

        <Text style={styles.welcomeTitle}>Welcome to Wally</Text>
        <Text style={styles.welcomeDescription}>Your personal AI assistant for expense tracking</Text>

        <View style={styles.paginationContainer}>
          <View style={[styles.paginationDot, styles.activeDot]} />
          <View style={styles.paginationDot} />
          <View style={styles.paginationDot} />
        </View>
      </View>

      <View style={styles.welcomeButtonContainer}>
        <TouchableOpacity style={styles.signInButton} onPress={handleNextPage}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createAccountButton} onPress={() => router.push("/(auth)/signup")}>
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  // Mobile login form screen
  const renderLoginForm = () => (
    <View style={styles.loginFormContainer}>
      <View style={styles.loginHeader}>
        <TouchableOpacity onPress={() => setCurrentPage(0)} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color="#7E6EE8" />
        </TouchableOpacity>
        <Text style={styles.loginTitle}>Sign In</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.formScrollView} contentContainerStyle={styles.formScrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#7E6EE8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#7E6EE8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={googleLoading}>
            {googleLoading ? (
              <ActivityIndicator color="#333" size="small" />
            ) : (
              <>
                <Image
                  source={require("../../assets/images/react-logo.png")}
                  style={styles.googleIcon}
                  defaultSource={require("../../assets/images/react-logo.png")}
                />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
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
        </View>
      </ScrollView>
    </View>
  );

  // Desktop/tablet view with side-by-side panels
  const renderDesktopLayout = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={["#6684ED", "#7E6EE8"]} style={styles.leftPanel}>
        <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
        <Text style={styles.appName}>Welcome to Wally</Text>
        <Text style={styles.tagline}>Your AI assistant for expense tracking</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.signInButtonText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.createAccountButton} onPress={() => router.push("/(auth)/signup")}>
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.rightPanel} contentContainerStyle={styles.rightPanelContent}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#7E6EE8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#7E6EE8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={googleLoading}>
            {googleLoading ? (
              <ActivityIndicator color="#333" size="small" />
            ) : (
              <>
                <Image
                  source={require("../../assets/images/react-logo.png")}
                  style={styles.googleIcon}
                  defaultSource={require("../../assets/images/react-logo.png")}
                />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {Platform.OS === "web" || width > 768 ? renderDesktopLayout() : currentPage === 0 ? renderWelcomeScreen() : renderLoginForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  // Desktop layout styles
  leftPanel: {
    flex: Platform.OS === "web" || width > 768 ? 1 : 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    borderRadius: Platform.OS === "web" || width > 768 ? 20 : 0,
    margin: Platform.OS === "web" || width > 768 ? 20 : 0,
    overflow: "hidden",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  rightPanel: {
    flex: Platform.OS === "web" || width > 768 ? 1 : 0,
    backgroundColor: "#FFFFFF",
    borderRadius: Platform.OS === "web" || width > 768 ? 20 : 0,
    margin: Platform.OS === "web" || width > 768 ? 20 : 0,
    marginLeft: Platform.OS === "web" || width > 768 ? 0 : 20,
  },
  rightPanelContent: {
    justifyContent: "center",
    padding: 24,
    flexGrow: 1,
  },

  // Mobile welcome screen styles
  welcomeContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  skipButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  welcomeImage: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  welcomeDescription: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  welcomeButtonContainer: {
    paddingHorizontal: 30,
    width: "100%",
  },

  // Mobile login form styles
  loginFormContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loginHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 10,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    padding: 24,
  },

  // Common styles
  formContainer: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
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
    fontSize: 14,
    color: "#7E6EE8",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#7E6EE8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  signInButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 30,
    paddingVertical: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  createAccountButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  createAccountButtonText: {
    color: "#6684ED",
    fontSize: 16,
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
    backgroundColor: "#E0E0E0",
  },
  orText: {
    marginHorizontal: 12,
    color: "#666",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  demoButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: "center",
  },
  demoButtonText: {
    fontSize: 14,
    color: "#7E6EE8",
    fontWeight: "500",
  },
});
