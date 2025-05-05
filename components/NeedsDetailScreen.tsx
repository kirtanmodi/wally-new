import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { formatCurrency } from "../app/utils/currency";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { selectBudgetRule, selectCategoriesByType, selectCurrency, selectMonthlyIncome } from "../redux/slices/budgetSlice";
import { selectExpenses } from "../redux/slices/expenseSlice";

interface NeedsDetailScreenProps {
  onBackPress?: () => void;
}

const NeedsDetailScreen: React.FC<NeedsDetailScreenProps> = ({ onBackPress }) => {
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);
  const currency = useSelector(selectCurrency);
  const expenses = useSelector(selectExpenses);

  // Get all needs categories
  const needsCategories = useSelector((state) => selectCategoriesByType(state, "Needs"));

  // Calculate needs budget amount
  const needsBudgetAmount = monthlyIncome * (budgetRule.needs / 100);

  // Calculate needs spent
  const needsSpent = useMemo(() => {
    return expenses.filter((expense) => expense.category === "Needs").reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  // Calculate remaining amount
  const remainingAmount = needsBudgetAmount - needsSpent;

  // Calculate percentage used
  const percentageUsed = Math.round((needsSpent / needsBudgetAmount) * 100 * 10) / 10;

  // Calculate spending by category
  const categorySpending = useMemo(() => {
    return needsCategories.map((category) => {
      const spent = expenses.filter((expense) => expense.subcategory === category.name).reduce((total, expense) => total + expense.amount, 0);

      const percentage = Math.round((spent / needsBudgetAmount) * 100 * 10) / 10;

      return {
        ...category,
        spent,
        percentage,
      };
    });
  }, [expenses, needsCategories, needsBudgetAmount]);

  // Get current month and year for header
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Needs ({budgetRule.needs}%)</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Budget Card */}
        <View style={styles.budgetCard}>
          <Text style={styles.monthLabel}>
            {monthName} {year}
          </Text>

          <View style={styles.amountContainer}>
            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Spent</Text>
              <Text style={styles.spentAmount}>{formatCurrency(needsSpent, currency)}</Text>
            </View>

            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Allocated</Text>
              <Text style={styles.allocatedAmount}>{formatCurrency(needsBudgetAmount, currency)}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, percentageUsed)}%` }]} />
          </View>

          <View style={styles.progressInfoContainer}>
            <Text style={styles.percentageText}>{percentageUsed}% used</Text>
            <Text style={styles.remainingText}>{formatCurrency(remainingAmount, currency)} remaining</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Needs Categories</Text>

          {categorySpending.map((category) => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.name === "Housing"
                      ? "Rent, mortgage, utilities"
                      : category.name === "Groceries"
                      ? "Essential food items"
                      : category.name === "Transportation"
                      ? "Gas, public transit, car payment"
                      : category.name === "Healthcare"
                      ? "Insurance, medications"
                      : "Essential expenses"}
                  </Text>
                </View>
                <View style={styles.categoryAmountContainer}>
                  <Text style={styles.categoryAmount}>{formatCurrency(category.spent, currency)}</Text>
                  <Text style={styles.categoryPercentage}>{category.percentage}% of needs</Text>
                </View>
              </View>

              <View style={styles.categoryProgressContainer}>
                <View style={[styles.categoryProgressBar, { width: `${Math.min(100, (category.spent / needsBudgetAmount) * 100)}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* AI Insight Section */}
        <View style={styles.insightContainer}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={styles.insightTitle}>AI Insight</Text>
          </View>
          <Text style={styles.insightText}>
            You&apos;re on track with your Needs budget for {monthName}. Your utility bill is due in 3 days—remember to pay it before the due date.
          </Text>
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
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: scaleFontSize(24),
    color: "#333",
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginRight: responsiveMargin(30),
  },
  scrollView: {
    flex: 1,
    padding: responsivePadding(16),
  },
  budgetCard: {
    backgroundColor: BudgetColors.needs,
    borderRadius: 20,
    padding: responsivePadding(20),
    marginBottom: responsiveMargin(20),
  },
  monthLabel: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "white",
    marginBottom: responsiveMargin(10),
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveMargin(16),
  },
  amountColumn: {
    flex: 1,
  },
  amountLabel: {
    fontSize: scaleFontSize(16),
    color: "white",
    opacity: 0.8,
  },
  spentAmount: {
    fontSize: scaleFontSize(30),
    fontWeight: "700",
    color: "white",
  },
  allocatedAmount: {
    fontSize: scaleFontSize(30),
    fontWeight: "700",
    color: "white",
    textAlign: "right",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: responsiveMargin(8),
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 4,
  },
  progressInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  percentageText: {
    fontSize: scaleFontSize(16),
    color: "white",
  },
  remainingText: {
    fontSize: scaleFontSize(16),
    color: "white",
    textAlign: "right",
  },
  categoriesSection: {
    marginBottom: responsiveMargin(20),
  },
  sectionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    marginBottom: responsiveMargin(16),
  },
  categoryItem: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(12),
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  categoryIcon: {
    fontSize: scaleFontSize(20),
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  categoryDescription: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  categoryAmountContainer: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: scaleFontSize(18),
    fontWeight: "700",
  },
  categoryPercentage: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.needs,
  },
  categoryProgressContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryProgressBar: {
    height: "100%",
    backgroundColor: BudgetColors.needs,
    borderRadius: 4,
  },
  insightContainer: {
    backgroundColor: "#F8F0FF",
    borderRadius: 16,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(20),
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(8),
  },
  insightIcon: {
    fontSize: scaleFontSize(20),
    marginRight: responsiveMargin(8),
  },
  insightTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#7209B7",
  },
  insightText: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
    color: "#333",
  },
});

export default NeedsDetailScreen;
