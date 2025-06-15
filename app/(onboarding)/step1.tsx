import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import OnboardingStep from "../../components/OnboardingStep";
import { scaleFontSize, responsivePadding } from "../utils/responsive";

export default function OnboardingStep1() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/(onboarding)/step2");
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const features = [
    {
      icon: "📱",
      title: "Easy Expense Tracking",
      description: "Quickly log your daily expenses with just a few taps",
    },
    {
      icon: "📊",
      title: "Smart Budget Planning",
      description: "Follow the proven 50/30/20 rule for optimal financial health",
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      description: "Set and track your savings goals to achieve your dreams",
    },
    {
      icon: "📈",
      title: "Financial Analytics",
      description: "Understand your spending patterns with detailed insights",
    },
  ];

  const renderFeature = (feature: any, index: number) => (
    <View key={index} style={styles.featureItem}>
      <Text style={styles.featureIcon}>{feature.icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  return (
    <OnboardingStep
      title="Welcome to Wally"
      subtitle="Your smart AI assistant for personal finance"
      currentStep={1}
      totalSteps={5}
      onNext={handleNext}
      showBackButton={false}
      showSkipButton={true}
      onSkip={handleSkip}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/wally_logo.png")}
              style={styles.logo}
            />
          </View>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.welcomeText}>
            Take control of your finances with smart budgeting and expense tracking
          </Text>
        </View>

        <View style={styles.budgetRuleSection}>
          <Text style={styles.budgetRuleTitle}>The 50/30/20 Rule</Text>
          <Text style={styles.budgetRuleDescription}>
            A simple yet effective way to manage your money:
          </Text>
          
          <View style={styles.budgetRuleItems}>
            <View style={styles.budgetRuleItem}>
              <View style={[styles.budgetRuleIcon, { backgroundColor: "#FF6B6B" }]}>
                <Text style={styles.budgetRulePercentage}>50%</Text>
              </View>
              <View style={styles.budgetRuleTextContainer}>
                <Text style={styles.budgetRuleItemTitle}>Needs</Text>
                <Text style={styles.budgetRuleItemDescription}>
                  Essential expenses like rent, groceries, utilities
                </Text>
              </View>
            </View>

            <View style={styles.budgetRuleItem}>
              <View style={[styles.budgetRuleIcon, { backgroundColor: "#4ECDC4" }]}>
                <Text style={styles.budgetRulePercentage}>30%</Text>
              </View>
              <View style={styles.budgetRuleTextContainer}>
                <Text style={styles.budgetRuleItemTitle}>Wants</Text>
                <Text style={styles.budgetRuleItemDescription}>
                  Entertainment, dining out, hobbies, shopping
                </Text>
              </View>
            </View>

            <View style={styles.budgetRuleItem}>
              <View style={[styles.budgetRuleIcon, { backgroundColor: "#45B7D1" }]}>
                <Text style={styles.budgetRulePercentage}>20%</Text>
              </View>
              <View style={styles.budgetRuleTextContainer}>
                <Text style={styles.budgetRuleItemTitle}>Savings</Text>
                <Text style={styles.budgetRuleItemDescription}>
                  Emergency fund, investments, future goals
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What you&apos;ll get:</Text>
          {features.map(renderFeature)}
        </View>
      </ScrollView>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: responsivePadding(30),
  },
  logoWrapper: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  introSection: {
    marginBottom: responsivePadding(30),
  },
  welcomeText: {
    fontSize: scaleFontSize(18),
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 26,
    opacity: 0.95,
  },
  budgetRuleSection: {
    marginBottom: responsivePadding(30),
  },
  budgetRuleTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  budgetRuleDescription: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 20,
  },
  budgetRuleItems: {
    gap: 15,
  },
  budgetRuleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  budgetRuleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  budgetRulePercentage: {
    fontSize: scaleFontSize(14),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  budgetRuleTextContainer: {
    flex: 1,
  },
  budgetRuleItemTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  budgetRuleItemDescription: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 18,
  },
  featuresSection: {
    marginTop: 10,
  },
  featuresTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  featureIcon: {
    fontSize: scaleFontSize(24),
    marginRight: 15,
    width: 30,
    textAlign: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 18,
  },
});