import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory, CategorySummary, Expense } from "../app/types/budget";
import { formatCurrency } from "../app/utils/currency";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../app/utils/responsive";
import { selectBudgetRule, selectCurrency, selectMonthlyIncome } from "../redux/slices/budgetSlice";
import { deleteExpense } from "../redux/slices/expenseSlice";

interface ExpensesListProps {
  expenses?: Expense[];
  onAddExpense?: () => void;
  onOpenBudget?: () => void;
  onOpenSettings?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onOpenNeedsDetail?: () => void;
  onOpenWantsDetail?: () => void;
  onOpenSavingsDetail?: () => void;
}

// Animated Category Circle Component
const AnimatedCategoryCircle: React.FC<{
  item: CategorySummary;
  index: number;
  onOpenBudget?: () => void;
  onOpenNeedsDetail?: () => void;
  onOpenWantsDetail?: () => void;
  onOpenSavingsDetail?: () => void;
}> = ({ item, index, onOpenBudget, onOpenNeedsDetail, onOpenWantsDetail, onOpenSavingsDetail }) => {
  const percentage = Math.min(100, (item.spent / item.total) * 100);
  const isOverBudget = item.spent > item.total;
  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const warningFade = useRef(new Animated.Value(0)).current;
  const currency = useSelector(selectCurrency);

  useEffect(() => {
    // Staggered animation
    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(itemSlide, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Add pulsing animation if over budget
    if (isOverBudget && item.category !== "Savings") {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Warning text fade in
      Animated.timing(warningFade, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOverBudget]);

  const handleCategoryPress = () => {
    if (item.category === "Needs") {
      onOpenNeedsDetail?.();
    } else if (item.category === "Wants") {
      onOpenWantsDetail?.();
    } else if (item.category === "Savings") {
      onOpenSavingsDetail?.();
    } else {
      onOpenBudget?.();
    }
  };

  return (
    <Animated.View
      style={{
        opacity: itemFade,
        transform: [{ translateY: itemSlide }],
        alignItems: "center",
        marginHorizontal: responsiveMargin(8),
      }}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={handleCategoryPress}>
        <Animated.View style={[styles.categoryCircleContainer, isOverBudget && item.category !== "Savings" && {}]}>
          <LinearGradient
            colors={isOverBudget && item.category !== "Savings" ? ["#FF7171", "#FF4040"] : (item.gradientColors as [string, string])}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryCircle}
          >
            <Text style={styles.categoryPercentage}>{percentage ? Math.round(percentage) : 0}%</Text>
            <View style={styles.circleProgressContainer}>
              <View
                style={[
                  styles.circleProgress,
                  {
                    height: `${percentage}%`,
                    backgroundColor: "#FFFFFF",
                  },
                ]}
              />
            </View>
          </LinearGradient>
          {isOverBudget && item.category !== "Savings" && (
            <View style={styles.overBudgetBadge}>
              <Text style={styles.overBudgetIcon}>!</Text>
            </View>
          )}
        </Animated.View>
        <Text style={styles.categoryCircleLabel}>{item.category}</Text>
        <Text style={[styles.categoryCircleAmount, isOverBudget && styles.overBudgetText]}>
          {formatCurrency(item.spent, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </Text>
        <Text style={styles.categoryCircleTotal}>
          of {formatCurrency(item.total, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </Text>
        {isOverBudget && <Animated.Text style={[styles.overBudgetMessage, { opacity: warningFade }]}>Over budget</Animated.Text>}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Expense Item Component
const AnimatedExpenseItem: React.FC<{
  item: Expense;
  index: number;
  getCategoryColor: (category: BudgetCategory) => string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}> = ({ item, index, getCategoryColor, onEdit, onDelete }) => {
  // Handle date formatting whether it's a Date object or string
  const formattedDate = typeof item.date === "string" ? new Date(item.date).toLocaleDateString() : item.date.toLocaleDateString();

  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(20)).current;
  const currency = useSelector(selectCurrency);

  // Add states for swipe actions
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    // Staggered animation
    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(itemSlide, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.expenseItem,
        {
          opacity: itemFade,
          transform: [{ translateY: itemSlide }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} style={styles.expenseContentContainer} onPress={() => setShowActions(!showActions)}>
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
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      </TouchableOpacity>

      {showActions && (
        <View style={styles.expenseActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              setShowActions(false);
              onEdit(item);
            }}
          >
            <Text style={styles.actionButtonIcon}>✏️</Text>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              setShowActions(false);
              onDelete(item.id);
            }}
          >
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

// Scrollable tab component
interface ScrollableTabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ScrollableTab: React.FC<ScrollableTabProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.scrollableTabs}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => onTabChange(tab)} activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses = [],
  onAddExpense,
  onOpenBudget,
  onOpenSettings,
  onEditExpense,
  onOpenNeedsDetail,
  onOpenWantsDetail,
  onOpenSavingsDetail,
}) => {
  const [activeTab, setActiveTab] = useState<"All" | BudgetCategory>("All");
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  // Get budget data from Redux
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);
  const currency = useSelector(selectCurrency);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
        gradientColors: ["#5BD990", "#3DB26E"],
      },
      {
        category: "Savings",
        spent: savingsSpent,
        total: savingsBudget,
        color: BudgetColors.savings,
        gradientColors: ["#FFBA6E", "#FF9C36"],
      },
      {
        category: "Wants",
        spent: wantsSpent,
        total: wantsBudget,
        color: BudgetColors.wants,
        gradientColors: ["#837BFF", "#605BFF"],
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

  // Functions to handle expense actions
  const handleEditExpense = (expense: Expense) => {
    if (onEditExpense) {
      onEditExpense(expense);
    }
  };

  const handleDeleteExpense = (id: string) => {
    dispatch(deleteExpense(id));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        {/* <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(!showMenu)} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity> */}

        {showMenu && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onOpenBudget && onOpenBudget();
              }}
              activeOpacity={0.7}
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
              activeOpacity={0.7}
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
        <View style={styles.categoryCirclesWrapper}>
          {categorySummaries.map((item, index) => (
            <AnimatedCategoryCircle
              key={item.category}
              item={item}
              index={index}
              onOpenBudget={onOpenBudget}
              onOpenNeedsDetail={onOpenNeedsDetail}
              onOpenWantsDetail={onOpenWantsDetail}
              onOpenSavingsDetail={onOpenSavingsDetail}
            />
          ))}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollableTab
          tabs={["All", "Needs", "Savings", "Wants"]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as "All" | BudgetCategory)}
        />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          placeholderTextColor="#AAAAAA"
          value={searchQuery}
          onChangeText={setSearchQuery}
          submitBehavior="blurAndSubmit"
          returnKeyType="search"
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
          renderItem={({ item, index }) => (
            <AnimatedExpenseItem
              item={item}
              index={index}
              getCategoryColor={getCategoryColor}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.expensesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity activeOpacity={0.8} style={styles.addButton} onPress={onAddExpense}>
        <LinearGradient colors={["#4CD080", "#3DB26E"]} style={styles.addButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.addButtonIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
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
    marginBottom: responsiveMargin(24),
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.5,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ADD8E6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIcon: {
    fontSize: scaleFontSize(18),
    color: "#555",
  },
  menuDropdown: {
    position: "absolute",
    top: 50,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: responsivePadding(8),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 200,
  },
  menuItem: {
    paddingVertical: responsivePadding(10),
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
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: responsiveMargin(6),
  },
  categoriesContainer: {
    marginBottom: responsiveMargin(20),
  },
  categoryCirclesWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingVertical: responsivePadding(10),
  },
  categoryCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCircle: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(25) / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  circleProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    opacity: 0.3,
  },
  circleProgress: {
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  categoryPercentage: {
    fontSize: scaleFontSize(18),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  categoryCircleLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#333",
    marginTop: responsiveMargin(8),
    textAlign: "center",
  },
  categoryCircleAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "700",
    color: "#333",
    marginTop: responsiveMargin(4),
    textAlign: "center",
  },
  categoryCircleTotal: {
    fontSize: scaleFontSize(12),
    color: "#777",
    textAlign: "center",
  },
  categoriesList: {
    paddingRight: responsivePadding(16),
  },
  categoryCard: {
    width: wp(55),
    borderRadius: 20,
    padding: responsivePadding(16),
    marginRight: responsiveMargin(16),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: responsiveMargin(4),
  },
  categoryAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: responsiveMargin(12),
  },
  categoryAmount: {
    fontSize: scaleFontSize(24),
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: responsiveMargin(4),
  },
  categoryTotal: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
  },
  progressBarContainer: {
    marginTop: responsiveMargin(6),
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  tabsContainer: {
    marginBottom: responsiveMargin(16),
  },
  scrollableTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: responsivePadding(4),
  },
  tab: {
    flex: 1,
    paddingVertical: responsivePadding(10),
    alignItems: "center",
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: "#F0F5FF",
  },
  tabText: {
    fontSize: scaleFontSize(14),
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: BudgetColors.wants,
    fontWeight: "600",
  },
  searchContainer: {
    marginBottom: responsiveMargin(16),
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    fontSize: scaleFontSize(16),
    color: "#333",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  expensesList: {
    paddingBottom: responsiveMargin(80),
  },
  expenseItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: responsiveMargin(12),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: "hidden",
  },
  expenseContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsivePadding(16),
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(4),
  },
  expenseSubDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseCategory: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginRight: responsiveMargin(8),
  },
  expenseDate: {
    fontSize: scaleFontSize(14),
    color: "#888",
  },
  expenseAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  expenseActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: responsivePadding(12),
    paddingBottom: responsivePadding(12),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsivePadding(6),
    paddingHorizontal: responsivePadding(10),
    borderRadius: 8,
    marginLeft: responsiveMargin(8),
  },
  editButton: {
    backgroundColor: "#F0F5FF",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
  },
  actionButtonIcon: {
    fontSize: scaleFontSize(14),
    marginRight: responsiveMargin(4),
  },
  actionButtonText: {
    fontSize: scaleFontSize(12),
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: responsiveMargin(50),
  },
  emptyText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#888",
    marginBottom: responsiveMargin(8),
  },
  emptySubText: {
    fontSize: scaleFontSize(14),
    color: "#AAA",
    textAlign: "center",
    paddingHorizontal: responsivePadding(32),
  },
  addButton: {
    position: "absolute",
    bottom: responsiveMargin(24),
    right: responsiveMargin(24),
    elevation: 5,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 28,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonIcon: {
    fontSize: scaleFontSize(32),
    color: "#FFFFFF",
    lineHeight: 50,
  },
  overBudgetBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FF4040",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  overBudgetIcon: {
    fontSize: scaleFontSize(12),
    fontWeight: "900",
    color: "#FF4040",
    textAlign: "center",
  },
  overBudgetText: {
    color: "#FF4040",
  },
  overBudgetMessage: {
    fontSize: scaleFontSize(12),
    fontWeight: "500",
    color: "#FF4040",
    marginTop: responsiveMargin(2),
    textAlign: "center",
  },
});

export default ExpensesList;
