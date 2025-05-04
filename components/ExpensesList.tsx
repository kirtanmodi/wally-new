import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory, CategorySummary, Expense } from "../app/types/budget";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../app/utils/responsive";
import { selectBudgetRule, selectMonthlyIncome } from "../redux/slices/budgetSlice";

interface ExpensesListProps {
  expenses?: Expense[];
  onAddExpense?: () => void;
  onOpenBudget?: () => void;
  onOpenSettings?: () => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses = [], onAddExpense, onOpenBudget, onOpenSettings }) => {
  const [activeTab, setActiveTab] = useState<"All" | BudgetCategory>("All");
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get budget data from Redux
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);

  // Calculate category summaries based on expenses
  const categorySummaries: CategorySummary[] = useMemo(() => {
    // Calculate budget amounts based on user's income and budget rule percentages
    const needsBudget = monthlyIncome * (budgetRule.needs / 100);
    const savingsBudget = monthlyIncome * (budgetRule.savings / 100);
    const wantsBudget = monthlyIncome * (budgetRule.wants / 100);

    // Calculate spent amounts in each category
    const needsSpent = expenses.filter((exp) => exp.category === "Needs").reduce((sum, exp) => sum + exp.amount, 0);
    const savingsSpent = expenses.filter((exp) => exp.category === "Savings").reduce((sum, exp) => sum + exp.amount, 0);
    const wantsSpent = expenses.filter((exp) => exp.category === "Wants").reduce((sum, exp) => sum + exp.amount, 0);

    return [
      {
        category: "Needs",
        spent: needsSpent,
        total: needsBudget,
        color: BudgetColors.needs,
        gradientColors: ["#5F9E5F", "#3D7A3D"],
      },
      {
        category: "Savings",
        spent: savingsSpent,
        total: savingsBudget,
        color: BudgetColors.savings,
        gradientColors: ["#E9915E", "#DE7E3E"],
      },
      {
        category: "Wants",
        spent: wantsSpent,
        total: wantsBudget,
        color: BudgetColors.wants,
        gradientColors: ["#7377E8", "#5357CA"],
      },
    ];
  }, [expenses, monthlyIncome, budgetRule]);

  // Filter expenses based on active tab and search query
  const filteredExpenses = useMemo(() => {
    let filtered = activeTab === "All" ? expenses : expenses.filter((expense) => expense.category === activeTab);

    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((expense) => expense.title.toLowerCase().includes(query) || expense.subcategory.toLowerCase().includes(query));
    }

    return filtered;
  }, [expenses, activeTab, searchQuery]);

  const renderCategorySummary = ({ item }: { item: CategorySummary }) => {
    const percentage = Math.min(100, (item.spent / item.total) * 100);

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onOpenBudget}>
        <LinearGradient colors={item.gradientColors as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.categoryCard}>
          <Text style={styles.categoryLabel}>{item.category}</Text>
          <View style={styles.categoryAmountRow}>
            <Text style={styles.categoryAmount}>${item.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
            <Text style={styles.categoryTotal}>
              of ${item.total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    // Format the date
    const formattedDate = item.date instanceof Date ? item.date.toLocaleDateString() : new Date(item.date).toLocaleDateString();

    return (
      <View style={styles.expenseItem}>
        <View style={[styles.expenseIcon, { backgroundColor: getCategoryColor(item.category) + "20" }]}>
          <Text style={[styles.iconText, { color: getCategoryColor(item.category) }]}>{item.icon}</Text>
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <View style={styles.expenseSubDetail}>
            <Text style={styles.expenseCategory}>{item.subcategory}</Text>
            <Text style={styles.expenseDate}>{formattedDate}</Text>
          </View>
        </View>
        <Text style={styles.expenseAmount}>${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      </View>
    );
  };

  const getCategoryColor = (category: BudgetCategory) => {
    switch (category) {
      case "Needs":
        return BudgetColors.needs;
      case "Savings":
        return BudgetColors.savings;
      case "Wants":
        return BudgetColors.wants;
      default:
        return "#999";
    }
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
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemIcon}>📊</Text>
                <Text style={styles.menuItemText}>Budget Overview</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onOpenSettings && onOpenSettings();
              }}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemIcon}>⚙️</Text>
                <Text style={styles.menuItemText}>Budget Settings</Text>
              </View>
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
          <Text style={[styles.tabText, activeTab === "All" && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "Needs" && styles.activeTab]} onPress={() => setActiveTab("Needs")}>
          <Text style={[styles.tabText, activeTab === "Needs" && styles.activeTabText]}>Needs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "Savings" && styles.activeTab]} onPress={() => setActiveTab("Savings")}>
          <Text style={[styles.tabText, activeTab === "Savings" && styles.activeTabText]}>Savings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "Wants" && styles.activeTab]} onPress={() => setActiveTab("Wants")}>
          <Text style={[styles.tabText, activeTab === "Wants" && styles.activeTabText]}>Wants</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          placeholderTextColor="#AAAAAA"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses found</Text>
          <Text style={styles.emptySubText}>{searchQuery ? "Try a different search term" : "Add your first expense by tapping the + button"}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          renderItem={renderExpenseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.expensesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity activeOpacity={0.8} style={styles.addButton} onPress={onAddExpense}>
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
    fontSize: scaleFontSize(26),
    fontWeight: "bold",
    color: "#222",
    letterSpacing: 0.5,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  menuIcon: {
    fontSize: scaleFontSize(22),
    color: "#444",
  },
  menuDropdown: {
    position: "absolute",
    top: 50,
    right: 5,
    backgroundColor: "#FFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 1000,
    width: 200,
    overflow: "hidden",
  },
  menuItem: {
    paddingVertical: responsivePadding(14),
    paddingHorizontal: responsivePadding(16),
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemIcon: {
    fontSize: scaleFontSize(18),
    marginRight: responsiveMargin(10),
  },
  menuItemText: {
    fontSize: scaleFontSize(15),
    color: "#444",
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: responsiveMargin(8),
  },
  categoriesContainer: {
    marginBottom: responsiveMargin(24),
  },
  categoriesList: {
    paddingRight: responsivePadding(16),
  },
  categoryCard: {
    borderRadius: 18,
    padding: responsivePadding(20),
    marginRight: responsiveMargin(16),
    width: wp("72%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryLabel: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    marginBottom: responsiveMargin(6),
    fontWeight: "600",
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  categoryAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: responsiveMargin(14),
  },
  categoryAmount: {
    fontSize: scaleFontSize(26),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: responsiveMargin(6),
  },
  categoryTotal: {
    fontSize: scaleFontSize(15),
    color: "#FFFFFF",
    opacity: 0.85,
    fontWeight: "500",
  },
  progressBarContainer: {
    marginTop: responsiveMargin(6),
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: responsiveMargin(18),
    borderRadius: 12,
    backgroundColor: "#FFF",
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: responsivePadding(12),
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#F2F6FF",
  },
  tabText: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#888",
  },
  activeTabText: {
    color: "#4A66E8",
  },
  searchContainer: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginBottom: responsiveMargin(18),
    paddingHorizontal: responsivePadding(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    height: 52,
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
    padding: responsivePadding(16),
    borderRadius: 16,
    marginBottom: responsiveMargin(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(14),
  },
  iconText: {
    fontSize: scaleFontSize(20),
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  expenseSubDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expenseCategory: {
    fontSize: scaleFontSize(14),
    color: "#666",
    fontWeight: "500",
  },
  expenseDate: {
    fontSize: scaleFontSize(12),
    color: "#999",
  },
  expenseAmount: {
    fontSize: scaleFontSize(17),
    fontWeight: "700",
    color: "#333",
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4A66E8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A66E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonIcon: {
    fontSize: scaleFontSize(28),
    color: "white",
    marginTop: -2, // Visual alignment
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60, // Account for the floating action button
  },
  emptyText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: scaleFontSize(15),
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 22,
  },
});

export default ExpensesList;
