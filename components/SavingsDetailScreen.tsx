import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { formatCurrency } from "../app/utils/currency";
import { filterExpensesByMonth, getCurrentMonthYearKey } from "../app/utils/dateUtils";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { calculateMonthlyContribution, getContributionStatus } from "../app/utils/savingsCalculator";
import {
  addCategory,
  CategoryItem,
  SavingsGoal,
  selectBudgetRule,
  selectCategoriesByType,
  selectCurrency,
  selectDenominationFormat,
  selectMonthlyIncome,
  selectSavingsGoals,
  setSavingsGoal,
} from "../redux/slices/budgetSlice";
import { selectExpenses } from "../redux/slices/expenseSlice";
import { RootState } from "../redux/types";

interface SavingsDetailScreenProps {
  onBackPress?: () => void;
  selectedMonth?: string;
}

interface GoalSettingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (amount: number, note?: string, targetDate?: string) => void;
  categoryId: string;
  categoryName: string;
  currentAmount?: number;
  currentNote?: string;
  currentTargetDate?: string;
  currency: any;
}

const GoalSettingModal: React.FC<GoalSettingModalProps> = ({
  visible,
  onClose,
  onSave,
  categoryId,
  categoryName,
  currentAmount = 0,
  currentNote = "",
  currentTargetDate = "",
  currency,
}) => {
  const [amount, setAmount] = useState(currentAmount.toString());
  const [note, setNote] = useState(currentNote);
  const [targetDate, setTargetDate] = useState(currentTargetDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get total amount already saved for this category
  const totalSavedForCategory = useSelector((state: RootState) => {
    const expenses = selectExpenses(state) || [];
    return expenses.filter((expense) => expense.subcategory === categoryName).reduce((total, expense) => total + expense.amount, 0);
  });

  // Calculate estimated monthly contribution
  const estimatedMonthlyContribution = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !targetDate) {
      return null;
    }

    const { monthlyAmount, monthsRemaining } = calculateMonthlyContribution(numAmount, totalSavedForCategory, targetDate);

    return { monthlyAmount, monthsRemaining };
  }, [amount, targetDate, totalSavedForCategory]);

  const formatTargetDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";

    const [month, year] = dateString.split("/");
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${year}`;
    }
    return dateString;
  };

  useEffect(() => {
    if (visible) {
      setAmount(currentAmount.toString());
      setNote(currentNote);

      if (currentTargetDate) {
        try {
          const [month, year] = currentTargetDate.split("/").map(Number);
          if (!isNaN(month) && !isNaN(year)) {
            const date = new Date(year, month - 1);
            setSelectedDate(date);
            setTargetDate(currentTargetDate);
          } else {
            setSelectedDate(null);
            setTargetDate("");
          }
        } catch {
          setSelectedDate(null);
          setTargetDate("");
        }
      } else {
        setSelectedDate(null);
        setTargetDate("");
      }
    }
  }, [visible, currentAmount, currentNote, currentTargetDate]);

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");

    if (date) {
      setSelectedDate(date);

      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const formattedDate = `${month < 10 ? "0" + month : month}/${year}`;
      setTargetDate(formattedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const minimumDate = useMemo(() => {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number for your goal amount.");
      return;
    }

    onSave(numAmount, note, targetDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Goal for {categoryName}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Goal Amount ({currency.symbol})</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Target Date (Optional)</Text>
            <TouchableOpacity style={[styles.input, styles.datePickerButton]} onPress={showDatepicker}>
              <Text style={targetDate ? styles.dateText : styles.placeholderText}>
                {targetDate ? formatTargetDateForDisplay(targetDate) : "Select a target date"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || minimumDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                textColor="#333"
                themeVariant="light"
                style={styles.iosDatePicker}
                minimumDate={minimumDate}
              />
            )}
          </View>

          {/* Show estimated monthly contribution if both amount and target date are set */}
          {estimatedMonthlyContribution && (
            <View style={styles.estimatedContributionContainer}>
              <Text style={styles.estimatedContributionTitle}>Estimated Monthly Contribution</Text>
              <Text style={styles.estimatedContributionAmount}>{formatCurrency(estimatedMonthlyContribution.monthlyAmount, currency)}/month</Text>
              {estimatedMonthlyContribution.monthsRemaining > 0 && (
                <Text style={styles.estimatedMonthsText}>
                  Over the next {estimatedMonthlyContribution.monthsRemaining}{" "}
                  {estimatedMonthlyContribution.monthsRemaining === 1 ? "month" : "months"}
                </Text>
              )}
              <Text style={styles.estimatedHelperText}>This is how much you should save each month to reach your goal on time.</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Note (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="Why is this goal important to you?"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SavingsDetailScreen: React.FC<SavingsDetailScreenProps> = ({ onBackPress, selectedMonth = getCurrentMonthYearKey() }) => {
  const dispatch = useDispatch();
  const expenses = useSelector(selectExpenses) || [];
  const monthlyIncome = useSelector(selectMonthlyIncome) || 0;
  const budgetRule = useSelector(selectBudgetRule) || { needs: 50, savings: 30, wants: 20 };
  const currency = useSelector(selectCurrency) || { code: "USD", symbol: "$", name: "US Dollar" };
  const denominationFormat = useSelector(selectDenominationFormat);
  const savingsCategories = useSelector((state: RootState) => selectCategoriesByType(state, "Savings")) || [];
  const savingsGoals = useSelector(selectSavingsGoals) || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem>({ id: "", name: "", icon: "", type: "Savings" });
  const [selectedCategoryGoal, setSelectedCategoryGoal] = useState<SavingsGoal | null>(null);

  const monthlyExpenses = React.useMemo(
    () => filterExpensesByMonth(expenses || [], selectedMonth || getCurrentMonthYearKey()),
    [expenses, selectedMonth]
  );

  const savingsBudgetAmount = (monthlyIncome || 0) * ((budgetRule?.savings || 30) / 100);

  const savingsSpent = useMemo(() => {
    return monthlyExpenses.filter((expense) => expense.category === "Savings").reduce((total, expense) => total + expense.amount, 0);
  }, [monthlyExpenses]);

  const remainingAmount = savingsBudgetAmount - savingsSpent;

  const percentageUsed = Math.round((savingsBudgetAmount > 0 ? savingsSpent / savingsBudgetAmount : 0) * 100 * 10) / 10;

  const calculateTotalSavingsByCategory = useMemo(() => {
    return (savingsCategories || []).reduce((result, category) => {
      const totalSaved = expenses
        .filter((expense) => expense.category === "Savings" && expense.subcategory === category.name)
        .reduce((sum, expense) => sum + expense.amount, 0);

      result[category.id] = totalSaved;
      return result;
    }, {} as Record<string, number>);
  }, [expenses, savingsCategories]);

  const categorySpending = useMemo(() => {
    const totalSavingsSpent = savingsSpent > 0 ? savingsSpent : 1;

    return (savingsCategories || []).map((category) => {
      const spent = monthlyExpenses.filter((expense) => expense.subcategory === category.name).reduce((total, expense) => total + expense.amount, 0);

      const totalSpent = calculateTotalSavingsByCategory[category.id] || 0;

      const percentage = totalSavingsSpent > 0 ? Math.round((spent / totalSavingsSpent) * 100 * 10) / 10 : 0;

      const budgetPercentage = savingsBudgetAmount > 0 ? Math.round((spent / savingsBudgetAmount) * 100 * 10) / 10 : 0;

      const goal = category.id && savingsGoals ? savingsGoals[category.id] : undefined;

      // Calculate monthly contribution needed to reach the goal
      let monthlyContribution = 0;
      let monthsRemaining = 0;
      let contributionStatus: "ahead" | "on-track" | "behind" = "on-track";

      if (goal && goal.targetDate) {
        const calculation = calculateMonthlyContribution(goal.amount, totalSpent, goal.targetDate);
        monthlyContribution = calculation.monthlyAmount;
        monthsRemaining = calculation.monthsRemaining;

        // Check if this month's contribution is on track
        const thisMonthContribution = spent; // How much saved this month
        contributionStatus = getContributionStatus(monthlyContribution, thisMonthContribution);
      }

      return {
        ...category,
        spent,
        totalSpent,
        percentage,
        budgetPercentage,
        goal,
        monthlyContribution,
        monthsRemaining,
        contributionStatus,
      };
    });
  }, [monthlyExpenses, savingsCategories, savingsBudgetAmount, savingsGoals, savingsSpent, selectedMonth, calculateTotalSavingsByCategory]);

  const openGoalSettingModal = (category: CategoryItem) => {
    setSelectedCategory(category);
    setSelectedCategoryGoal(savingsGoals[category.id] || null);
    setModalVisible(true);
  };

  const saveGoal = (amount: number, note?: string, targetDate?: string) => {
    if (selectedCategory.id) {
      // Calculate the total amount already saved for this category
      const totalSpent = calculateTotalSavingsByCategory[selectedCategory.id] || 0;

      // Calculate monthly contribution needed to reach goal
      const { monthlyAmount, monthsRemaining } = calculateMonthlyContribution(amount, totalSpent, targetDate);

      dispatch(
        setSavingsGoal({
          categoryId: selectedCategory.id,
          goal: {
            amount,
            note,
            targetDate,
            monthlyContribution: monthlyAmount,
            monthsRemaining,
          },
        })
      );
    }
  };

  const currentDate = new Date();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  useEffect(() => {
    if (selectedCategory.id) {
      setSelectedCategoryGoal(savingsGoals[selectedCategory.id]);
    }
  }, [selectedCategory, savingsGoals]);

  const formatTargetDate = (dateString: string): string => {
    if (!dateString) return "";

    const [month, year] = dateString.split("/");
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${year}`;
    }
    return dateString;
  };

  // Initialize with all categories collapsed by default
  const [collapsedContributions, setCollapsedContributions] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    // Set all categories to collapsed (true) by default
    savingsCategories.forEach((category) => {
      initialState[category.id] = true;
    });
    return initialState;
  });

  // Update to use denomination format with currency display
  const formatWithDenomination = (amount: number) => {
    return formatCurrency(amount, currency, denominationFormat);
  };

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("💰");

  // Common icons specifically for savings categories
  const SAVINGS_ICONS = ["💰", "📈", "🏦", "🧰", "🏠", "🎓", "💸", "💼", "🚗", "✈️", "🏥", "👪", "🏆", "💍", "🎁"];

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Category name cannot be empty");
      return;
    }

    const id = `savings-${newCategoryName.toLowerCase().replace(/\s+/g, "-")}`;
    dispatch(
      addCategory({
        id,
        name: newCategoryName,
        icon: selectedIcon,
        type: "Savings", // Always set to Savings
      })
    );

    setNewCategoryName("");
    setSelectedIcon("💰");
    setShowAddCategory(false);

    // Show success message
    Alert.alert("Success", `Savings category "${newCategoryName}" has been added.`, [{ text: "OK" }], { cancelable: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Savings ({budgetRule.savings}%)</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Budget Card */}
        <View style={styles.budgetCard}>
          <Text style={styles.monthLabel}>
            {monthName} {year}
          </Text>

          <View style={styles.amountContainer}>
            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Saved</Text>
              <Text style={styles.spentAmount}>{formatWithDenomination(savingsSpent)}</Text>
            </View>

            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Goal</Text>
              <Text style={styles.allocatedAmount}>{formatWithDenomination(savingsBudgetAmount)}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, percentageUsed)}%` }]} />
          </View>

          <View style={styles.progressInfoContainer}>
            <Text style={styles.percentageText}>{percentageUsed}% of goal</Text>
            <Text style={styles.remainingText}>{formatWithDenomination(remainingAmount)} more to goal</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Savings Categories</Text>
            <TouchableOpacity style={styles.addCategoryButton} onPress={() => setShowAddCategory(true)} activeOpacity={0.7}>
              <LinearGradient colors={["#FFBA6E", "#FF9C36"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addCategoryButtonGradient}>
                <Text style={styles.addCategoryButtonText}>+ Add Category</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {categorySpending.map((category) => {
            const goal = category.goal;

            // Use a separate state for category expansion
            const isExpanded = !collapsedContributions[category.id];
            // Calculate goal progress percentage
            const goalProgressPercentage = goal ? Math.round((category.totalSpent / goal.amount) * 100 * 10) / 10 : 0;
            // Whether the goal is achieved
            const isGoalAchieved = goal && goal.amount <= category.totalSpent;

            return (
              <View key={category.id} style={styles.categoryItem}>
                {/* Accordion Header - Always visible */}
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => {
                    const newState = { ...collapsedContributions };
                    newState[category.id] = !newState[category.id];
                    setCollapsedContributions(newState);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryHeaderRow}>
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <View style={styles.categoryMainInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {goal ? (
                        <View style={styles.miniProgressContainer}>
                          <View style={styles.miniProgressBar}>
                            <View
                              style={[
                                styles.miniProgressFill,
                                {
                                  width: `${Math.min(100, goalProgressPercentage)}%`,
                                  backgroundColor: isGoalAchieved ? "#4CAF50" : BudgetColors.savings,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.miniProgressText}>
                            {goalProgressPercentage}% {isGoalAchieved && "🎉"}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.noGoalText}>No goal set</Text>
                      )}
                    </View>
                    <View style={styles.categoryAmountContainer}>
                      <Text style={styles.categoryAmount}>{formatWithDenomination(category.spent)}</Text>
                      <Text style={styles.expandIndicator}>{isExpanded ? "▲" : "▼"}</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Accordion Content - Only visible when expanded */}
                {isExpanded && (
                  <View style={styles.accordionContent}>
                    {/* Description */}
                    {category.name === "Emergency Fund" ||
                    category.name === "Investments" ||
                    category.name === "Down Payment" ||
                    category.name === "Education" ? (
                      <Text style={styles.categoryDescription}>
                        {category.name === "Emergency Fund"
                          ? "3-6 months of essential expenses"
                          : category.name === "Investments"
                          ? "Stocks, bonds, retirement accounts"
                          : category.name === "Down Payment"
                          ? "Saving for home purchase"
                          : "College funds, continuing education"}
                      </Text>
                    ) : null}

                    {/* Goal Section */}
                    <View style={styles.goalSection}>
                      {goal ? (
                        <>
                          <View style={styles.goalHeader}>
                            <View>
                              <Text style={styles.goalTitle}>Goal: {formatWithDenomination(goal.amount)}</Text>
                              {goal.targetDate && <Text style={styles.goalSubtitle}>Target: {formatTargetDate(goal.targetDate)}</Text>}
                            </View>
                            <TouchableOpacity style={styles.editGoalButton} onPress={() => openGoalSettingModal(category)}>
                              <Text style={styles.editGoalButtonText}>Edit</Text>
                            </TouchableOpacity>
                          </View>

                          {/* Goal Progress */}
                          <View style={styles.goalProgressBarContainer}>
                            <View style={[styles.goalProgressBar, { width: `${Math.min(100, (category.totalSpent / goal.amount) * 100)}%` }]} />
                          </View>

                          <View style={styles.goalProgressInfo}>
                            <Text style={styles.goalProgressText}>{goalProgressPercentage}% complete</Text>
                            <Text style={styles.goalRemainingText}>
                              {formatWithDenomination(Math.max(0, goal.amount - category.totalSpent))} remaining
                            </Text>
                          </View>

                          {/* Total saved information */}
                          <View style={styles.goalContributionInfo}>
                            <Text style={styles.goalContributionText}>
                              Total saved: {formatWithDenomination(category.totalSpent)}
                              {category.spent > 0 && ` (${formatWithDenomination(category.spent)} this month)`}
                            </Text>
                          </View>

                          {/* Monthly contribution recommendation */}
                          {category.monthlyContribution > 0 && (
                            <View style={styles.monthlyContributionContainer}>
                              <View style={styles.monthlyContributionHeader}>
                                <Text style={styles.monthlyContributionTitle}>Monthly Recommendation</Text>
                                <View
                                  style={[
                                    styles.contributionStatusIndicator,
                                    {
                                      backgroundColor:
                                        category.contributionStatus === "ahead"
                                          ? "#4CAF50"
                                          : category.contributionStatus === "on-track"
                                          ? "#FFB74D"
                                          : "#F44336",
                                    },
                                  ]}
                                />
                              </View>

                              <Text style={styles.monthlyContributionAmount}>
                                {formatWithDenomination(category.monthlyContribution)}/month (including current month)
                              </Text>

                              {category.monthsRemaining > 0 && (
                                <Text style={styles.monthsRemainingText}>
                                  {category.monthsRemaining} {category.monthsRemaining === 1 ? "month" : "months"} remaining
                                </Text>
                              )}

                              <View style={styles.contributionStatusContainer}>
                                <Text
                                  style={[
                                    styles.contributionStatusText,
                                    {
                                      color:
                                        category.contributionStatus === "ahead"
                                          ? "#4CAF50"
                                          : category.contributionStatus === "on-track"
                                          ? "#FF9800"
                                          : "#F44336",
                                    },
                                  ]}
                                >
                                  {category.contributionStatus === "ahead"
                                    ? "Ahead of schedule"
                                    : category.contributionStatus === "on-track"
                                    ? "On track"
                                    : "Behind schedule"}
                                </Text>
                              </View>

                              {/* This month's contribution progress */}
                              <View style={styles.thisMonthProgressContainer}>
                                <Text style={styles.thisMonthLabel}>This month&apos;s progress:</Text>
                                <View style={styles.thisMonthProgressBarContainer}>
                                  <View
                                    style={[
                                      styles.thisMonthProgressBar,
                                      {
                                        width: `${Math.min(100, (category.spent / category.monthlyContribution) * 100)}%`,
                                        backgroundColor:
                                          category.contributionStatus === "ahead"
                                            ? "#4CAF50"
                                            : category.contributionStatus === "on-track"
                                            ? "#FFB74D"
                                            : "#F44336",
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={styles.thisMonthProgressText}>
                                  {Math.round((category.spent / category.monthlyContribution) * 100)}% of monthly target
                                </Text>
                              </View>
                            </View>
                          )}

                          {goal.note && (
                            <View style={styles.goalNoteContainer}>
                              <Text style={styles.goalNoteText}>{goal.note}</Text>
                            </View>
                          )}

                          {isGoalAchieved && (
                            <View style={styles.goalAchievedContainer}>
                              <Text style={styles.goalAchievedIcon}>🎉</Text>
                              <Text style={styles.goalAchievedText}>
                                Congratulations! You&apos;ve achieved your savings goal for {category.name}.
                              </Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <TouchableOpacity style={styles.setGoalButton} onPress={() => openGoalSettingModal(category)}>
                          <Text style={styles.setGoalButtonText}>+ Set a goal</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* AI Insight Section */}
        <View style={styles.insightContainer}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={styles.insightTitle}>Insight</Text>
          </View>
          <Text style={styles.insightText}>
            {percentageUsed >= 100
              ? `Excellent work! You've met your savings goal for ${monthName}. Consistent saving is key to long-term financial health.`
              : percentageUsed >= 75
              ? `You're on track with your savings goal for ${monthName}. Just a bit more to reach your target!`
              : percentageUsed >= 50
              ? `You're making progress on your savings for ${monthName}, but try to allocate a bit more to stay on track with your annual goals.`
              : `Consider reviewing your budget to prioritize savings this month. Even small, consistent contributions add up over time.`}
          </Text>
        </View>
      </ScrollView>

      {/* Goal Setting Modal */}
      <GoalSettingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveGoal}
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
        currentAmount={selectedCategoryGoal?.amount || 0}
        currentNote={selectedCategoryGoal?.note || ""}
        currentTargetDate={selectedCategoryGoal?.targetDate || ""}
        currency={currency}
      />

      {/* Add Category Modal */}
      <Modal visible={showAddCategory} animationType="fade" transparent={true} onRequestClose={() => setShowAddCategory(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerView}>
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Add Savings Category</Text>
              <TouchableOpacity onPress={() => setShowAddCategory(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="e.g., Vacation Fund, New Car, etc."
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconList}>
                  {SAVINGS_ICONS.map((icon, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.iconOption, selectedIcon === icon && styles.selectedIcon]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity style={styles.saveButtonContainer} onPress={handleAddCategory} activeOpacity={0.8}>
                <LinearGradient colors={["#FFBA6E", "#FF9C36"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addCategorySaveButton}>
                  <Text style={styles.addCategorySaveButtonText}>Save Category</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: scaleFontSize(24),
    color: "#333",
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginRight: responsiveMargin(30),
  },
  scrollView: {
    flex: 1,
    padding: responsivePadding(16),
  },
  budgetCard: {
    backgroundColor: BudgetColors.savings,
    borderRadius: 20,
    padding: responsivePadding(20),
    marginBottom: responsiveMargin(20),
  },
  monthLabel: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "white",
    marginBottom: responsiveMargin(10),
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveMargin(16),
  },
  amountColumn: {
    flex: 1,
  },
  amountLabel: {
    fontSize: scaleFontSize(16),
    color: "white",
    opacity: 0.8,
  },
  spentAmount: {
    fontSize: scaleFontSize(22),
    fontWeight: "700",
    color: "white",
  },
  allocatedAmount: {
    fontSize: scaleFontSize(22),
    fontWeight: "700",
    color: "white",
    textAlign: "right",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: responsiveMargin(8),
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 4,
  },
  progressInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  percentageText: {
    fontSize: scaleFontSize(16),
    color: "white",
  },
  remainingText: {
    fontSize: scaleFontSize(16),
    color: "white",
    textAlign: "right",
  },
  categoriesSection: {
    marginBottom: responsiveMargin(20),
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(16),
  },
  sectionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
  },
  addCategoryButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  addCategoryButtonGradient: {
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(8),
    borderRadius: 14,
  },
  addCategoryButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: 0.2,
  },
  categoryItem: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  accordionHeader: {
    padding: responsivePadding(12),
    borderRadius: 8,
  },
  categoryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  categoryIcon: {
    fontSize: scaleFontSize(20),
  },
  categoryMainInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  categoryAmountContainer: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: scaleFontSize(18),
    fontWeight: "700",
  },
  expandIndicator: {
    fontSize: scaleFontSize(14),
    color: "#555",
    marginLeft: responsiveMargin(4),
    fontWeight: "bold",
  },
  accordionContent: {
    paddingTop: responsivePadding(12),
  },
  categoryDescription: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(8),
  },
  goalSection: {
    marginTop: responsiveMargin(16),
    paddingTop: responsivePadding(12),
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(8),
  },
  goalTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: BudgetColors.savings,
  },
  goalSubtitle: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  editGoalButton: {
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(6),
    backgroundColor: "#FFF8F0",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BudgetColors.savings,
  },
  editGoalButtonText: {
    fontSize: scaleFontSize(12),
    color: BudgetColors.savings,
    fontWeight: "600",
  },
  goalProgressBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: responsiveMargin(8),
  },
  goalProgressBar: {
    height: "100%",
    backgroundColor: BudgetColors.savings,
    borderRadius: 4,
  },
  goalProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveMargin(8),
  },
  goalProgressText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  goalRemainingText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  goalNoteContainer: {
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
    padding: responsivePadding(10),
    marginTop: responsiveMargin(8),
  },
  goalNoteText: {
    fontSize: scaleFontSize(14),
    color: "#666",
    fontStyle: "italic",
  },
  setGoalButton: {
    alignItems: "center",
    paddingVertical: responsivePadding(10),
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: BudgetColors.savings,
  },
  setGoalButtonText: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.savings,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: responsivePadding(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(16),
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: responsiveMargin(16),
  },
  inputLabel: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(4),
  },
  input: {
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 8,
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(10),
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: responsiveMargin(16),
  },
  modalButton: {
    flex: 1,
    paddingVertical: responsivePadding(12),
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: responsiveMargin(6),
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    fontSize: scaleFontSize(16),
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: BudgetColors.savings,
  },
  saveButtonText: {
    fontSize: scaleFontSize(16),
    color: "white",
    fontWeight: "600",
  },
  goalAchievedContainer: {
    backgroundColor: "#E6F7E9",
    borderRadius: 8,
    padding: responsivePadding(10),
    marginTop: responsiveMargin(8),
    flexDirection: "row",
    alignItems: "center",
  },
  goalAchievedIcon: {
    fontSize: scaleFontSize(20),
    marginRight: responsiveMargin(8),
  },
  goalAchievedText: {
    flex: 1,
    fontSize: scaleFontSize(14),
    color: "#2E7D32",
    fontWeight: "500",
  },
  datePickerButton: {
    justifyContent: "center",
    height: 48,
  },
  dateText: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  placeholderText: {
    fontSize: scaleFontSize(16),
    color: "#999",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: scaleFontSize(12),
    marginTop: 4,
  },
  helperText: {
    color: "#666",
    fontSize: scaleFontSize(12),
    marginTop: 4,
  },
  goalContributionInfo: {
    marginVertical: responsiveMargin(4),
  },
  goalContributionText: {
    fontSize: scaleFontSize(14),
    color: "#555",
  },
  iosDatePicker: {
    height: 180,
    width: "100%",
  },
  monthlyContributionContainer: {
    marginTop: responsiveMargin(16),
    padding: responsivePadding(12),
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
  },
  monthlyContributionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(8),
  },
  monthlyContributionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  contributionStatusIndicator: {
    width: 20,
    height: 8,
    borderRadius: 4,
    marginHorizontal: responsiveMargin(8),
  },
  monthlyContributionAmount: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  monthsRemainingText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  contributionStatusContainer: {
    marginTop: responsiveMargin(4),
  },
  contributionStatusText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  thisMonthProgressContainer: {
    marginTop: responsiveMargin(16),
    padding: responsivePadding(12),
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
  },
  thisMonthLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  thisMonthProgressBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: responsiveMargin(8),
  },
  thisMonthProgressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  thisMonthProgressText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  estimatedContributionContainer: {
    marginTop: responsiveMargin(16),
    padding: responsivePadding(12),
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
  },
  estimatedContributionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(8),
  },
  estimatedContributionAmount: {
    fontSize: scaleFontSize(14),
    color: "#666",
    fontWeight: "700",
  },
  estimatedMonthsText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  estimatedHelperText: {
    fontSize: scaleFontSize(12),
    color: "#666",
  },
  miniProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveMargin(4),
  },
  miniProgressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    flex: 1,
    marginRight: responsiveMargin(8),
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  miniProgressText: {
    fontSize: scaleFontSize(12),
    color: "#666",
    minWidth: 45,
  },
  noGoalText: {
    fontSize: scaleFontSize(13),
    color: "#999",
    marginTop: responsiveMargin(4),
    fontStyle: "italic",
  },
  modalContainerView: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalHeaderView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitleText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  modalCloseText: {
    fontSize: scaleFontSize(24),
    color: "#666",
    padding: 4,
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalScrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: scaleFontSize(16),
    backgroundColor: "#FCFCFC",
  },
  iconList: {
    flexDirection: "row",
    marginVertical: 10,
  },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    marginRight: 10,
    backgroundColor: "#FCFCFC",
  },
  selectedIcon: {
    borderColor: BudgetColors.savings,
    backgroundColor: BudgetColors.savings + "10",
  },
  iconText: {
    fontSize: scaleFontSize(20),
  },
  saveButtonContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 20,
  },
  addCategorySaveButton: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  addCategorySaveButtonText: {
    color: "#FFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  insightContainer: {
    backgroundColor: "#FFF8F0",
    borderRadius: 16,
    padding: responsivePadding(16),
    marginBottom: responsiveMargin(20),
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(8),
  },
  insightIcon: {
    fontSize: scaleFontSize(20),
    marginRight: responsiveMargin(8),
  },
  insightTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FF9C36",
  },
  insightText: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
    color: "#333",
  },
});

export default SavingsDetailScreen;
