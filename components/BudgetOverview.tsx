import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetData } from "../app/types/budget";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../app/utils/responsive";

interface BudgetOverviewProps {
  monthlyIncome: number;
  onBackPress?: () => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ monthlyIncome = 4000, onBackPress }) => {
  // Calculate budget amounts based on 50-30-20 rule
  const budgetData: BudgetData = {
    monthlyIncome,
    needs: {
      percentage: 50,
      amount: monthlyIncome * 0.5,
      spent: 1435, // This would be calculated from actual expenses in a real app
    },
    savings: {
      percentage: 30,
      amount: monthlyIncome * 0.3,
      spent: 1000, // This would be calculated from actual expenses in a real app
    },
    wants: {
      percentage: 20,
      amount: monthlyIncome * 0.2,
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
      </View>

      <View style={styles.incomeSection}>
        <Text style={styles.incomeLabel}>Monthly Income</Text>
        <Text style={styles.incomeAmount}>$ {monthlyIncome.toLocaleString()}</Text>
      </View>

      <View style={styles.ruleSection}>
        <Text style={styles.ruleTitle}>50-30-20 Budget Rule</Text>

        <View style={styles.budgetItem}>
          <View style={styles.budgetItemLeft}>
            <Text style={styles.budgetItemLabel}>Needs (50%)</Text>
            <View style={[styles.progressBar, { backgroundColor: BudgetColors.needs + "30" }]}>
              <View style={[styles.progress, { backgroundColor: BudgetColors.needs, width: "100%" }]} />
            </View>
          </View>
          <Text style={styles.budgetItemAmount}>${budgetData.needs.amount.toLocaleString()}</Text>
        </View>

        <View style={styles.budgetItem}>
          <View style={styles.budgetItemLeft}>
            <Text style={styles.budgetItemLabel}>Savings (30%)</Text>
            <View style={[styles.progressBar, { backgroundColor: BudgetColors.savings + "30" }]}>
              <View style={[styles.progress, { backgroundColor: BudgetColors.savings, width: "100%" }]} />
            </View>
          </View>
          <Text style={styles.budgetItemAmount}>${budgetData.savings.amount.toLocaleString()}</Text>
        </View>

        <View style={styles.budgetItem}>
          <View style={styles.budgetItemLeft}>
            <Text style={styles.budgetItemLabel}>Wants (20%)</Text>
            <View style={[styles.progressBar, { backgroundColor: BudgetColors.wants + "30" }]}>
              <View style={[styles.progress, { backgroundColor: BudgetColors.wants, width: "100%" }]} />
            </View>
          </View>
          <Text style={styles.budgetItemAmount}>${budgetData.wants.amount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>Budget Categories</Text>

        <Text style={styles.categoryGroupTitle}>Needs (Essential Expenses)</Text>

        <View style={styles.categoryRow}>
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>🏠</Text>
          </View>
          <Text style={styles.categoryName}>Housing</Text>
          <Text style={styles.categoryAmount}>1,200</Text>
        </View>

        <View style={styles.categoryRow}>
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>🍔</Text>
          </View>
          <Text style={styles.categoryName}>Groceries</Text>
          <Text style={styles.categoryAmount}>400</Text>
        </View>

        <View style={styles.categoryRow}>
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>🚗</Text>
          </View>
          <Text style={styles.categoryName}>Transportation</Text>
          <Text style={styles.categoryAmount}>300</Text>
        </View>

        <View style={styles.categoryRow}>
          <View style={styles.categoryIconContainer}>
            <Text style={styles.categoryIcon}>🏥</Text>
          </View>
          <Text style={styles.categoryName}>Healthcare</Text>
          <Text style={styles.categoryAmount}>100</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Budget</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: responsivePadding(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(20),
  },
  backButton: {
    fontSize: scaleFontSize(24),
    marginRight: responsiveMargin(10),
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
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
  },
  ruleSection: {
    marginBottom: responsiveMargin(24),
  },
  ruleTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(12),
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
  },
  budgetItemAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    width: 80,
    textAlign: "right",
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
    marginBottom: responsiveMargin(24),
  },
  categoriesTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(12),
  },
  categoryGroupTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    marginBottom: responsiveMargin(10),
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(12),
  },
  categoryIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(10),
  },
  categoryIcon: {
    fontSize: scaleFontSize(14),
  },
  categoryName: {
    flex: 1,
    fontSize: scaleFontSize(14),
  },
  categoryAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: BudgetColors.needs,
    borderRadius: wp("2%"),
    padding: responsivePadding(16),
    alignItems: "center",
    marginTop: "auto",
  },
  saveButtonText: {
    color: "white",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
});

export default BudgetOverview;
