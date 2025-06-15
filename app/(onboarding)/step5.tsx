import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import OnboardingStep from "../../components/OnboardingStep";
import { scaleFontSize, responsivePadding } from "../utils/responsive";
import {
  selectBudgetRule,
  selectCurrency,
  selectMonthlyIncome,
  selectCategories,
} from "../../redux/slices/budgetSlice";
import { setUserOnboarded } from "../../redux/slices/expenseSlice";
import { formatCurrency } from "../utils/currency";

export default function OnboardingStep5() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);
  const currency = useSelector(selectCurrency);
  const categories = useSelector(selectCategories);

  const handleGetStarted = () => {
    dispatch(setUserOnboarded());
    router.replace("/(tabs)");
  };

  const handleBack = () => {
    router.back();
  };

  const needsAmount = (monthlyIncome * budgetRule.needs) / 100;
  const savingsAmount = (monthlyIncome * budgetRule.savings) / 100;
  const wantsAmount = (monthlyIncome * budgetRule.wants) / 100;

  const categoryCount = {
    needs: categories.filter(cat => cat.type === "Needs").length,
    savings: categories.filter(cat => cat.type === "Savings").length,
    wants: categories.filter(cat => cat.type === "Wants").length,
  };

  const renderBudgetSummary = () => (
    <View style={styles.summarySection}>
      <Text style={styles.summaryTitle}>Your Budget Summary</Text>
      
      <View style={styles.incomeCard}>
        <Text style={styles.incomeLabel}>Monthly Income</Text>
        <Text style={styles.incomeAmount}>
          {formatCurrency(monthlyIncome, currency.code, false)}
        </Text>
      </View>

      <View style={styles.budgetBreakdown}>
        <View style={styles.budgetItem}>
          <View style={styles.budgetItemHeader}>
            <View style={[styles.budgetIndicator, { backgroundColor: "#FF6B6B" }]} />
            <Text style={styles.budgetItemTitle}>Needs</Text>
            <Text style={styles.budgetItemPercentage}>{budgetRule.needs}%</Text>
          </View>
          <Text style={styles.budgetItemAmount}>
            {formatCurrency(needsAmount, currency.code, false)}
          </Text>
          <Text style={styles.budgetItemCategories}>
            {categoryCount.needs} categories
          </Text>
        </View>

        <View style={styles.budgetItem}>
          <View style={styles.budgetItemHeader}>
            <View style={[styles.budgetIndicator, { backgroundColor: "#45B7D1" }]} />
            <Text style={styles.budgetItemTitle}>Savings</Text>
            <Text style={styles.budgetItemPercentage}>{budgetRule.savings}%</Text>
          </View>
          <Text style={styles.budgetItemAmount}>
            {formatCurrency(savingsAmount, currency.code, false)}
          </Text>
          <Text style={styles.budgetItemCategories}>
            {categoryCount.savings} categories
          </Text>
        </View>

        <View style={styles.budgetItem}>
          <View style={styles.budgetItemHeader}>
            <View style={[styles.budgetIndicator, { backgroundColor: "#4ECDC4" }]} />
            <Text style={styles.budgetItemTitle}>Wants</Text>
            <Text style={styles.budgetItemPercentage}>{budgetRule.wants}%</Text>
          </View>
          <Text style={styles.budgetItemAmount}>
            {formatCurrency(wantsAmount, currency.code, false)}
          </Text>
          <Text style={styles.budgetItemCategories}>
            {categoryCount.wants} categories
          </Text>
        </View>
      </View>
    </View>
  );

  const renderNextSteps = () => (
    <View style={styles.nextStepsSection}>
      <Text style={styles.nextStepsTitle}>🚀 What&apos;s Next?</Text>
      
      <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Add Your First Expense</Text>
          <Text style={styles.stepDescription}>
            Start tracking by adding your first expense using the + button
          </Text>
        </View>
      </View>

      <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Monitor Your Progress</Text>
          <Text style={styles.stepDescription}>
            Check the Overview tab to see how you&apos;re doing against your budget
          </Text>
        </View>
      </View>

      <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>3</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Set Savings Goals</Text>
          <Text style={styles.stepDescription}>
            Create specific goals to save for things that matter to you
          </Text>
        </View>
      </View>

      <View style={styles.stepItem}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>4</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Review & Adjust</Text>
          <Text style={styles.stepDescription}>
            Use the Analytics tab to understand your spending patterns
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCongratulatoryMessage = () => (
    <View style={styles.congratsSection}>
      <Text style={styles.congratsEmoji}>🎉</Text>
      <Text style={styles.congratsTitle}>You&apos;re All Set!</Text>
      <Text style={styles.congratsMessage}>
        Your personalized budget is ready. Wally will help you track expenses, manage your budget, and achieve your financial goals.
      </Text>
    </View>
  );

  return (
    <OnboardingStep
      title="Setup Complete!"
      subtitle="Your budget is ready to use"
      currentStep={5}
      totalSteps={5}
      onNext={handleGetStarted}
      onBack={handleBack}
      nextButtonText="Start Using Wally"
      showBackButton={true}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCongratulatoryMessage()}
        {renderBudgetSummary()}
        {renderNextSteps()}

        <View style={styles.reminderSection}>
          <Text style={styles.reminderTitle}>💡 Remember</Text>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>
              • You can always adjust your budget and categories in Settings
            </Text>
          </View>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>
              • Consistent tracking leads to better financial habits
            </Text>
          </View>
          <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>
              • Review your progress regularly and celebrate small wins
            </Text>
          </View>
        </View>

        <View style={styles.encouragementSection}>
          <Text style={styles.encouragementText}>
            &ldquo;The best time to start managing your finances was yesterday. The second best time is now.&rdquo;
          </Text>
          <Text style={styles.encouragementSubtext}>
            Welcome to your financial journey! 🌟
          </Text>
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
  congratsSection: {
    alignItems: "center",
    marginBottom: responsivePadding(30),
  },
  congratsEmoji: {
    fontSize: scaleFontSize(48),
    marginBottom: 15,
  },
  congratsTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  congratsMessage: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  summarySection: {
    marginBottom: responsivePadding(30),
  },
  summaryTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  incomeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  incomeLabel: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 5,
  },
  incomeAmount: {
    fontSize: scaleFontSize(28),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  budgetBreakdown: {
    gap: 12,
  },
  budgetItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  budgetItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  budgetIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  budgetItemTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
  },
  budgetItemPercentage: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.8,
  },
  budgetItemAmount: {
    fontSize: scaleFontSize(18),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  budgetItemCategories: {
    fontSize: scaleFontSize(12),
    color: "#FFFFFF",
    opacity: 0.7,
  },
  nextStepsSection: {
    marginBottom: responsivePadding(25),
  },
  nextStepsTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  stepNumber: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  stepNumberText: {
    fontSize: scaleFontSize(14),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
    lineHeight: 20,
  },
  reminderSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: responsivePadding(20),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  reminderTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  reminderItem: {
    marginBottom: 8,
  },
  reminderText: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
  },
  encouragementSection: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  encouragementText: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 10,
    opacity: 0.9,
  },
  encouragementSubtext: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "500",
    opacity: 0.8,
  },
});