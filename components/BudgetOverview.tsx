import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetData } from "../app/types/budget";
import { formatCurrency } from "../app/utils/currency";
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
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  monthlyIncome = 0,
  onBackPress,
  onOpenSettings,
  onOpenNeedsDetail,
  onOpenWantsDetail,
  onOpenSavingsDetail,
}) => {
  const budgetRule = useSelector(selectBudgetRule);

  // Create memoized selector functions for each category type
  const selectNeeds = useCallback((state: RootState) => selectCategoriesByType(state, "Needs"), []);
  const selectSavings = useCallback((state: RootState) => selectCategoriesByType(state, "Savings"), []);
  const selectWants = useCallback((state: RootState) => selectCategoriesByType(state, "Wants"), []);

  // Use the memoized selector functions
  const needsCategories = useSelector(selectNeeds);
  const savingsCategories = useSelector(selectSavings);
  const wantsCategories = useSelector(selectWants);

  const expenses = useSelector(selectExpenses);
  const currency = useSelector(selectCurrency);
  const savingsGoals = useSelector(selectSavingsGoals);

  // Memoize the spent calculations to avoid recalculation on every render
  const { needsSpent, savingsSpent, wantsSpent, calculateSpentBySubcategory } = useMemo(() => {
    // Calculate spending by subcategory - memoized
    const calculateSpentBySubcategory = (subcategory: string) => {
      return expenses.filter((expense) => expense.subcategory === subcategory).reduce((total, expense) => total + expense.amount, 0);
    };

    // Calculate total spent by budget category - memoized
    const needsSpent = expenses.filter((expense) => expense.category === "Needs").reduce((total, expense) => total + expense.amount, 0);

    const savingsSpent = expenses.filter((expense) => expense.category === "Savings").reduce((total, expense) => total + expense.amount, 0);

    const wantsSpent = expenses.filter((expense) => expense.category === "Wants").reduce((total, expense) => total + expense.amount, 0);

    return { needsSpent, savingsSpent, wantsSpent, calculateSpentBySubcategory };
  }, [expenses]);

  // Calculate budget amounts based on the user's budget rule
  const budgetData: BudgetData = useMemo(
    () => ({
      monthlyIncome,
      needs: {
        percentage: budgetRule.needs,
        amount: monthlyIncome * (budgetRule.needs / 100),
        spent: needsSpent,
      },
      savings: {
        percentage: budgetRule.savings,
        amount: monthlyIncome * (budgetRule.savings / 100),
        spent: savingsSpent,
      },
      wants: {
        percentage: budgetRule.wants,
        amount: monthlyIncome * (budgetRule.wants / 100),
        spent: wantsSpent,
      },
    }),
    [monthlyIncome, budgetRule, needsSpent, savingsSpent, wantsSpent]
  );

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
                const spent = calculateSpentBySubcategory(category.name);
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
                const spent = calculateSpentBySubcategory(category.name);
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
                const spent = calculateSpentBySubcategory(category.name);
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
    borderBottomColor: "#EAEAEA",
  },
  backButton: {
    fontSize: scaleFontSize(24),
    color: "#333",
    width: 24,
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#333",
  },
  settingsButton: {
    fontSize: scaleFontSize(20),
    color: "#333",
    width: 24,
    textAlign: "right",
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
