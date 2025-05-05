import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { BudgetColors } from "../constants/Colors";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../utils/responsive";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;

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

  // Start animations when component mounts
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

  // Handle form page animation
  useEffect(() => {
    if (currentPage === 1) {
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      formFadeAnim.setValue(0);
    }
  }, [currentPage]);

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
    <LinearGradient colors={["#F8F9FA", "#FFFFFF"]} style={styles.welcomeContainer}>
      <Animated.View
        style={[
          styles.welcomeContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} style={styles.logoContainer}>
          <Image source={require("../../assets/images/wally_logo.png")} style={styles.logoImage} />
        </LinearGradient>

        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.welcomeDescription}>Sign in to continue tracking your expenses with Wally</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.welcomeButtonContainer,
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
        <TouchableOpacity style={styles.signInButton} onPress={handleNextPage} activeOpacity={0.9}>
          <LinearGradient colors={[BudgetColors.needs, "#2A9E5C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createAccountButton} onPress={() => router.push("/(auth)/signup")} activeOpacity={0.7}>
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );

  // Mobile login form screen
  const renderLoginForm = () => (
    <View style={styles.loginFormContainer}>
      <Animated.View
        style={[
          styles.loginHeader,
          {
            opacity: formFadeAnim,
            transform: [
              {
                translateY: formFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => setCurrentPage(0)} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={20} color={BudgetColors.needs} />
        </TouchableOpacity>
        <Text style={styles.loginTitle}>Sign In</Text>
        <View style={{ width: 20 }} />
      </Animated.View>

      <ScrollView style={styles.formScrollView} contentContainerStyle={styles.formScrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: formFadeAnim,
              transform: [
                {
                  translateY: formFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
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
            <FontAwesome name="lock" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
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
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading} activeOpacity={0.9}>
            <LinearGradient colors={[BudgetColors.needs, "#2A9E5C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={googleLoading} activeOpacity={0.7}>
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
        </Animated.View>
      </ScrollView>
    </View>
  );

  // Desktop/tablet view with side-by-side panels
  const renderDesktopLayout = () => (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={["#F8F9FA", "#E8F5FF"]} style={styles.leftPanel}>
        <Animated.View
          style={[
            styles.leftPanelContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.desktopLogoContainer}>
            <Text style={styles.desktopLogoText}>W</Text>
          </LinearGradient>
          <Text style={styles.appName}>Welcome to Wally</Text>
          <Text style={styles.tagline}>Your personal expense tracking assistant</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.rightPanel} contentContainerStyle={styles.rightPanelContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.desktopFormContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.desktopLoginTitle}>Sign In</Text>
          <Text style={styles.desktopLoginSubtitle}>Welcome back! Please sign in to continue</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
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
            <FontAwesome name="lock" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
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
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.desktopLoginButton} onPress={handleLogin} disabled={isLoading} activeOpacity={0.9}>
            <LinearGradient colors={[BudgetColors.needs, "#2A9E5C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={googleLoading} activeOpacity={0.7}>
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

          <View style={styles.desktopCreateAccountContainer}>
            <Text style={styles.noAccountText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.createAccountLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {Platform.OS === "web" || width > 768 ? renderDesktopLayout() : currentPage === 0 ? renderWelcomeScreen() : renderLoginForm()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  leftPanelContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  desktopLogoContainer: {
    width: 90,
    height: 90,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveMargin(24),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  desktopLogoText: {
    fontSize: scaleFontSize(40),
    fontWeight: "700",
    color: BudgetColors.needs,
  },
  appName: {
    fontSize: scaleFontSize(32),
    fontWeight: "700",
    color: "#333",
    marginBottom: responsiveMargin(16),
    textAlign: "center",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: scaleFontSize(16),
    color: "#666",
    textAlign: "center",
    marginBottom: responsiveMargin(40),
    lineHeight: 24,
    maxWidth: 300,
  },
  rightPanel: {
    flex: Platform.OS === "web" || width > 768 ? 1 : 0,
    backgroundColor: "#FFFFFF",
    borderRadius: Platform.OS === "web" || width > 768 ? 20 : 0,
    margin: Platform.OS === "web" || width > 768 ? 20 : 0,
    marginLeft: Platform.OS === "web" || width > 768 ? 0 : 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  rightPanelContent: {
    justifyContent: "center",
    padding: responsivePadding(32),
    flexGrow: 1,
  },
  desktopFormContainer: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  desktopLoginTitle: {
    fontSize: scaleFontSize(28),
    fontWeight: "700",
    color: "#333",
    marginBottom: responsiveMargin(8),
    letterSpacing: 0.5,
  },
  desktopLoginSubtitle: {
    fontSize: scaleFontSize(16),
    color: "#666",
    marginBottom: responsiveMargin(32),
  },
  desktopLoginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: responsiveMargin(16),
    elevation: 4,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  desktopCreateAccountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: responsiveMargin(24),
  },
  noAccountText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  createAccountLink: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.needs,
    fontWeight: "600",
  },

  // Mobile welcome screen styles
  welcomeContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: responsivePadding(40),
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsivePadding(30),
  },
  logoContainer: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveMargin(40),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: scaleFontSize(40),
    fontWeight: "700",
    color: BudgetColors.needs,
  },
  welcomeTitle: {
    fontSize: scaleFontSize(32),
    fontWeight: "700",
    color: "#333",
    marginBottom: responsiveMargin(16),
    textAlign: "center",
    letterSpacing: 0.5,
  },
  welcomeDescription: {
    fontSize: scaleFontSize(16),
    color: "#666",
    textAlign: "center",
    marginBottom: responsiveMargin(24),
    lineHeight: 24,
    maxWidth: 300,
  },
  welcomeButtonContainer: {
    paddingHorizontal: responsivePadding(30),
    width: "100%",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: responsivePadding(16),
    marginTop: responsiveMargin(8),
  },
  skipText: {
    color: "#666",
    fontSize: scaleFontSize(14),
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
    paddingHorizontal: responsivePadding(20),
    paddingTop: responsivePadding(20),
    paddingBottom: responsivePadding(15),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 10,
  },
  loginTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#333",
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
    padding: responsivePadding(24),
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
    borderRadius: 16,
    paddingHorizontal: responsivePadding(16),
    marginBottom: responsiveMargin(16),
    height: 56,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  inputIcon: {
    marginRight: responsiveMargin(12),
  },
  input: {
    flex: 1,
    fontSize: scaleFontSize(16),
    color: "#333",
    height: "100%",
  },
  passwordToggle: {
    padding: responsivePadding(8),
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: responsiveMargin(24),
  },
  forgotPasswordText: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.needs,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: responsiveMargin(16),
    elevation: 4,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  signInButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: responsiveMargin(16),
    elevation: 4,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  createAccountButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: responsivePadding(16),
    alignItems: "center",
    marginBottom: responsiveMargin(16),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createAccountButtonText: {
    color: BudgetColors.needs,
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  gradientButton: {
    paddingVertical: responsivePadding(16),
    alignItems: "center",
    borderRadius: 16,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: responsiveMargin(16),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  orText: {
    marginHorizontal: responsiveMargin(12),
    color: "#999",
    fontSize: scaleFontSize(14),
  },
  googleButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: responsivePadding(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveMargin(16),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: responsiveMargin(10),
  },
  googleButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
  },
  demoButton: {
    paddingVertical: responsivePadding(12),
    alignItems: "center",
  },
  demoButtonText: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.needs,
    fontWeight: "500",
  },
});
