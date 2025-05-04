import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../app/constants/Colors";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../app/utils/responsive";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.appTitle}>Budget Wally</Text>
          <Text style={styles.appTagline}>Smart budgeting made simple</Text>
        </View>

        <View style={styles.illustrationContainer}>
          {/* Replace with actual image if available */}
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationIcon}>💵</Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.welcomeTitle}>Welcome to the 50-30-20 Budget Rule</Text>

          <Text style={styles.description}>The 50-30-20 rule is a simple budgeting method that helps you manage your money effectively:</Text>

          <View style={styles.ruleSection}>
            <View style={[styles.ruleItem, { backgroundColor: BudgetColors.needs + "15" }]}>
              <View style={[styles.ruleIconContainer, { backgroundColor: BudgetColors.needs }]}>
                <Text style={styles.ruleIcon}>50%</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Needs</Text>
                <Text style={styles.ruleDescription}>Essential expenses like housing, groceries, utilities, transportation, and insurance.</Text>
              </View>
            </View>

            <View style={[styles.ruleItem, { backgroundColor: BudgetColors.savings + "15" }]}>
              <View style={[styles.ruleIconContainer, { backgroundColor: BudgetColors.savings }]}>
                <Text style={styles.ruleIcon}>30%</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Savings</Text>
                <Text style={styles.ruleDescription}>Money for your future: emergency fund, retirement, debt payments, and investments.</Text>
              </View>
            </View>

            <View style={[styles.ruleItem, { backgroundColor: BudgetColors.wants + "15" }]}>
              <View style={[styles.ruleIconContainer, { backgroundColor: BudgetColors.wants }]}>
                <Text style={styles.ruleIcon}>20%</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleTitle}>Wants</Text>
                <Text style={styles.ruleDescription}>Non-essentials that improve your life: dining out, entertainment, travel, and hobbies.</Text>
              </View>
            </View>
          </View>

          <Text style={styles.customizeText}>Don&apos;t worry! You can customize these percentages and categories to fit your needs.</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
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
    padding: responsivePadding(20),
  },
  headerSection: {
    alignItems: "center",
    marginTop: responsiveMargin(40),
    marginBottom: responsiveMargin(30),
  },
  appTitle: {
    fontSize: scaleFontSize(32),
    fontWeight: "bold",
    color: "#333",
    marginBottom: responsiveMargin(8),
  },
  appTagline: {
    fontSize: scaleFontSize(16),
    color: "#666",
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: responsiveMargin(40),
  },
  illustrationPlaceholder: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    backgroundColor: BudgetColors.needs + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  illustrationIcon: {
    fontSize: scaleFontSize(48),
  },
  contentSection: {
    marginBottom: responsiveMargin(40),
  },
  welcomeTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    color: "#333",
    marginBottom: responsiveMargin(16),
    textAlign: "center",
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
    borderRadius: 12,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(12),
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
    color: "#555",
    textAlign: "center",
    fontStyle: "italic",
  },
  buttonContainer: {
    padding: responsivePadding(20),
    paddingBottom: responsivePadding(30),
  },
  getStartedButton: {
    backgroundColor: BudgetColors.needs,
    borderRadius: 12,
    paddingVertical: responsivePadding(16),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedText: {
    color: "white",
    fontSize: scaleFontSize(18),
    fontWeight: "600",
  },
});

export default WelcomeScreen;
