import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../app/constants/Colors";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../app/utils/responsive";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Rule item animations
  const rule1Anim = useRef(new Animated.Value(0)).current;
  const rule2Anim = useRef(new Animated.Value(0)).current;
  const rule3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main content animation
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

    // Staggered rule items animation
    Animated.stagger(200, [
      Animated.timing(rule1Anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rule2Anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(rule3Anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.appTitle}>Budget Wally</Text>
          <Text style={styles.appTagline}>Smart budgeting made simple</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={["#F8F9FA", "#E8F5FF"]} style={styles.illustrationBackground}>
            <Text style={styles.illustrationIcon}>💵</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome to the 50-30-20 Budget Rule</Text>

          <Text style={styles.description}>The 50-30-20 rule is a simple budgeting method that helps you manage your money effectively:</Text>

          <View style={styles.ruleSection}>
            <Animated.View
              style={[
                styles.ruleItem,
                {
                  backgroundColor: BudgetColors.needs + "15",
                  opacity: rule1Anim,
                  transform: [
                    {
                      translateX: rule1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient colors={["#5BD990", "#3DB26E"]} style={styles.ruleIconContainer}>
                <Text style={styles.ruleIcon}>50%</Text>
              </LinearGradient>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Needs</Text>
                <Text style={styles.ruleDescription}>Essential expenses like housing, groceries, utilities, transportation, and insurance.</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.ruleItem,
                {
                  backgroundColor: BudgetColors.savings + "15",
                  opacity: rule2Anim,
                  transform: [
                    {
                      translateX: rule2Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient colors={["#FFBA6E", "#FF9C36"]} style={styles.ruleIconContainer}>
                <Text style={styles.ruleIcon}>30%</Text>
              </LinearGradient>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Savings</Text>
                <Text style={styles.ruleDescription}>Money for your future: emergency fund, retirement, debt payments, and investments.</Text>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.ruleItem,
                {
                  backgroundColor: BudgetColors.wants + "15",
                  opacity: rule3Anim,
                  transform: [
                    {
                      translateX: rule3Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient colors={["#837BFF", "#605BFF"]} style={styles.ruleIconContainer}>
                <Text style={styles.ruleIcon}>20%</Text>
              </LinearGradient>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Wants</Text>
                <Text style={styles.ruleDescription}>Non-essentials that improve your life: dining out, entertainment, travel, and hobbies.</Text>
              </View>
            </Animated.View>
          </View>

          <Text style={styles.customizeText}>Don&apos;t worry! You can customize these percentages and categories to fit your needs.</Text>
        </Animated.View>
      </ScrollView>

      <Animated.View
        style={[
          styles.buttonContainer,
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
        <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted} activeOpacity={0.85}>
          <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
    padding: responsivePadding(24),
  },
  headerSection: {
    alignItems: "center",
    marginTop: responsiveMargin(40),
    marginBottom: responsiveMargin(20),
  },
  appTitle: {
    fontSize: scaleFontSize(32),
    fontWeight: "bold",
    color: "#333",
    marginBottom: responsiveMargin(8),
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: scaleFontSize(16),
    color: "#666",
    letterSpacing: 0.2,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: responsiveMargin(40),
  },
  illustrationBackground: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  illustrationIcon: {
    fontSize: scaleFontSize(48),
  },
  contentSection: {
    marginBottom: responsiveMargin(30),
  },
  welcomeTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    color: "#333",
    marginBottom: responsiveMargin(16),
    textAlign: "center",
    letterSpacing: 0.3,
  },
  description: {
    fontSize: scaleFontSize(16),
    color: "#555",
    marginBottom: responsiveMargin(24),
    lineHeight: 24,
  },
  ruleSection: {
    marginBottom: responsiveMargin(24),
  },
  ruleItem: {
    flexDirection: "row",
    borderRadius: 16,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(16),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ruleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(16),
  },
  ruleIcon: {
    color: "white",
    fontSize: scaleFontSize(16),
    fontWeight: "bold",
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(4),
    color: "#333",
  },
  ruleDescription: {
    fontSize: scaleFontSize(14),
    color: "#555",
    lineHeight: 20,
  },
  customizeText: {
    fontSize: scaleFontSize(14),
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
  },
  buttonContainer: {
    padding: responsivePadding(24),
    paddingBottom: responsivePadding(30),
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: responsivePadding(16),
    alignItems: "center",
    borderRadius: 16,
  },
  getStartedText: {
    color: "white",
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
