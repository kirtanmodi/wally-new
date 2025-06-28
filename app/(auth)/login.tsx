import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { login, setIsAuthenticated } from "../../redux/slices/userSlice";
import COLORS from "../constants/Colors";

const { width, height } = Dimensions.get("window");

// Emotional Avatar Component
const EmotionalAvatar = ({ size = 120 }: { size?: number }) => {
  return (
    <View style={[styles.avatar, { width: size, height: size }]}>
      <LinearGradient
        colors={COLORS.gradients.pinkBlue}
        style={[styles.avatarGradient, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.avatarExpression, { fontSize: size * 0.4 }]}>
          😊
        </Text>
      </LinearGradient>
    </View>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.neutral.white} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Header with Avatar */}
        <View style={styles.header}>
          <EmotionalAvatar size={120} />
          <Text style={styles.welcomeTitle}>Welcome to Wally</Text>
          <Text style={styles.welcomeSubtitle}>Your wellness-focused finance companion</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color={COLORS.neutral.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.neutral.darkGray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color={COLORS.neutral.darkGray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.neutral.darkGray}
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
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradients.pinkBlue}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.neutral.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
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
            activeOpacity={0.8}
          >
            <FontAwesome name="user" size={20} color={COLORS.primary.blue} style={styles.demoIcon} />
            <Text style={styles.demoButtonText}>Try Demo Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.signupLink}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text style={styles.signupLinkText}>
              Don't have an account? <Text style={styles.signupLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: height * 0.08,
    paddingBottom: 48,
  },
  avatar: {
    marginBottom: 32,
  },
  avatarGradient: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarExpression: {
    color: COLORS.neutral.white,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.neutral.black,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.neutral.darkGray,
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral.black,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: COLORS.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    color: COLORS.neutral.darkGray,
    fontSize: 14,
    marginHorizontal: 16,
  },
  demoButton: {
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  demoIcon: {
    marginRight: 12,
  },
  demoButtonText: {
    color: COLORS.primary.blue,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingBottom: 32,
    alignItems: "center",
  },
  signupLink: {
    paddingVertical: 16,
  },
  signupLinkText: {
    fontSize: 14,
    color: COLORS.neutral.darkGray,
    textAlign: "center",
  },
  signupLinkBold: {
    fontWeight: "600",
    color: COLORS.primary.blue,
  },
});