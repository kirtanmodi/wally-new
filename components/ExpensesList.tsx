import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory, CategorySummary, Expense } from "../app/types/budget";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../app/utils/responsive";

interface ExpensesListProps {
  expenses?: Expense[];
  onAddExpense?: () => void;
  onOpenBudget?: () => void;
  onOpenSettings?: () => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses = [], onAddExpense, onOpenBudget, onOpenSettings }) => {
  const [activeTab, setActiveTab] = useState<"All" | BudgetCategory>("All");
  const [showMenu, setShowMenu] = useState(false);

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
      <TouchableOpacity style={styles.categoryCard} onPress={onOpenBudget}>
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
      </TouchableOpacity>
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
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>

        {showMenu && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onOpenBudget && onOpenBudget();
              }}
            >
              <Text style={styles.menuItemText}>Budget Overview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onOpenSettings && onOpenSettings();
              }}
            >
              <Text style={styles.menuItemText}>Budget Settings</Text>
            </TouchableOpacity>
          </View>
        )}
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
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    color: "#333",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: scaleFontSize(24),
    color: "#333",
  },
  menuDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#FFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
    width: 180,
  },
  menuItem: {
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemText: {
    fontSize: scaleFontSize(14),
    color: "#333",
  },
  categoriesContainer: {
    marginBottom: responsiveMargin(20),
  },
  categoriesList: {
    paddingRight: responsivePadding(16),
  },
  categoryCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: responsivePadding(16),
    marginRight: responsiveMargin(12),
    width: wp("70%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(4),
  },
  categoryAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: responsiveMargin(12),
  },
  categoryAmount: {
    fontSize: scaleFontSize(20),
    fontWeight: "bold",
    color: "#333",
    marginRight: responsiveMargin(4),
  },
  categoryTotal: {
    fontSize: scaleFontSize(14),
    color: "#999",
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
    borderRadius: 8,
    backgroundColor: "#FFF",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: responsivePadding(8),
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: BudgetColors.needs + "20",
  },
  tabText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#333",
  },
  searchContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: responsiveMargin(16),
    paddingHorizontal: responsivePadding(12),
  },
  searchInput: {
    height: 44,
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  expensesList: {
    paddingBottom: 100, // Extra padding for the add button
  },
  expenseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: responsivePadding(12),
    borderRadius: 8,
    marginBottom: responsiveMargin(8),
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  iconText: {
    fontSize: scaleFontSize(20),
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  expenseAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BudgetColors.needs,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonIcon: {
    fontSize: scaleFontSize(24),
    color: "white",
  },
});

export default ExpensesList;
