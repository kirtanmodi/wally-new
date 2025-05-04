import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetData } from "../app/types/budget";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { selectBudgetRule, selectCategoriesByType } from "../redux/slices/budgetSlice";
import { RootState } from "../redux/types";

interface BudgetOverviewProps {
  monthlyIncome: number;
  onBackPress?: () => void;
  onOpenSettings?: () => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ monthlyIncome = 4000, onBackPress, onOpenSettings }) => {
  const budgetRule = useSelector(selectBudgetRule);
  const needsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Needs"));
  const savingsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Savings"));
  const wantsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Wants"));

  // Calculate budget amounts based on the user's budget rule
  const budgetData: BudgetData = {
    monthlyIncome,
    needs: {
      percentage: budgetRule.needs,
      amount: monthlyIncome * (budgetRule.needs / 100),
      spent: 1435, // This would be calculated from actual expenses in a real app
    },
    savings: {
      percentage: budgetRule.savings,
      amount: monthlyIncome * (budgetRule.savings / 100),
      spent: 1000, // This would be calculated from actual expenses in a real app
    },
    wants: {
      percentage: budgetRule.wants,
      amount: monthlyIncome * (budgetRule.wants / 100),
      spent: 520, // This would be calculated from actual expenses in a real app
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income & Budget</Text>
        <TouchableOpacity onPress={onOpenSettings}>
          <Text style={styles.settingsButton}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.incomeSection}>
          <Text style={styles.incomeLabel}>Monthly Income</Text>
          <Text style={styles.incomeAmount}>$ {monthlyIncome.toLocaleString()}</Text>
        </View>

        <View style={styles.ruleSection}>
          <Text style={styles.ruleTitle}>Budget Rule</Text>

          <View style={styles.budgetItem}>
            <View style={styles.budgetItemLeft}>
              <Text style={styles.budgetItemLabel}>Needs ({budgetRule.needs}%)</Text>
              <View style={[styles.progressBar, { backgroundColor: BudgetColors.needs + "30" }]}>
                <View style={[styles.progress, { backgroundColor: BudgetColors.needs, width: "100%" }]} />
              </View>
            </View>
            <Text style={styles.budgetItemAmount}>${budgetData.needs.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.budgetItem}>
            <View style={styles.budgetItemLeft}>
              <Text style={styles.budgetItemLabel}>Savings ({budgetRule.savings}%)</Text>
              <View style={[styles.progressBar, { backgroundColor: BudgetColors.savings + "30" }]}>
                <View style={[styles.progress, { backgroundColor: BudgetColors.savings, width: "100%" }]} />
              </View>
            </View>
            <Text style={styles.budgetItemAmount}>${budgetData.savings.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.budgetItem}>
            <View style={styles.budgetItemLeft}>
              <Text style={styles.budgetItemLabel}>Wants ({budgetRule.wants}%)</Text>
              <View style={[styles.progressBar, { backgroundColor: BudgetColors.wants + "30" }]}>
                <View style={[styles.progress, { backgroundColor: BudgetColors.wants, width: "100%" }]} />
              </View>
            </View>
            <Text style={styles.budgetItemAmount}>${budgetData.wants.amount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Budget Categories</Text>

          {needsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Needs (Essential Expenses)</Text>
              {needsCategories.map((category) => (
                <View key={category.id} style={styles.categoryRow}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryAmount}>-</Text>
                </View>
              ))}
            </>
          )}

          {savingsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Savings</Text>
              {savingsCategories.map((category) => (
                <View key={category.id} style={styles.categoryRow}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryAmount}>-</Text>
                </View>
              ))}
            </>
          )}

          {wantsCategories.length > 0 && (
            <>
              <Text style={styles.categoryGroupTitle}>Wants (Non-Essential)</Text>
              {wantsCategories.map((category) => (
                <View key={category.id} style={styles.categoryRow}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryAmount}>-</Text>
                </View>
              ))}
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
    alignItems: "center",
    marginBottom: responsiveMargin(12),
  },
  budgetItemLeft: {
    flex: 1,
    marginRight: responsiveMargin(10),
  },
  budgetItemLabel: {
    fontSize: scaleFontSize(14),
    marginBottom: 4,
    color: "#333",
  },
  budgetItemAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    width: 80,
    textAlign: "right",
    color: "#333",
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
