import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory, CategorySummary, Expense } from "../app/types/budget";
import { formatCurrency } from "../app/utils/currency";
import { filterExpensesByMonth, getAvailableMonths, getCurrentMonthYearKey } from "../app/utils/dateUtils";
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
  selectedMonth?: string;
  onMonthChange?: (monthKey: string) => void;
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

// Month Selector Component - Enhanced with horizontal scrolling
const MonthSelector: React.FC<{
  months: { key: string; display: string }[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
}> = ({ months, selectedMonth, onSelectMonth }) => {
  // Create a flat list ref to programmatically scroll
  const scrollRef = useRef<FlatList>(null);

  // Find the current index of the selected month
  const currentIndex = months.findIndex((m) => m.key === selectedMonth);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;

  // Scroll to selected month when component mounts or selection changes
  useEffect(() => {
    if (scrollRef.current && validIndex >= 0) {
      // Use a timeout to ensure the list has rendered
      setTimeout(() => {
        scrollRef.current?.scrollToIndex({
          index: validIndex,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }, 100);
    }
  }, [validIndex]);

  // If no months available, don't render anything
  if (!months.length) return null;

  // Handle scroll error (when trying to scroll to an index that doesn't exist yet)
  const handleScrollToIndexFailed = () => {
    // This happens if the list hasn't fully rendered yet
    setTimeout(() => {
      if (scrollRef.current && validIndex >= 0) {
        scrollRef.current.scrollToIndex({
          index: Math.min(validIndex, months.length - 1),
          animated: false,
          viewPosition: 0.5,
        });
      }
    }, 200);
  };

  return (
    <View style={styles.monthSelectorContainer}>
      <FlatList
        ref={scrollRef}
        data={months}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.monthItem, item.key === selectedMonth && styles.monthItemSelected]}
            onPress={() => onSelectMonth(item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.monthItemText, item.key === selectedMonth && styles.monthItemTextSelected]} numberOfLines={1}>
              {item.display}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.monthsList}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        initialScrollIndex={validIndex}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate width of each item
          offset: 120 * index,
          index,
        })}
      />
    </View>
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
  selectedMonth = getCurrentMonthYearKey(),
  onMonthChange = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<"All" | BudgetCategory>("All");
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [temporarySelectedDate, setTemporarySelectedDate] = useState<Date>(new Date());
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const monthModalAnim = useRef(new Animated.Value(0)).current;

  // Get budget data from Redux
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);
  const currency = useSelector(selectCurrency);

  // Get selected date from the selected month string
  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }, [selectedMonth]);

  // Get available months from expenses
  const availableMonths = useMemo(() => {
    // Get months from actual expenses
    const months = getAvailableMonths(expenses);

    // For testing - ensure we have at least a few months regardless of expense data
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Add the current month if it doesn't exist
    const currentMonthKey = `${currentYear}-${currentMonth}`;
    if (!months.some((m) => m.key === currentMonthKey)) {
      months.push({
        key: currentMonthKey,
        display: new Date(currentYear, currentMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }

    // Add previous months
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

    // Add future months
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

    // Resort the months
    return months.sort((a, b) => {
      const [yearA, monthA] = a.key.split("-").map(Number);
      const [yearB, monthB] = b.key.split("-").map(Number);

      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
  }, [expenses]);

  // Handle date change from the date picker
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);

    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const newMonthKey = `${year}-${month}`;

      console.log("Date selected:", date, "New month key:", newMonthKey);
      onMonthChange(newMonthKey);
    }
  };

  // Handle month selection from the month modal
  const handleMonthSelect = (monthKey: string) => {
    // Close the modal with animation
    Animated.timing(monthModalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowMonthModal(false);
    });

    onMonthChange(monthKey);
  };

  // Open month modal with animation
  const openMonthModal = () => {
    setShowMonthModal(true);
    setTemporarySelectedDate(selectedDate); // Initialize with current selection
    Animated.timing(monthModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close month modal with animation
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

  // Filter expenses by the selected month
  const monthlyExpenses = useMemo(() => filterExpensesByMonth(expenses, selectedMonth), [expenses, selectedMonth]);

  // Calculate category summaries based on monthly expenses
  const categorySummaries: CategorySummary[] = useMemo(() => {
    // Calculate budget amounts based on user's income and budget rule percentages
    const needsBudget = monthlyIncome * (budgetRule.needs / 100);
    const savingsBudget = monthlyIncome * (budgetRule.savings / 100);
    const wantsBudget = monthlyIncome * (budgetRule.wants / 100);

    // Calculate spent amounts in each category for the selected month
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
  }, [monthlyExpenses, monthlyIncome, budgetRule]);

  // Filter expenses based on active tab and search query
  const filteredExpenses = useMemo(() => {
    let filtered = activeTab === "All" ? monthlyExpenses : monthlyExpenses.filter((expense) => expense.category === activeTab);

    // Apply search filter if query exists
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
        <TouchableOpacity style={styles.monthButton} onPress={openMonthModal} activeOpacity={0.8}>
          <View style={styles.currentMonthContainer}>
            <Text style={styles.currentMonthText}>{selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Horizontal Month Selector */}
      {/* <MonthSelector months={availableMonths} selectedMonth={selectedMonth} onSelectMonth={onMonthChange} /> */}

      {/* Month Selection Modal */}
      {showMonthModal && (
        <Animated.View
          style={[
            styles.monthModalOverlay,
            {
              opacity: monthModalAnim,
            },
          ]}
        >
          <TouchableOpacity style={styles.monthModalBackdrop} onPress={closeMonthModal} activeOpacity={1}>
            <Animated.View
              style={[
                styles.monthModalContainer,
                {
                  transform: [
                    {
                      translateY: monthModalAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [300, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.monthModalHeader}>
                <Text style={styles.monthModalTitle}>Select Month</Text>
                <TouchableOpacity onPress={closeMonthModal} style={styles.monthModalCloseButton}>
                  <Text style={styles.monthModalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {Platform.OS === "ios" ? (
                <View style={styles.monthPickerContainer}>
                  <DateTimePicker
                    value={temporarySelectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (date) {
                        // For iOS, we need to preserve the day while only changing month/year
                        const newDate = new Date(temporarySelectedDate);
                        newDate.setFullYear(date.getFullYear());
                        newDate.setMonth(date.getMonth());
                        setTemporarySelectedDate(newDate);
                      }
                    }}
                    maximumDate={new Date(2030, 11, 31)}
                    minimumDate={new Date(2020, 0, 1)}
                  />

                  <TouchableOpacity
                    style={styles.monthModalDoneButton}
                    onPress={() => {
                      // Apply the selected date
                      const year = temporarySelectedDate.getFullYear();
                      const month = temporarySelectedDate.getMonth() + 1;
                      const newMonthKey = `${year}-${month}`;
                      handleMonthSelect(newMonthKey);
                    }}
                  >
                    <Text style={styles.monthModalDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Android implementation - create a simple month/year picker
                <View style={styles.androidMonthYearPickerContainer}>
                  <View style={styles.androidPickerRow}>
                    <TouchableOpacity
                      style={styles.androidPickerArrow}
                      onPress={() => {
                        const newDate = new Date(temporarySelectedDate);
                        newDate.setFullYear(temporarySelectedDate.getFullYear() - 1);
                        setTemporarySelectedDate(newDate);
                      }}
                    >
                      <Text style={styles.androidPickerArrowText}>◀</Text>
                    </TouchableOpacity>

                    <Text style={styles.androidPickerYearText}>{temporarySelectedDate.getFullYear()}</Text>

                    <TouchableOpacity
                      style={styles.androidPickerArrow}
                      onPress={() => {
                        const newDate = new Date(temporarySelectedDate);
                        newDate.setFullYear(temporarySelectedDate.getFullYear() + 1);
                        setTemporarySelectedDate(newDate);
                      }}
                    >
                      <Text style={styles.androidPickerArrowText}>▶</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.androidMonthsGrid}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const isSelected = temporarySelectedDate.getMonth() === i;

                      return (
                        <TouchableOpacity
                          key={i}
                          style={[styles.androidMonthButton, isSelected && styles.androidMonthButtonSelected]}
                          onPress={() => {
                            const newDate = new Date(temporarySelectedDate);
                            newDate.setMonth(i);
                            setTemporarySelectedDate(newDate);
                          }}
                        >
                          <Text style={[styles.androidMonthButtonText, isSelected && styles.androidMonthButtonTextSelected]}>{monthNames[i]}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.monthModalDoneButton}
                    onPress={() => {
                      // Apply the selected date
                      const year = temporarySelectedDate.getFullYear();
                      const month = temporarySelectedDate.getMonth() + 1;
                      const newMonthKey = `${year}-${month}`;
                      handleMonthSelect(newMonthKey);
                    }}
                  >
                    <Text style={styles.monthModalDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      )}

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
                // The date is already selected in the picker
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
    marginBottom: responsiveMargin(16),
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.5,
  },
  monthButton: {
    paddingVertical: responsivePadding(8),
    paddingHorizontal: responsivePadding(12),
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  currentMonthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currentMonthText: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
  },
  calendarIcon: {
    fontSize: scaleFontSize(16),
    marginLeft: responsiveMargin(8),
    color: BudgetColors.wants,
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
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: "#CCCCCC",
  },
  monthSelectorContainer: {
    marginBottom: responsiveMargin(16),
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: responsivePadding(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  monthsList: {
    paddingHorizontal: responsivePadding(4),
  },
  monthItem: {
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(16),
    marginHorizontal: responsiveMargin(4),
    borderRadius: 16,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  monthItemSelected: {
    backgroundColor: "rgba(96, 91, 255, 0.08)",
  },
  monthItemText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#777",
  },
  monthItemTextSelected: {
    fontWeight: "600",
    color: BudgetColors.wants,
  },
  monthNavigationButton: {
    padding: responsivePadding(8),
    borderRadius: 8,
  },
  monthNavigationIcon: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.wants,
  },
  selectedMonthContainer: {
    flex: 1,
    alignItems: "center",
  },
  selectedMonthText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  datePickerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerHeader: {
    backgroundColor: "#FFFFFF",
    padding: responsivePadding(16),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerButton: {
    padding: responsivePadding(8),
    borderRadius: 8,
  },
  datePickerCancel: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  datePickerDone: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: BudgetColors.wants,
  },
  monthModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  monthModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  monthModalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: responsivePadding(16),
    paddingBottom: responsivePadding(32),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  monthPickerContainer: {
    padding: responsivePadding(20),
    alignItems: "center",
  },
  monthModalDoneButton: {
    marginTop: responsivePadding(20),
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(30),
    backgroundColor: BudgetColors.wants,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthModalDoneButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  monthModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsivePadding(20),
    paddingBottom: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  monthModalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  monthModalCloseButton: {
    padding: responsivePadding(8),
  },
  monthModalCloseIcon: {
    fontSize: scaleFontSize(18),
    color: "#999",
  },
  monthModalList: {
    paddingHorizontal: responsivePadding(16),
    paddingBottom: responsivePadding(16),
  },
  monthModalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsivePadding(14),
    paddingHorizontal: responsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  monthModalItemSelected: {
    backgroundColor: "rgba(96, 91, 255, 0.05)",
  },
  monthModalItemText: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  monthModalItemTextSelected: {
    color: BudgetColors.wants,
    fontWeight: "600",
  },
  monthModalItemCheckmark: {
    fontSize: scaleFontSize(18),
    color: BudgetColors.wants,
    fontWeight: "600",
  },
  androidMonthYearPickerContainer: {
    padding: responsivePadding(20),
    alignItems: "center",
    width: "100%",
  },
  androidPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveMargin(20),
    width: "100%",
  },
  androidPickerArrow: {
    padding: responsivePadding(12),
  },
  androidPickerArrowText: {
    fontSize: scaleFontSize(18),
    color: BudgetColors.wants,
    fontWeight: "600",
  },
  androidPickerYearText: {
    fontSize: scaleFontSize(22),
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: responsivePadding(24),
  },
  androidMonthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  androidMonthButton: {
    width: "25%",
    padding: responsivePadding(12),
    margin: responsiveMargin(4),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  androidMonthButtonSelected: {
    backgroundColor: BudgetColors.wants,
  },
  androidMonthButtonText: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  androidMonthButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default ExpensesList;
