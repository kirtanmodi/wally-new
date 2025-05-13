import React, { useCallback, useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetData } from "../app/types/budget";
import { formatCurrency } from "../app/utils/currency";
import { filterExpensesByMonth, getCurrentMonthYearKey } from "../app/utils/dateUtils";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { selectBudgetRule, selectCategoriesByType, selectCurrency, selectDenominationFormat, selectSavingsGoals } from "../redux/slices/budgetSlice";
import { selectExpenses } from "../redux/slices/expenseSlice";
import { RootState } from "../redux/types";

interface BudgetOverviewProps {
  monthlyIncome?: number;
  onBackPress?: () => void;
  onOpenSettings?: () => void;
  onOpenNeedsDetail?: () => void;
  onOpenWantsDetail?: () => void;
  onOpenSavingsDetail?: () => void;
  selectedMonth?: string;
}

// Section Header Component
const SectionHeader: React.FC<{ title: string; subtitle?: string; onPress?: () => void }> = ({ title, subtitle, onPress }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    {onPress && (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.sectionButton}>Edit</Text>
      </TouchableOpacity>
    )}
  </View>
);

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  monthlyIncome = 0,
  onBackPress,
  onOpenSettings,
  onOpenNeedsDetail,
  onOpenWantsDetail,
  onOpenSavingsDetail,
  selectedMonth = getCurrentMonthYearKey(),
}) => {
  // Add component mount and update tracking
  useEffect(() => {
    // Return a cleanup function
    return () => {};
  }, [selectedMonth]);

  const budgetRule = useSelector(selectBudgetRule) || { needs: 50, savings: 30, wants: 20 };
  const expenses = useSelector(selectExpenses) || [];
  const currency = useSelector(selectCurrency) || { code: "USD", symbol: "$", name: "US Dollar" };
  const needsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Needs")) || [];
  const wantsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Wants")) || [];
  const savingsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Savings")) || [];
  const denominationFormat = useSelector(selectDenominationFormat) || "none";
  const savingsGoals = useSelector(selectSavingsGoals) || {};

  // Log selected month to verify it's changing

  // Filter expenses by selected month - ensure this is recalculated when month changes
  const monthlyExpenses = useMemo(() => {
    const filteredExpenses = filterExpensesByMonth(expenses || [], selectedMonth || getCurrentMonthYearKey());

    return filteredExpenses;
  }, [expenses, selectedMonth]);

  // Calculate budget data based on income, rules, and expenses
  const budgetData = useMemo<BudgetData>(() => {
    // Calculate budget amounts
    const rule = budgetRule || { needs: 50, savings: 30, wants: 20 };
    const income = monthlyIncome || 0;

    const needsBudget = income * (rule.needs / 100);
    const savingsBudget = income * (rule.savings / 100);
    const wantsBudget = income * (rule.wants / 100);

    // Calculate spend amounts from expenses for the selected month only
    const needsSpent = monthlyExpenses.filter((exp) => exp.category === "Needs").reduce((sum, exp) => sum + exp.amount, 0);
    const savingsSpent = monthlyExpenses.filter((exp) => exp.category === "Savings").reduce((sum, exp) => sum + exp.amount, 0);
    const wantsSpent = monthlyExpenses.filter((exp) => exp.category === "Wants").reduce((sum, exp) => sum + exp.amount, 0);

    return {
      monthlyIncome: income,
      needs: {
        percentage: rule.needs,
        amount: needsBudget,
        spent: needsSpent,
      },
      savings: {
        percentage: rule.savings,
        amount: savingsBudget,
        spent: savingsSpent,
      },
      wants: {
        percentage: rule.wants,
        amount: wantsBudget,
        spent: wantsSpent,
      },
    };
  }, [monthlyIncome, budgetRule, monthlyExpenses, selectedMonth]);

  // Get selected date from the selected month string for display
  const selectedDate = useMemo(() => {
    if (!selectedMonth) return new Date();

    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  // Format the month name for display
  const formattedMonthYear = useMemo(() => {
    return selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [selectedDate]);

  // Format currency to appropriate locale with 2 decimal places
  const formatBudgetAmount = useCallback(
    (amount: number) => {
      return formatCurrency(amount, currency);
    },
    [currency]
  );

  // Format percentage
  const formatPercentage = (percentage: number): string => {
    return `${Math.round(percentage)}%`;
  };

  // Calculate progress percentage
  const getProgressPercentage = (spent: number, budgeted: number): number => {
    if (budgeted === 0) return 0;
    return Math.min(100, (spent / budgeted) * 100);
  };

  // Add calculation for total savings across all months
  const calculateTotalSavingsByCategoryId = useMemo(() => {
    // Only needed for Savings categories
    return (savingsCategories || []).reduce((result, category) => {
      // Get all expenses for this savings category across all time
      const totalSaved = expenses
        .filter((expense) => expense.category === "Savings" && expense.subcategory === category.name)
        .reduce((sum, expense) => sum + expense.amount, 0);

      result[category.id] = totalSaved;
      return result;
    }, {} as Record<string, number>);
  }, [expenses, savingsCategories]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Income & Budget</Text>
        <Text style={styles.headerSubtitle}>{formattedMonthYear}</Text>
        <TouchableOpacity onPress={onOpenSettings}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.incomeSection}>
          <Text style={styles.incomeLabel}>Monthly Income</Text>
          <Text style={styles.incomeAmount}>{formatCurrency(monthlyIncome, currency, denominationFormat)}</Text>
        </View>

        <View style={styles.ruleSection}>
          <Text style={styles.ruleTitle}>Budget Rule</Text>

          <TouchableOpacity style={styles.budgetItem} onPress={onOpenNeedsDetail} disabled={!onOpenNeedsDetail}>
            <View style={styles.budgetItemLeft}>
              <Text style={styles.budgetItemLabel}>Needs ({budgetRule.needs}%)</Text>
              <View style={[styles.progressBar, { backgroundColor: BudgetColors.needs + "30" }]}>
                <View
                  style={[
                    styles.progress,
                    {
                      backgroundColor: BudgetColors.needs,
                      width: `${Math.min(100, (budgetData.needs.spent / budgetData.needs.amount) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.budgetItemRight}>
              <Text style={styles.budgetItemAmount}>{formatCurrency(budgetData.needs.spent, currency, denominationFormat)}</Text>
              <Text style={styles.budgetItemTotal}>of {formatCurrency(budgetData.needs.amount, currency, denominationFormat)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.budgetItem} onPress={onOpenSavingsDetail} disabled={!onOpenSavingsDetail}>
            <View style={styles.budgetItemLeft}>
              <Text style={styles.budgetItemLabel}>Savings ({budgetRule.savings}%)</Text>
              <View style={[styles.progressBar, { backgroundColor: BudgetColors.savings + "30" }]}>
                <View
                  style={[
                    styles.progress,
                    {
                      backgroundColor: BudgetColors.savings,
                      width: `${Math.min(100, (budgetData.savings.spent / budgetData.savings.amount) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.budgetItemRight}>
              <Text style={styles.budgetItemAmount}>{formatCurrency(budgetData.savings.spent, currency, denominationFormat)}</Text>
              <Text style={styles.budgetItemTotal}>of {formatCurrency(budgetData.savings.amount, currency, denominationFormat)}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.budgetItem} onPress={onOpenWantsDetail} disabled={!onOpenWantsDetail}>
            <View style={styles.budgetItemLeft}>
              <Text style={styles.budgetItemLabel}>Wants ({budgetRule.wants}%)</Text>
              <View style={[styles.progressBar, { backgroundColor: BudgetColors.wants + "30" }]}>
                <View
                  style={[
                    styles.progress,
                    {
                      backgroundColor: BudgetColors.wants,
                      width: `${Math.min(100, (budgetData.wants.spent / budgetData.wants.amount) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.budgetItemRight}>
              <Text style={styles.budgetItemAmount}>{formatCurrency(budgetData.wants.spent, currency, denominationFormat)}</Text>
              <Text style={styles.budgetItemTotal}>of {formatCurrency(budgetData.wants.amount, currency, denominationFormat)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Budget Categories</Text>

          {needsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Needs (Essential Expenses)</Text>
              {needsCategories.map((category) => {
                const spent = monthlyExpenses
                  .filter((exp) => exp.category === "Needs" && exp.subcategory === category.name)
                  .reduce((total, exp) => total + exp.amount, 0);

                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(spent, currency, denominationFormat)}</Text>
                  </View>
                );
              })}
            </>
          )}

          {savingsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Savings</Text>
              {savingsCategories.map((category) => {
                // Current month's spending
                const spent = monthlyExpenses
                  .filter((exp) => exp.category === "Savings" && exp.subcategory === category.name)
                  .reduce((total, exp) => total + exp.amount, 0);

                // Total spending across all months
                const totalSaved = calculateTotalSavingsByCategoryId[category.id] || 0;

                const goal = savingsGoals[category.id];
                const goalProgress = goal ? Math.min(100, (totalSaved / goal.amount) * 100) : 0;

                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <View style={styles.categoryInfoContainer}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {goal && (
                        <>
                          <Text style={styles.categoryGoal}>
                            Goal: {formatCurrency(goal.amount, currency, denominationFormat)}
                            {goal.targetDate ? ` by ${goal.targetDate}` : ""}
                          </Text>
                          {totalSaved > 0 && (
                            <Text style={styles.categoryTotalSaved}>
                              Total saved: {formatCurrency(totalSaved, currency, denominationFormat)} ({Math.round(goalProgress)}%)
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                    <Text style={styles.categoryAmount}>{formatCurrency(spent, currency, denominationFormat)}</Text>
                  </View>
                );
              })}
            </>
          )}

          {wantsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Wants (Non-Essential)</Text>
              {wantsCategories.map((category) => {
                const spent = monthlyExpenses
                  .filter((exp) => exp.category === "Wants" && exp.subcategory === category.name)
                  .reduce((total, exp) => total + exp.amount, 0);

                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>{formatCurrency(spent, currency, denominationFormat)}</Text>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
    padding: responsivePadding(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: responsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    padding: responsivePadding(8),
  },
  headerTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: scaleFontSize(14),
    color: "#888",
    marginLeft: responsiveMargin(4),
    flex: 1,
    textAlign: "center",
  },
  settingsButton: {
    padding: responsivePadding(8),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: responsiveMargin(16),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: scaleFontSize(14),
    color: "#888",
    marginLeft: responsiveMargin(8),
  },
  sectionButton: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.wants,
    fontWeight: "500",
  },
  incomeSection: {
    marginBottom: responsiveMargin(20),
  },
  incomeLabel: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: scaleFontSize(28),
    fontWeight: "bold",
    color: "#333",
  },
  ruleSection: {
    marginBottom: responsiveMargin(24),
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: responsivePadding(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  ruleTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(12),
    color: "#333",
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: responsiveMargin(12),
  },
  budgetItemLeft: {
    flex: 1,
    marginRight: responsiveMargin(10),
  },
  budgetItemRight: {
    alignItems: "flex-end",
  },
  budgetItemLabel: {
    fontSize: scaleFontSize(14),
    marginBottom: 4,
    color: "#333",
  },
  budgetItemAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
  },
  budgetItemTotal: {
    fontSize: scaleFontSize(12),
    color: "#999",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
  },
  categoriesSection: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriesTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(16),
    color: "#333",
  },
  categoryGroupTitle: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#666",
    marginTop: responsiveMargin(12),
    marginBottom: responsiveMargin(8),
    backgroundColor: "#F8F9FA",
    padding: responsivePadding(8),
    borderRadius: 4,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsivePadding(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  categoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  categoryIcon: {
    fontSize: scaleFontSize(18),
  },
  categoryName: {
    flex: 1,
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  categoryInfoContainer: {
    flex: 1,
  },
  categoryGoal: {
    fontSize: scaleFontSize(13),
    color: BudgetColors.savings,
    marginTop: 2,
  },
  categoryAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
  },
  categoryTotalSaved: {
    fontSize: scaleFontSize(12),
    color: "#006636",
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: BudgetColors.needs,
    padding: responsivePadding(16),
    borderRadius: 8,
    alignItems: "center",
    marginBottom: responsiveMargin(20),
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
});

export default BudgetOverview;
