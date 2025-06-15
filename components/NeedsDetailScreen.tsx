import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { formatCurrency } from "../app/utils/currency";
import { filterExpensesByMonth, getCurrentMonthYearKey } from "../app/utils/dateUtils";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { selectBudgetRule, selectCategoriesByType, selectCategoryLimits, selectCurrency, selectDenominationFormat, selectMonthlyIncome, selectUseBaseBudget, setCategoryLimit, setUseBaseBudget } from "../redux/slices/budgetSlice";
import { selectExpenses } from "../redux/slices/expenseSlice";
import { RootState } from "../redux/types";
import CategoryLimitModal from "./CategoryLimitModal";

interface NeedsDetailScreenProps {
  onBackPress?: () => void;
  selectedMonth?: string;
}

const NeedsDetailScreen: React.FC<NeedsDetailScreenProps> = ({ onBackPress, selectedMonth = getCurrentMonthYearKey() }) => {
  const dispatch = useDispatch();
  const expenses = useSelector(selectExpenses) || [];
  const monthlyIncome = useSelector(selectMonthlyIncome) || 0;
  const budgetRule = useSelector(selectBudgetRule) || { needs: 50, savings: 30, wants: 20 };
  const currency = useSelector(selectCurrency) || { code: "USD", symbol: "$", name: "US Dollar" };
  const denominationFormat = useSelector(selectDenominationFormat);
  const needsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Needs")) || [];
  const useBaseBudget = useSelector(selectUseBaseBudget) || false;
  const categoryLimits = useSelector(selectCategoryLimits) || {};

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; icon: string }>({ id: "", name: "", icon: "" });

  // Filter expenses by month
  const monthlyExpenses = useMemo(() => filterExpensesByMonth(expenses || [], selectedMonth || getCurrentMonthYearKey()), [expenses, selectedMonth]);

  // Calculate budget and spent for Needs
  const budgetData = useMemo(() => {
    // Calculate budget based on mode
    let needsBudget: number;
    if (useBaseBudget) {
      // Base budget mode: sum of individual category limits
      needsBudget = Object.values(categoryLimits).reduce((sum, limit) => sum + limit, 0);
    } else {
      // Percentage mode: based on income
      needsBudget = (monthlyIncome || 0) * ((budgetRule?.needs || 50) / 100);
    }

    const needsSpent = monthlyExpenses.filter((exp) => exp.category === "Needs").reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate spending by subcategory within Needs
    const subcategorySpendings = (needsCategories || []).map((category) => {
      const spent = monthlyExpenses
        .filter((exp) => exp.category === "Needs" && exp.subcategory === category.name)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const categoryLimit = categoryLimits[category.id] || 0;
      const hasLimit = useBaseBudget && categoryLimit > 0;

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        spent,
        limit: categoryLimit,
        hasLimit,
        isOverLimit: hasLimit && spent > categoryLimit,
      };
    });

    return {
      budget: needsBudget,
      spent: needsSpent,
      remaining: needsBudget - needsSpent,
      subcategories: subcategorySpendings,
    };
  }, [monthlyIncome, budgetRule, monthlyExpenses, needsCategories, selectedMonth, useBaseBudget, categoryLimits]);

  // Format currency amount using denomination format
  const formatBudgetAmount = (amount: number) => {
    return formatCurrency(amount, currency, denominationFormat);
  };

  // Calculate and format percentage of total needs spending
  const getPercentage = (amount: number) => {
    if (budgetData.spent === 0) return "0%";
    return `${Math.round((amount / budgetData.spent) * 100)}%`;
  };

  // Calculate progress percentage
  const getProgress = (spent: number, limit?: number) => {
    const budget = limit || budgetData.budget;
    if (budget === 0) return 0;
    return Math.min(100, (spent / budget) * 100);
  };

  // Handle modal functions
  const openLimitModal = (category: { id: string; name: string; icon: string }) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const saveCategoryLimit = (limit: number) => {
    if (selectedCategory.id) {
      dispatch(setCategoryLimit({
        categoryId: selectedCategory.id,
        limit: limit,
      }));
    }
  };

  const handleBaseBudgetToggle = (value: boolean) => {
    dispatch(setUseBaseBudget(value));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Needs Details</Text>
        <View style={styles.placeholderRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Base Budget Toggle */}
        <View style={styles.baseBudgetCard}>
          <View style={styles.baseBudgetHeader}>
            <View style={styles.baseBudgetTextContainer}>
              <Text style={styles.baseBudgetTitle}>Base Budget Mode</Text>
              <Text style={styles.baseBudgetDescription}>
                {useBaseBudget 
                  ? "Set individual limits for each category" 
                  : "Use percentage-based budget allocation"}
              </Text>
            </View>
            <Switch
              value={useBaseBudget}
              onValueChange={handleBaseBudgetToggle}
              trackColor={{ false: "#E0E0E0", true: BudgetColors.needs + "40" }}
              thumbColor={useBaseBudget ? BudgetColors.needs : "#f4f3f4"}
            />
          </View>
          
          {useBaseBudget && (
            <View style={styles.baseBudgetIndicator}>
              <Text style={styles.baseBudgetIndicatorText}>
                💰 Base Budget Mode Active - Set individual category limits below
              </Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {useBaseBudget ? "Total Category Limits" : "Needs Budget Summary"}
          </Text>

          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>
              {useBaseBudget ? "Total Limits" : "Budget"}
            </Text>
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
          <Text style={styles.sectionTitle}>
            {useBaseBudget ? "Category Limits & Spending" : "Spending By Category"}
          </Text>

          {budgetData.subcategories.length === 0 ? (
            <Text style={styles.noDataText}>No spending data available</Text>
          ) : (
            budgetData.subcategories.map((subcategory) => (
              <View key={subcategory.id} style={styles.categoryItem}>
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryIcon}>{subcategory.icon}</Text>
                </View>
                <View style={styles.categoryDetails}>
                  <View style={styles.categoryNameRow}>
                    <Text style={styles.categoryName}>{subcategory.name}</Text>
                    {useBaseBudget && (
                      <TouchableOpacity
                        style={styles.setLimitButton}
                        onPress={() => openLimitModal(subcategory)}
                      >
                        <Text style={styles.setLimitButtonText}>
                          {subcategory.hasLimit ? "Edit Limit" : "Set Limit"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {useBaseBudget && subcategory.hasLimit && (
                    <Text style={styles.categoryLimitText}>
                      Limit: {formatBudgetAmount(subcategory.limit)}
                    </Text>
                  )}
                  
                  <View style={styles.categoryProgressContainer}>
                    <View style={styles.categoryProgressBar}>
                      <View 
                        style={[
                          styles.categoryProgressFill, 
                          { 
                            width: `${getProgress(subcategory.spent, subcategory.hasLimit ? subcategory.limit : undefined)}%`,
                            backgroundColor: subcategory.isOverLimit ? "#E74C3C" : BudgetColors.needs,
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.categoryAmountContainer}>
                  <Text style={[
                    styles.categoryAmount,
                    subcategory.isOverLimit && styles.overLimitText
                  ]}>
                    {formatBudgetAmount(subcategory.spent)}
                  </Text>
                  {!useBaseBudget && (
                    <Text style={styles.categoryPercentage}>{getPercentage(subcategory.spent)}</Text>
                  )}
                  {subcategory.isOverLimit && (
                    <Text style={styles.overLimitIndicator}>Over Limit!</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Category Limit Modal */}
      <CategoryLimitModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveCategoryLimit}
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
        categoryIcon={selectedCategory.icon}
        currentLimit={categoryLimits[selectedCategory.id] || 0}
      />
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
    backgroundColor: BudgetColors.needs,
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
    backgroundColor: `${BudgetColors.needs}15`,
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
    backgroundColor: BudgetColors.needs,
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
  baseBudgetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  baseBudgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  baseBudgetTextContainer: {
    flex: 1,
    marginRight: responsiveMargin(16),
  },
  baseBudgetTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(4),
  },
  baseBudgetDescription: {
    fontSize: scaleFontSize(13),
    color: "#666",
    lineHeight: 18,
  },
  baseBudgetIndicator: {
    marginTop: responsiveMargin(12),
    padding: responsivePadding(12),
    backgroundColor: `${BudgetColors.needs}10`,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: BudgetColors.needs,
  },
  baseBudgetIndicatorText: {
    fontSize: scaleFontSize(13),
    color: BudgetColors.needs,
    fontWeight: "500",
  },
  categoryNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(4),
  },
  setLimitButton: {
    backgroundColor: `${BudgetColors.needs}15`,
    paddingHorizontal: responsivePadding(8),
    paddingVertical: responsivePadding(4),
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BudgetColors.needs,
  },
  setLimitButtonText: {
    fontSize: scaleFontSize(11),
    color: BudgetColors.needs,
    fontWeight: "600",
  },
  categoryLimitText: {
    fontSize: scaleFontSize(12),
    color: BudgetColors.needs,
    fontWeight: "500",
    marginBottom: responsiveMargin(4),
  },
  overLimitText: {
    color: "#E74C3C",
  },
  overLimitIndicator: {
    fontSize: scaleFontSize(10),
    color: "#E74C3C",
    fontWeight: "600",
    marginTop: responsiveMargin(2),
  },
});

export default NeedsDetailScreen;
