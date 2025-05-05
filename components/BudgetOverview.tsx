import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetData } from "../app/types/budget";
import { formatCurrency } from "../app/utils/currency";
import { filterExpensesByMonth, getCurrentMonthYearKey } from "../app/utils/dateUtils";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { selectBudgetRule, selectCategoriesByType, selectCurrency, selectSavingsGoals } from "../redux/slices/budgetSlice";
import { selectExpenses } from "../redux/slices/expenseSlice";
import { RootState } from "../redux/types";

interface BudgetOverviewProps {
  monthlyIncome: number;
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
  monthlyIncome,
  onBackPress,
  onOpenSettings,
  onOpenNeedsDetail,
  onOpenWantsDetail,
  onOpenSavingsDetail,
  selectedMonth = getCurrentMonthYearKey(),
}) => {
  const budgetRule = useSelector(selectBudgetRule);
  const expenses = useSelector(selectExpenses);
  const currency = useSelector(selectCurrency);
  const needsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Needs"));
  const wantsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Wants"));
  const savingsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Savings"));
  const savingsGoals = useSelector(selectSavingsGoals);

  // Filter expenses by selected month
  const monthlyExpenses = useMemo(() => filterExpensesByMonth(expenses, selectedMonth), [expenses, selectedMonth]);

  // Calculate budget data based on income, rules, and expenses
  const budgetData = useMemo<BudgetData>(() => {
    // Calculate budget amounts
    const needsBudget = monthlyIncome * (budgetRule.needs / 100);
    const savingsBudget = monthlyIncome * (budgetRule.savings / 100);
    const wantsBudget = monthlyIncome * (budgetRule.wants / 100);

    // Calculate spend amounts from expenses
    const needsSpent = monthlyExpenses.filter((exp) => exp.category === "Needs").reduce((sum, exp) => sum + exp.amount, 0);
    const savingsSpent = monthlyExpenses.filter((exp) => exp.category === "Savings").reduce((sum, exp) => sum + exp.amount, 0);
    const wantsSpent = monthlyExpenses.filter((exp) => exp.category === "Wants").reduce((sum, exp) => sum + exp.amount, 0);

    return {
      monthlyIncome,
      needs: {
        percentage: budgetRule.needs,
        amount: needsBudget,
        spent: needsSpent,
      },
      savings: {
        percentage: budgetRule.savings,
        amount: savingsBudget,
        spent: savingsSpent,
      },
      wants: {
        percentage: budgetRule.wants,
        amount: wantsBudget,
        spent: wantsSpent,
      },
    };
  }, [monthlyIncome, budgetRule, monthlyExpenses]);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Income & Budget</Text>
        <TouchableOpacity onPress={onOpenSettings}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.incomeSection}>
          <Text style={styles.incomeLabel}>Monthly Income</Text>
          <Text style={styles.incomeAmount}>{formatCurrency(monthlyIncome, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
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
              <Text style={styles.budgetItemAmount}>
                {formatCurrency(budgetData.needs.spent, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.budgetItemTotal}>
                of {formatCurrency(budgetData.needs.amount, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
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
              <Text style={styles.budgetItemAmount}>
                {formatCurrency(budgetData.savings.spent, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.budgetItemTotal}>
                of {formatCurrency(budgetData.savings.amount, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
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
              <Text style={styles.budgetItemAmount}>
                {formatCurrency(budgetData.wants.spent, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={styles.budgetItemTotal}>
                of {formatCurrency(budgetData.wants.amount, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Budget Categories</Text>

          {needsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Needs (Essential Expenses)</Text>
              {needsCategories.map((category) => {
                const spent = monthlyExpenses.filter((exp) => exp.subcategory === category.name).reduce((total, exp) => total + exp.amount, 0);
                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(spent, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })}
            </>
          )}

          {savingsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Savings</Text>
              {savingsCategories.map((category) => {
                const spent = monthlyExpenses
                  .filter((exp) => exp.category === "Savings" && exp.subcategory === category.name)
                  .reduce((total, exp) => total + exp.amount, 0);
                const goal = savingsGoals[category.id];
                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <View style={styles.categoryInfoContainer}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {goal && (
                        <Text style={styles.categoryGoal}>
                          Goal: {formatCurrency(goal.amount, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          {goal.targetDate ? ` by ${goal.targetDate}` : ""}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(spent, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })}
            </>
          )}

          {wantsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Wants (Non-Essential)</Text>
              {wantsCategories.map((category) => {
                const spent = monthlyExpenses.filter((exp) => exp.subcategory === category.name).reduce((total, exp) => total + exp.amount, 0);
                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(spent, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
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
