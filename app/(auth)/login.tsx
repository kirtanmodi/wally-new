import { useSignIn, useSSO, useUser } from "@clerk/clerk-expo";
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
import { login, oauthLogin, setIsAuthenticated } from "../../redux/slices/userSlice";
import { scaleFontSize } from "../utils/responsive";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow: startGoogleOAuthFlow } = useSSO();
  const { startSSOFlow: startAppleOAuthFlow } = useSSO();
  const { user } = useUser();
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

  const saveUserToRedux = async (userId: string, authProvider = "email") => {
    if (!user || !userId) return;

    try {
      const emailAddress = user.emailAddresses?.[0]?.emailAddress || "";
      const username = user.username || emailAddress.split("@")[0] || "";

      // Get token with appropriate fallbacks
      let token = "";
      try {
        // @ts-ignore - getToken exists but type definition may be missing
        token = await user.getToken();
      } catch (error) {
        console.log("Error getting token", error);
      }

      const userData = {
        userId,
        username,
        email: emailAddress,
        token,
      };

      if (authProvider === "email") {
        dispatch(login(userData));
      } else if (authProvider === "google" || authProvider === "apple") {
        dispatch(
          oauthLogin({
            ...userData,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            avatar: user.imageUrl || "",
            provider: authProvider as "google" | "apple",
          })
        );
      }
    } catch (error) {
      console.error("Error saving user to Redux:", error);
    }
  };

  const handleLogin = async () => {
    if (!isLoaded) return;

    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      // Start the sign-in process using the email and password provided
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      if (signInAttempt.status === "complete") {
        dispatch(setIsAuthenticated(true));
        console.log("signInAttempt.createdSessionId", signInAttempt.createdSessionId);
        await setActive({ session: signInAttempt.createdSessionId });

        // Save user details to Redux
        // @ts-ignore - userId may exist but type definition is missing
        const userId = signInAttempt.userId || user?.id || "";
        await saveUserToRedux(userId);

        // router.replace("/(tabs)");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error("Sign in not complete:", signInAttempt);
        Alert.alert("Login Failed", "There was a problem signing in. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Login Error", "There was a problem logging in. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      const result = await startGoogleOAuthFlow({ strategy: "oauth_google" });
      const { createdSessionId } = result;

      if (createdSessionId) {
        dispatch(setIsAuthenticated(true));
        console.log("createdSessionId google", createdSessionId);
        await setActive({ session: createdSessionId });

        // Save user details to Redux
        // @ts-ignore - firstFactorVerification may exist but type definition is missing
        const userId = result.firstFactorVerification?.userId || user?.id || "";
        await saveUserToRedux(userId, "google");

        // router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Google Sign In Error", "There was a problem signing in with Google.");
    }
  };

  const handleAppleSignIn = async () => {
    if (!isLoaded) return;

    try {
      const result = await startAppleOAuthFlow({ strategy: "oauth_apple" });
      const { createdSessionId } = result;

      if (createdSessionId) {
        dispatch(setIsAuthenticated(true));
        console.log("createdSessionId apple", createdSessionId);
        await setActive({ session: createdSessionId });

        // Save user details to Redux
        // @ts-ignore - firstFactorVerification may exist but type definition is missing
        const userId = result.firstFactorVerification?.userId || user?.id || "";
        await saveUserToRedux(userId, "apple");

        // router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Apple sign in error:", error);
      Alert.alert("Apple Sign In Error", "There was a problem signing in with Apple.");
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

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn} activeOpacity={0.7}>
            <FontAwesome name="google" size={20} color="#FFFFFF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn} activeOpacity={0.7}>
            <FontAwesome name="apple" size={20} color="#FFFFFF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
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
  socialButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
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
