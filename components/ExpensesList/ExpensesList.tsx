import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BudgetColors } from "../../app/constants/Colors";
import { BudgetCategory, CategorySummary, Expense } from "../../app/types/budget";
import { filterExpensesByMonth, getAvailableMonths, getCurrentMonthYearKey } from "../../app/utils/dateUtils";
import { selectBudgetRule, selectMonthlyIncome } from "../../redux/slices/budgetSlice";
import { deleteExpense } from "../../redux/slices/expenseSlice";
import { AnimatedCategoryCircle, AnimatedExpenseItem, MonthPickerModal, ScrollableTab } from "./index";
import styles from "./styles";

interface ExpensesListProps {
  expenses?: Expense[];
  onAddExpense?: () => void;
  onOpenBudget?: () => void;
  onOpenSettings?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onOpenNeedsDetail?: () => void;
  onOpenWantsDetail?: () => void;
  onOpenSavingsDetail?: () => void;
  selectedMonth?: string;
  onMonthChange?: (monthKey: string) => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses = [],
  onAddExpense,
  onOpenBudget,
  onOpenSettings,
  onEditExpense,
  onOpenNeedsDetail,
  onOpenWantsDetail,
  onOpenSavingsDetail,
  selectedMonth = getCurrentMonthYearKey(),
  onMonthChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<"All" | BudgetCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [temporarySelectedDate, setTemporarySelectedDate] = useState<Date>(new Date());
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const monthModalAnim = useRef(new Animated.Value(0)).current;

  const monthlyIncome = useSelector(selectMonthlyIncome);
  const additionalIncome = useSelector((state: any) => state.budget.additionalIncome) || [];

  // Filter additional income by selected month
  const monthlyAdditionalIncome = useMemo(() => {
    return additionalIncome.filter((income: any) => {
      const incomeDate = new Date(income.date);
      const incomeMonthKey = `${incomeDate.getFullYear()}-${incomeDate.getMonth() + 1}`;
      return incomeMonthKey === selectedMonth;
    });
  }, [additionalIncome, selectedMonth]);

  const totalAdditionalIncome = monthlyAdditionalIncome.reduce((total: any, income: any) => total + income.amount, 0);
  const totalIncome = monthlyIncome + totalAdditionalIncome;
  const budgetRule = useSelector(selectBudgetRule);

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  const availableMonths = useMemo(() => {
    const months = getAvailableMonths(expenses);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMonthKey = `${currentYear}-${currentMonth}`;
    if (!months.some((m) => m.key === currentMonthKey)) {
      months.push({
        key: currentMonthKey,
        display: new Date(currentYear, currentMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }

    for (let i = 1; i <= 5; i++) {
      let prevMonth = currentMonth - i;
      let prevYear = currentYear;

      if (prevMonth <= 0) {
        prevMonth = 12 + prevMonth;
        prevYear = currentYear - 1;
      }

      const prevMonthKey = `${prevYear}-${prevMonth}`;
      if (!months.some((m) => m.key === prevMonthKey)) {
        const prevDate = new Date(prevYear, prevMonth - 1, 1);
        months.push({
          key: prevMonthKey,
          display: prevDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        });
      }
    }

    for (let i = 1; i <= 2; i++) {
      let nextMonth = currentMonth + i;
      let nextYear = currentYear;

      if (nextMonth > 12) {
        nextMonth = nextMonth - 12;
        nextYear = currentYear + 1;
      }

      const nextMonthKey = `${nextYear}-${nextMonth}`;
      if (!months.some((m) => m.key === nextMonthKey)) {
        const nextDate = new Date(nextYear, nextMonth - 1, 1);
        months.push({
          key: nextMonthKey,
          display: nextDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        });
      }
    }

    return months.sort((a, b) => {
      const [yearA, monthA] = a.key.split("-").map(Number);
      const [yearB, monthB] = b.key.split("-").map(Number);

      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
  }, [expenses]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);

    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const newMonthKey = `${year}-${month}`;

      onMonthChange(newMonthKey);
    }
  };

  const handleMonthSelect = (monthKey: string) => {
    Animated.timing(monthModalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMonthModal(false);
    });

    onMonthChange(monthKey);
  };

  const openMonthModal = () => {
    setShowMonthModal(true);
    setTemporarySelectedDate(selectedDate);

    monthModalAnim.setValue(0);

    Animated.timing(monthModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeMonthModal = () => {
    Animated.timing(monthModalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMonthModal(false);
    });
  };

  useEffect(() => {
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

  const monthlyExpenses = useMemo(() => filterExpensesByMonth(expenses, selectedMonth), [expenses, selectedMonth]);

  const categorySummaries: CategorySummary[] = useMemo(() => {
    const needsBudget = totalIncome * (budgetRule.needs / 100);
    const savingsBudget = totalIncome * (budgetRule.savings / 100);
    const wantsBudget = totalIncome * (budgetRule.wants / 100);

    const needsSpent = monthlyExpenses.filter((exp) => exp.category === "Needs").reduce((sum, exp) => sum + exp.amount, 0);
    const savingsSpent = monthlyExpenses.filter((exp) => exp.category === "Savings").reduce((sum, exp) => sum + exp.amount, 0);
    const wantsSpent = monthlyExpenses.filter((exp) => exp.category === "Wants").reduce((sum, exp) => sum + exp.amount, 0);

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
  }, [monthlyExpenses, totalIncome, budgetRule, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    let filtered = activeTab === "All" ? monthlyExpenses : monthlyExpenses.filter((expense) => expense.category === activeTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((expense) => expense.title.toLowerCase().includes(query) || expense.subcategory.toLowerCase().includes(query));
    }

    return filtered;
  }, [monthlyExpenses, activeTab, searchQuery]);

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
        <TouchableOpacity style={styles.monthButton} onPress={openMonthModal} activeOpacity={0.8}>
          <View style={styles.currentMonthContainer}>
            <Text style={styles.currentMonthText}>{selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Month Selection Modal */}
      <MonthPickerModal
        visible={showMonthModal}
        onClose={closeMonthModal}
        onMonthSelect={handleMonthSelect}
        temporarySelectedDate={temporarySelectedDate}
        setTemporarySelectedDate={setTemporarySelectedDate}
        monthModalAnim={monthModalAnim}
      />

      {/* Date Picker for iOS */}
      {showDatePicker && Platform.OS === "ios" && (
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.datePickerButton}>
              <Text style={styles.datePickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(false);
              }}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              if (date) {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const newMonthKey = `${year}-${month}`;
                onMonthChange(newMonthKey);
              }
            }}
            maximumDate={new Date(2030, 11, 31)}
            minimumDate={new Date(2020, 0, 1)}
          />
        </View>
      )}

      {/* Date Picker for Android */}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date(2030, 11, 31)}
          minimumDate={new Date(2020, 0, 1)}
        />
      )}

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
          <Text style={styles.emptySubText}>
            {searchQuery
              ? "Try a different search term"
              : monthlyExpenses.length === 0
              ? `No expenses for ${availableMonths.find((m) => m.key === selectedMonth)?.display || "the selected month"}`
              : "No expenses match your current filters"}
          </Text>
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
        <LinearGradient colors={["#7FAFF5", "#4C7ED9"]} style={styles.addButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.addButtonIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ExpensesList;
