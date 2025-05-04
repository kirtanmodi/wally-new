import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory, CategorySummary, Expense } from "../app/types/budget";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../app/utils/responsive";

interface ExpensesListProps {
  expenses?: Expense[];
  onAddExpense?: () => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses = [], onAddExpense }) => {
  const [activeTab, setActiveTab] = useState<"All" | BudgetCategory>("All");

  // Calculate category summaries based on expenses
  const categorySummaries: CategorySummary[] = useMemo(() => {
    // Default budget breakdown
    const totalBudget = 4000;
    const needsBudget = totalBudget * 0.5;
    const savingsBudget = totalBudget * 0.3;
    const wantsBudget = totalBudget * 0.2;

    // Calculate spent amounts in each category
    const needsSpent = expenses.filter((exp) => exp.category === "Needs").reduce((sum, exp) => sum + exp.amount, 0);

    const savingsSpent = expenses.filter((exp) => exp.category === "Savings").reduce((sum, exp) => sum + exp.amount, 0);

    const wantsSpent = expenses.filter((exp) => exp.category === "Wants").reduce((sum, exp) => sum + exp.amount, 0);

    return [
      {
        category: "Needs",
        spent: expenses.length > 0 ? needsSpent : 1435, // Default if no expenses
        total: needsBudget,
        color: BudgetColors.needs,
      },
      {
        category: "Savings",
        spent: expenses.length > 0 ? savingsSpent : 1000, // Default if no expenses
        total: savingsBudget,
        color: BudgetColors.savings,
      },
      {
        category: "Wants",
        spent: expenses.length > 0 ? wantsSpent : 520, // Default if no expenses
        total: wantsBudget,
        color: BudgetColors.wants,
      },
    ];
  }, [expenses]);

  // Default expense items if none provided
  const defaultExpenses: Expense[] = [
    {
      id: "1",
      title: "Rent",
      amount: 1200,
      category: "Needs",
      subcategory: "Housing",
      icon: "🏠",
      date: new Date(),
    },
    {
      id: "2",
      title: "Coffee Shop",
      amount: 4.95,
      category: "Wants",
      subcategory: "Food",
      icon: "☕",
      date: new Date(),
    },
    {
      id: "3",
      title: "Grocery Store",
      amount: 85.5,
      category: "Needs",
      subcategory: "Food",
      icon: "🛒",
      date: new Date(),
    },
    {
      id: "4",
      title: "Restaurant",
      amount: 45.8,
      category: "Wants",
      subcategory: "Food",
      icon: "🍽️",
      date: new Date(),
    },
    {
      id: "5",
      title: "Uber",
      amount: 12.75,
      category: "Wants",
      subcategory: "Transport",
      icon: "🚗",
      date: new Date(),
    },
  ];

  const displayedExpenses = expenses.length > 0 ? expenses : defaultExpenses;
  const filteredExpenses = activeTab === "All" ? displayedExpenses : displayedExpenses.filter((expense) => expense.category === activeTab);

  const renderCategorySummary = ({ item }: { item: CategorySummary }) => {
    const percentage = Math.min(100, (item.spent / item.total) * 100);

    return (
      <View style={styles.categoryCard}>
        <Text style={styles.categoryLabel}>{item.category}</Text>
        <View style={styles.categoryAmountRow}>
          <Text style={styles.categoryAmount}>${item.spent.toLocaleString()}</Text>
          <Text style={styles.categoryTotal}>of ${item.total.toLocaleString()}</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: item.color + "30" }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: item.color,
                width: `${percentage}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    return (
      <View style={styles.expenseItem}>
        <View style={styles.expenseIcon}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <Text style={styles.expenseCategory}>{item.subcategory}</Text>
        </View>
        <Text style={styles.expenseAmount}>${item.amount.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categorySummaries}
          renderItem={renderCategorySummary}
          keyExtractor={(item) => item.category}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === "All" && styles.activeTab]} onPress={() => setActiveTab("All")}>
          <Text style={styles.tabText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "Needs" && styles.activeTab]} onPress={() => setActiveTab("Needs")}>
          <Text style={styles.tabText}>Needs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "Wants" && styles.activeTab]} onPress={() => setActiveTab("Wants")}>
          <Text style={styles.tabText}>Wants</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search expenses..." placeholderTextColor="#999" />
      </View>

      <FlatList data={filteredExpenses} renderItem={renderExpenseItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.expensesList} />

      <TouchableOpacity style={styles.addButton} onPress={onAddExpense}>
        <Text style={styles.addButtonIcon}>+</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(20),
  },
  headerTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "600",
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    fontSize: scaleFontSize(24),
  },
  categoriesContainer: {
    marginBottom: responsiveMargin(20),
  },
  categoriesList: {
    paddingRight: responsivePadding(16),
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: responsivePadding(12),
    marginRight: responsiveMargin(12),
    width: wp("40%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryLabel: {
    fontSize: scaleFontSize(14),
    marginBottom: 4,
  },
  categoryAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  categoryAmount: {
    fontSize: scaleFontSize(22),
    fontWeight: "bold",
    marginRight: 4,
  },
  categoryTotal: {
    fontSize: scaleFontSize(14),
    color: "#888",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: responsiveMargin(16),
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#333",
  },
  tabText: {
    fontSize: scaleFontSize(14),
  },
  searchContainer: {
    marginBottom: responsiveMargin(16),
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: responsivePadding(12),
    fontSize: scaleFontSize(14),
  },
  expensesList: {
    paddingBottom: responsiveMargin(80),
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  expenseIcon: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  iconText: {
    fontSize: scaleFontSize(18),
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
  },
  expenseCategory: {
    fontSize: scaleFontSize(14),
    color: "#888",
  },
  expenseAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4A67FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonIcon: {
    fontSize: scaleFontSize(24),
    color: "white",
  },
});

export default ExpensesList;
