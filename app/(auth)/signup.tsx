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
import { googleLogin, login, updateProfile } from "../../redux/slices/userSlice";
import { BudgetColors } from "../constants/Colors";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../utils/responsive";

const { width } = Dimensions.get("window");

export default function SignupScreen() {
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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  // Handle signup
  const handleSignup = async () => {
    // Validate inputs
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Your passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password should be at least 6 characters");
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, this would be an API call to register
      // For demo purposes, we'll use mock data

      // Dispatch login action to Redux
      dispatch(
        login({
          userId: "user123",
          username: email.split("@")[0],
          email,
          token: "mock-token-123",
        })
      );

      // Update profile with full name
      dispatch(
        updateProfile({
          fullName,
        })
      );

      // Navigate to tabs
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Signup Error", "There was a problem creating your account. Please try again.");
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

  // Mobile welcome screen
  const renderWelcomeScreen = () => (
    <LinearGradient colors={["#F8F9FA", "#F8F9FA"]} style={styles.welcomeContainer}>
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

        <Text style={styles.welcomeTitle}>Join Wally</Text>
        <Text style={styles.welcomeDescription}>Create an account to start tracking your expenses easily</Text>
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
        <TouchableOpacity style={styles.createAccountButton} onPress={handleNextPage} activeOpacity={0.9}>
          <LinearGradient colors={[BudgetColors.needs, "#2A9E5C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInButton} onPress={() => router.push("/(auth)/login")} activeOpacity={0.7}>
          <Text style={styles.signInButtonText}>Sign In Instead</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );

  // Mobile signup form
  const renderSignupForm = () => (
    <View style={styles.signupFormContainer}>
      <Animated.View
        style={[
          styles.signupHeader,
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
        <Text style={styles.signupTitle}>Create Account</Text>
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
            <FontAwesome name="user" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
          </View>

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

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.termsText}>By signing up, you agree to our Terms of Service and Privacy Policy</Text>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={isLoading} activeOpacity={0.9}>
            <LinearGradient colors={[BudgetColors.needs, "#2A9E5C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.signupButtonText}>Create Account</Text>}
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
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
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
          <LinearGradient colors={["#FFFFFF", "#FFFFFF"]} style={styles.desktopLogoContainer}>
            <Image source={require("../../assets/images/wally_logo.png")} style={styles.logoImage} />
          </LinearGradient>
          <Text style={styles.appName}>Join Wally</Text>
          <Text style={styles.tagline}>Create an account to start tracking your expenses easily</Text>
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
          <Text style={styles.desktopSignupTitle}>Create Account</Text>
          <Text style={styles.desktopSignupSubtitle}>Fill in your details to get started</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
          </View>

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

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color={BudgetColors.needs} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999"
            />
          </View>

          <Text style={styles.termsText}>By signing up, you agree to our Terms of Service and Privacy Policy</Text>

          <TouchableOpacity style={styles.desktopSignupButton} onPress={handleSignup} disabled={isLoading} activeOpacity={0.9}>
            <LinearGradient colors={[BudgetColors.needs, "#2A9E5C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.signupButtonText}>Create Account</Text>}
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
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.desktopSignInContainer}>
            <Text style={styles.haveAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {Platform.OS === "web" || width > 768 ? renderDesktopLayout() : currentPage === 0 ? renderWelcomeScreen() : renderSignupForm()}
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
  desktopSignupTitle: {
    fontSize: scaleFontSize(28),
    fontWeight: "700",
    color: "#333",
    marginBottom: responsiveMargin(8),
    letterSpacing: 0.5,
  },
  desktopSignupSubtitle: {
    fontSize: scaleFontSize(16),
    color: "#666",
    marginBottom: responsiveMargin(32),
  },
  desktopSignupButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: responsiveMargin(16),
    elevation: 4,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  desktopSignInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: responsiveMargin(24),
  },
  haveAccountText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  signInLink: {
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

  // Mobile signup form styles
  signupFormContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  signupHeader: {
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
  signupTitle: {
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
  termsText: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(24),
    lineHeight: 20,
    textAlign: "center",
  },
  signupButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: responsiveMargin(16),
    elevation: 4,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  signupButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  signInButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: responsivePadding(16),
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInButtonText: {
    color: BudgetColors.needs,
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  createAccountButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: responsiveMargin(16),
    elevation: 4,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  createAccountButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
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
});
