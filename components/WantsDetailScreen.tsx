import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { formatCurrency } from "../app/utils/currency";
import { filterExpensesByMonth, getCurrentMonthYearKey } from "../app/utils/dateUtils";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { selectBudgetRule, selectCategoriesByType, selectCurrency, selectMonthlyIncome } from "../redux/slices/budgetSlice";
import { selectExpenses } from "../redux/slices/expenseSlice";
import { RootState } from "../redux/types";

interface WantsDetailScreenProps {
  onBackPress?: () => void;
  selectedMonth?: string;
}

const WantsDetailScreen: React.FC<WantsDetailScreenProps> = ({ onBackPress, selectedMonth = getCurrentMonthYearKey() }) => {
  const expenses = useSelector(selectExpenses) || [];
  const monthlyIncome = useSelector(selectMonthlyIncome) || 0;
  const budgetRule = useSelector(selectBudgetRule) || { needs: 50, savings: 30, wants: 20 };
  const currency = useSelector(selectCurrency) || { code: "USD", symbol: "$", name: "US Dollar" };
  const wantsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Wants")) || [];

  // Filter expenses by month
  const monthlyExpenses = useMemo(() => filterExpensesByMonth(expenses || [], selectedMonth || getCurrentMonthYearKey()), [expenses, selectedMonth]);

  // Calculate budget and spent for Wants
  const budgetData = useMemo(() => {
    const wantsBudget = (monthlyIncome || 0) * ((budgetRule?.wants || 20) / 100);
    const wantsSpent = monthlyExpenses.filter((exp) => exp.category === "Wants").reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate spending by subcategory within Wants
    const subcategorySpendings = (wantsCategories || []).map((category) => {
      const spent = monthlyExpenses
        .filter((exp) => exp.category === "Wants" && exp.subcategory === category.name)
        .reduce((sum, exp) => sum + exp.amount, 0);

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        spent,
      };
    });

    return {
      budget: wantsBudget,
      spent: wantsSpent,
      remaining: wantsBudget - wantsSpent,
      subcategories: subcategorySpendings,
    };
  }, [monthlyIncome, budgetRule, monthlyExpenses, wantsCategories, selectedMonth]);

  // Format currency amount
  const formatBudgetAmount = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  // Calculate and format percentage of total wants spending
  const getPercentage = (amount: number) => {
    if (budgetData.spent === 0) return "0%";
    return `${Math.round((amount / budgetData.spent) * 100)}%`;
  };

  // Calculate progress percentage
  const getProgress = (spent: number) => {
    if (budgetData.budget === 0) return 0;
    return Math.min(100, (spent / budgetData.budget) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wants Details</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Wants Budget Summary</Text>

          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetAmount}>{formatBudgetAmount(budgetData.budget)}</Text>
          </View>

          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={[styles.budgetAmount, budgetData.spent > budgetData.budget && styles.overBudget]}>
              {formatBudgetAmount(budgetData.spent)}
            </Text>
          </View>

          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[styles.budgetAmount, budgetData.remaining < 0 && styles.overBudget]}>{formatBudgetAmount(budgetData.remaining)}</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgress(budgetData.spent)}%` },
                  budgetData.spent > budgetData.budget && styles.progressOverBudget,
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {budgetData.spent > budgetData.budget ? "Over budget" : `${Math.round(getProgress(budgetData.spent))}% of budget used`}
            </Text>
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Spending By Category</Text>

          {budgetData.subcategories.length === 0 ? (
            <Text style={styles.noDataText}>No spending data available</Text>
          ) : (
            budgetData.subcategories.map((subcategory) => (
              <View key={subcategory.id} style={styles.categoryItem}>
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryIcon}>{subcategory.icon}</Text>
                </View>
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{subcategory.name}</Text>
                  <View style={styles.categoryProgressContainer}>
                    <View style={styles.categoryProgressBar}>
                      <View style={[styles.categoryProgressFill, { width: `${getProgress(subcategory.spent)}%` }]} />
                    </View>
                  </View>
                </View>
                <View style={styles.categoryAmountContainer}>
                  <Text style={styles.categoryAmount}>{formatBudgetAmount(subcategory.spent)}</Text>
                  <Text style={styles.categoryPercentage}>{getPercentage(subcategory.spent)}</Text>
                </View>
              </View>
            ))
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: responsivePadding(16),
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  backButton: {
    padding: responsivePadding(8),
  },
  backButtonText: {
    fontSize: scaleFontSize(22),
    color: "#333",
  },
  headerTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  placeholderRight: {
    width: 30,
  },
  scrollView: {
    flex: 1,
    padding: responsivePadding(16),
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(16),
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveMargin(12),
  },
  budgetLabel: {
    fontSize: scaleFontSize(16),
    color: "#555",
  },
  budgetAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  overBudget: {
    color: "#E74C3C",
  },
  progressContainer: {
    marginTop: responsiveMargin(16),
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BudgetColors.wants,
    borderRadius: 4,
  },
  progressOverBudget: {
    backgroundColor: "#E74C3C",
  },
  progressText: {
    fontSize: scaleFontSize(12),
    color: "#777",
    marginTop: responsiveMargin(4),
    textAlign: "right",
  },
  categorySection: {
    marginBottom: responsiveMargin(40),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(16),
  },
  noDataText: {
    fontSize: scaleFontSize(16),
    color: "#888",
    textAlign: "center",
    padding: responsivePadding(20),
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: responsivePadding(12),
    marginBottom: responsiveMargin(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${BudgetColors.wants}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  categoryIcon: {
    fontSize: scaleFontSize(16),
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
    marginBottom: responsiveMargin(6),
  },
  categoryProgressContainer: {
    width: "100%",
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    backgroundColor: BudgetColors.wants,
    borderRadius: 2,
  },
  categoryAmountContainer: {
    alignItems: "flex-end",
    marginLeft: responsiveMargin(8),
  },
  categoryAmount: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#333",
  },
  categoryPercentage: {
    fontSize: scaleFontSize(12),
    color: "#777",
    marginTop: responsiveMargin(2),
  },
});

export default WantsDetailScreen;
