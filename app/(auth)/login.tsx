import { useSSO, useUser } from "@clerk/clerk-expo";
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
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { login, oauthLogin, setIsAuthenticated } from "../../redux/slices/userSlice";
import { scaleFontSize } from "../utils/responsive";

export default function LoginScreen() {
  const router = useRouter();
  const { startSSOFlow: startGoogleOAuthFlow } = useSSO();
  const { user } = useUser();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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


  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const result = await startGoogleOAuthFlow({ strategy: "oauth_google" });
      const { createdSessionId } = result;

      if (createdSessionId) {
        dispatch(setIsAuthenticated(true));
        console.log("createdSessionId google", createdSessionId);
        // await setActive({ session: createdSessionId });

        // Save user details to Redux
        // @ts-ignore - firstFactorVerification may exist but type definition is missing
        const userId = result.firstFactorVerification?.userId || user?.id || "";
        await saveUserToRedux(userId, "google");

        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Google Sign In Error", "There was a problem signing in with Google.");
    } finally {
      setIsLoading(false);
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

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={isLoading} activeOpacity={0.9}>
            {isLoading ? (
              <ActivityIndicator color="#4C7ED9" size="small" />
            ) : (
              <>
                <FontAwesome name="google" size={20} color="#4C7ED9" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>
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
    marginBottom: 48,
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
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: "#4C7ED9",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
