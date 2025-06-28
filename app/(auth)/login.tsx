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
import { login, setIsAuthenticated } from "../../redux/slices/userSlice";
import { scaleFontSize } from "../utils/responsive";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user data
      const userData = {
        userId: Date.now().toString(),
        username: email.split("@")[0],
        email: email,
        token: "demo_token_" + Date.now(),
      };

      dispatch(login(userData));
      dispatch(setIsAuthenticated(true));
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Error", "There was a problem signing in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    
    try {
      // Demo user data
      const userData = {
        userId: "demo_user_123",
        username: "demo_user",
        email: "demo@wally.app",
        token: "demo_token_123",
      };

      dispatch(login(userData));
      dispatch(setIsAuthenticated(true));
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Demo login error:", error);
      Alert.alert("Login Error", "There was a problem with demo login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
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

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin} 
              disabled={isLoading} 
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#4C7ED9" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.demoButton} 
              onPress={handleDemoLogin} 
              disabled={isLoading} 
              activeOpacity={0.9}
            >
              <FontAwesome name="user" size={20} color="#4C7ED9" style={styles.demoIcon} />
              <Text style={styles.demoButtonText}>Try Demo Account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupLink}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text style={styles.signupLinkText}>
                Don't have an account? <Text style={styles.signupLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
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
  loginButton: {
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
  loginButtonText: {
    color: "#4C7ED9",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  dividerText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(14),
    marginHorizontal: 16,
    opacity: 0.8,
  },
  demoButton: {
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
  demoIcon: {
    marginRight: 12,
    color: "#FFFFFF",
  },
  demoButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  signupLink: {
    alignItems: "center",
    marginTop: 16,
  },
  signupLinkText: {
    fontSize: scaleFontSize(14),
    color: "rgba(255, 255, 255, 0.8)",
  },
  signupLinkBold: {
    fontWeight: "600",
    color: "#FFFFFF",
  },
});