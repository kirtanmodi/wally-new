import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import OnboardingStep from "../../components/OnboardingStep";
import { scaleFontSize, responsivePadding } from "../utils/responsive";
import {
  selectBudgetRule,
  selectCurrency,
  selectMonthlyIncome,
  updateBudgetRule,
} from "../../redux/slices/budgetSlice";
import { formatCurrency } from "../utils/currency";

export default function OnboardingStep3() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const currentBudgetRule = useSelector(selectBudgetRule);
  const currency = useSelector(selectCurrency);
  
  const [budgetRule, setBudgetRule] = useState(currentBudgetRule);

  const handleNext = () => {
    dispatch(updateBudgetRule(budgetRule));
    router.push("/(onboarding)/step4");
  };

  const handleBack = () => {
    router.back();
  };

  const updateBudgetValue = (type: 'needs' | 'savings' | 'wants', increment: boolean) => {
    const step = 5;
    const change = increment ? step : -step;
    const currentValue = budgetRule[type];
    const newValue = Math.max(0, Math.min(100, currentValue + change));
    
    if (newValue !== currentValue) {
      const newRule = { ...budgetRule };
      newRule[type] = newValue;
      
      // Adjust other values to maintain total of 100
      const difference = newValue - currentValue;
      const remaining = 100 - newValue;
      
      if (type === 'needs') {
        const othersTotal = budgetRule.savings + budgetRule.wants;
        if (othersTotal > 0 && remaining >= 0) {
          newRule.savings = Math.max(0, Math.round(budgetRule.savings - (budgetRule.savings / othersTotal) * difference));
          newRule.wants = 100 - newValue - newRule.savings;
        }
      } else if (type === 'savings') {
        const othersTotal = budgetRule.needs + budgetRule.wants;
        if (othersTotal > 0 && remaining >= 0) {
          newRule.needs = Math.max(0, Math.round(budgetRule.needs - (budgetRule.needs / othersTotal) * difference));
          newRule.wants = 100 - newValue - newRule.needs;
        }
      } else {
        const othersTotal = budgetRule.needs + budgetRule.savings;
        if (othersTotal > 0 && remaining >= 0) {
          newRule.needs = Math.max(0, Math.round(budgetRule.needs - (budgetRule.needs / othersTotal) * difference));
          newRule.savings = 100 - newValue - newRule.needs;
        }
      }
      
      setBudgetRule(newRule);
    }
  };

  const resetToDefault = () => {
    setBudgetRule({ needs: 50, savings: 30, wants: 20 });
  };

  const renderBudgetItem = (
    title: string,
    percentage: number,
    amount: number,
    color: string,
    description: string,
    type: 'needs' | 'savings' | 'wants'
  ) => (
    <View style={styles.budgetItem}>
      <View style={styles.budgetItemHeader}>
        <View style={styles.budgetItemLeft}>
          <View style={[styles.budgetItemIcon, { backgroundColor: color }]} />
          <View>
            <Text style={styles.budgetItemTitle}>{title}</Text>
            <Text style={styles.budgetItemDescription}>{description}</Text>
          </View>
        </View>
        <View style={styles.budgetItemRight}>
          <Text style={styles.budgetItemPercentage}>{percentage}%</Text>
          <Text style={styles.budgetItemAmount}>
            {formatCurrency(amount, currency.code, false)}
          </Text>
        </View>
      </View>
      
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <View style={styles.sliderControls}>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => updateBudgetValue(type, false)}
            activeOpacity={0.7}
          >
            <Text style={styles.sliderButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sliderButton}
            onPress={() => updateBudgetValue(type, true)}
            activeOpacity={0.7}
          >
            <Text style={styles.sliderButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const needsAmount = (monthlyIncome * budgetRule.needs) / 100;
  const savingsAmount = (monthlyIncome * budgetRule.savings) / 100;
  const wantsAmount = (monthlyIncome * budgetRule.wants) / 100;

  const isValidBudget = budgetRule.needs + budgetRule.savings + budgetRule.wants === 100;

  return (
    <OnboardingStep
      title="Customize Your Budget"
      subtitle="Adjust the 50/30/20 rule to fit your lifestyle"
      currentStep={3}
      totalSteps={5}
      onNext={handleNext}
      onBack={handleBack}
      nextButtonText="Continue"
      nextButtonDisabled={!isValidBudget}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.incomeDisplay}>
          <Text style={styles.incomeLabel}>Monthly Income</Text>
          <Text style={styles.incomeAmount}>
            {formatCurrency(monthlyIncome, currency.code, false)}
          </Text>
        </View>

        <View style={styles.budgetSection}>
          <Text style={styles.budgetTitle}>Budget Allocation</Text>
          <Text style={styles.budgetSubtitle}>
            Drag the sliders to adjust your budget percentages
          </Text>

          <View style={styles.budgetItems}>
            {renderBudgetItem(
              "Needs",
              budgetRule.needs,
              needsAmount,
              "#FF6B6B",
              "Essential expenses",
              "needs"
            )}

            {renderBudgetItem(
              "Savings",
              budgetRule.savings,
              savingsAmount,
              "#45B7D1",
              "Emergency fund & investments",
              "savings"
            )}

            {renderBudgetItem(
              "Wants",
              budgetRule.wants,
              wantsAmount,
              "#4ECDC4",
              "Entertainment & lifestyle",
              "wants"
            )}
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetToDefault}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset to 50/30/20</Text>
          </TouchableOpacity>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Allocation</Text>
            <Text style={[
              styles.totalPercentage,
              { color: isValidBudget ? '#4ECDC4' : '#FF6B6B' }
            ]}>
              {budgetRule.needs + budgetRule.savings + budgetRule.wants}%
            </Text>
          </View>

          {!isValidBudget && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Budget allocation must equal 100%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Budget Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • Start with the 50/30/20 rule and adjust based on your situation
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • Prioritize building an emergency fund before increasing wants
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • You can always modify these percentages later in settings
            </Text>
          </View>
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
  incomeDisplay: {
    alignItems: "center",
    marginBottom: responsivePadding(30),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  incomeLabel: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
    marginBottom: 5,
  },
  incomeAmount: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  budgetSection: {
    marginBottom: responsivePadding(30),
  },
  budgetTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  budgetSubtitle: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 25,
  },
  budgetItems: {
    gap: 20,
  },
  budgetItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  budgetItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  budgetItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  budgetItemIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  budgetItemTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  budgetItemDescription: {
    fontSize: scaleFontSize(12),
    color: "#FFFFFF",
    opacity: 0.7,
  },
  budgetItemRight: {
    alignItems: "flex-end",
  },
  budgetItemPercentage: {
    fontSize: scaleFontSize(18),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  budgetItemAmount: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
  },
  sliderContainer: {
    marginTop: 10,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  sliderFill: {
    height: "100%",
    borderRadius: 4,
  },
  sliderControls: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  sliderButtonText: {
    fontSize: scaleFontSize(18),
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  resetButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  resetButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  totalLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  totalPercentage: {
    fontSize: scaleFontSize(20),
    fontWeight: "bold",
  },
  warningContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  warningText: {
    fontSize: scaleFontSize(14),
    color: "#FF6B6B",
    textAlign: "center",
    fontWeight: "500",
  },
  tipsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tipsTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
  },
});