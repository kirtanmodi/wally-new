import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Alert, Animated, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scaleFontSize } from "../utils/responsive";

export default function SignupScreen() {
  const router = useRouter();
  const { isLoaded, setActive } = useSignUp();
  const { startSSOFlow: startGoogleOAuthFlow } = useSSO();
  const { startSSOFlow: startAppleOAuthFlow } = useSSO();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    try {
      const { createdSessionId } = await startGoogleOAuthFlow({ strategy: "oauth_google" });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/welcome");
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert("Google Sign In Error", "There was a problem signing in with Google.");
    }
  };

  const handleAppleSignIn = async () => {
    if (!isLoaded) return;

    try {
      const { createdSessionId } = await startAppleOAuthFlow({ strategy: "oauth_apple" });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/welcome");
      }
    } catch (error) {
      console.error("Apple sign in error:", error);
      Alert.alert("Apple Sign In Error", "There was a problem signing in with Apple.");
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

          <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn} activeOpacity={0.7}>
            <FontAwesome name="google" size={20} color="#FFFFFF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn} activeOpacity={0.7}>
            <FontAwesome name="apple" size={20} color="#FFFFFF" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.haveAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 24,
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
