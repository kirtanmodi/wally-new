import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory, ExpenseCategory } from "../app/types/budget";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";

interface AddExpenseProps {
  onSave?: (expenseData: {
    amount: number;
    description: string;
    budgetCategory: BudgetCategory;
    category: ExpenseCategory | string;
    date: Date;
  }) => void;
  onCancel?: () => void;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onSave, onCancel }) => {
  const [amount, setAmount] = useState("24.50");
  const [description, setDescription] = useState("Lunch with colleagues");
  const [budgetCategory, setBudgetCategory] = useState<BudgetCategory>("Needs");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(new Date());

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        amount: parseFloat(amount),
        description,
        budgetCategory,
        category,
        date,
      });
    }
  };

  const categoryOptions = [
    { id: "food", label: "Food" as ExpenseCategory, icon: "🍔" },
    { id: "clothing", label: "Clothing" as ExpenseCategory, icon: "👕" },
    { id: "housing", label: "Housing" as ExpenseCategory, icon: "🏠" },
    { id: "transport", label: "Transport" as ExpenseCategory, icon: "🚗" },
    { id: "health", label: "Health" as ExpenseCategory, icon: "💊" },
    { id: "other", label: "Other" as ExpenseCategory, icon: "⋯" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="What was this expense for?"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Budget Category</Text>
        <View style={styles.budgetCategoriesContainer}>
          <TouchableOpacity
            style={[
              styles.budgetCategoryButton,
              budgetCategory === "Needs" && styles.selectedBudgetCategory,
              { backgroundColor: budgetCategory === "Needs" ? BudgetColors.needs : BudgetColors.needs + "20" },
            ]}
            onPress={() => setBudgetCategory("Needs")}
          >
            <Text style={[styles.budgetCategoryText, budgetCategory === "Needs" && styles.selectedBudgetCategoryText]}>Needs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.budgetCategoryButton,
              budgetCategory === "Savings" && styles.selectedBudgetCategory,
              { backgroundColor: budgetCategory === "Savings" ? BudgetColors.savings : BudgetColors.savings + "20" },
            ]}
            onPress={() => setBudgetCategory("Savings")}
          >
            <Text style={[styles.budgetCategoryText, budgetCategory === "Savings" && styles.selectedBudgetCategoryText]}>Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.budgetCategoryButton,
              budgetCategory === "Wants" && styles.selectedBudgetCategory,
              { backgroundColor: budgetCategory === "Wants" ? BudgetColors.wants : BudgetColors.wants + "20" },
            ]}
            onPress={() => setBudgetCategory("Wants")}
          >
            <Text style={[styles.budgetCategoryText, budgetCategory === "Wants" && styles.selectedBudgetCategoryText]}>Wants</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {categoryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.categoryOption, category === option.label && styles.selectedCategory]}
              onPress={() => setCategory(option.label)}
            >
              <Text style={styles.categoryIcon}>{option.icon}</Text>
              <Text style={styles.categoryLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Date</Text>
        <TouchableOpacity style={styles.datePickerButton}>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.aiInsightContainer}>
        <Text style={styles.aiInsightIcon}>💡</Text>
        <View style={styles.aiInsightTextContainer}>
          <Text style={styles.aiInsightTitle}>AI Insight</Text>
          <Text style={styles.aiInsightText}>
            This looks like dining out, which typically falls under your &quot;Wants&quot; category (20% of budget).
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Expense</Text>
      </TouchableOpacity>
    </ScrollView>
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
    marginBottom: responsiveMargin(24),
  },
  backButton: {
    fontSize: scaleFontSize(24),
    marginRight: responsiveMargin(10),
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
  },
  formSection: {
    marginBottom: responsiveMargin(24),
  },
  sectionLabel: {
    fontSize: scaleFontSize(16),
    color: "#666",
    marginBottom: responsiveMargin(8),
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: scaleFontSize(24),
    marginRight: 8,
  },
  amountInput: {
    fontSize: scaleFontSize(32),
    flex: 1,
  },
  descriptionInput: {
    fontSize: scaleFontSize(16),
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  budgetCategoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetCategoryButton: {
    flex: 1,
    paddingVertical: responsivePadding(12),
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedBudgetCategory: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  budgetCategoryText: {
    fontSize: scaleFontSize(14),
  },
  selectedBudgetCategoryText: {
    color: "white",
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  categoryOption: {
    width: "33.33%",
    padding: 8,
    alignItems: "center",
  },
  selectedCategory: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  categoryIcon: {
    fontSize: scaleFontSize(24),
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: scaleFontSize(12),
  },
  datePickerButton: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: responsivePadding(12),
    borderWidth: 1,
    borderColor: "#ddd",
  },
  dateText: {
    fontSize: scaleFontSize(16),
  },
  aiInsightContainer: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(24),
    marginTop: responsiveMargin(12),
  },
  aiInsightIcon: {
    fontSize: scaleFontSize(24),
    marginRight: responsiveMargin(12),
  },
  aiInsightTextContainer: {
    flex: 1,
  },
  aiInsightTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    marginBottom: 4,
  },
  aiInsightText: {
    fontSize: scaleFontSize(14),
    color: "#555",
  },
  saveButton: {
    backgroundColor: BudgetColors.needs,
    borderRadius: 12,
    padding: responsivePadding(16),
    alignItems: "center",
    marginTop: responsiveMargin(8),
    marginBottom: responsiveMargin(30),
  },
  saveButtonText: {
    color: "white",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
});

export default AddExpense;
