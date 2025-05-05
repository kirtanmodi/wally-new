import React, { useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { formatCurrency } from "../app/utils/currency";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import {
  SavingsGoals,
  selectBudgetRule,
  selectCategoriesByType,
  selectCurrency,
  selectMonthlyIncome,
  selectSavingsGoals,
  setSavingsGoal,
} from "../redux/slices/budgetSlice";
import { selectExpenses } from "../redux/slices/expenseSlice";

interface SavingsDetailScreenProps {
  onBackPress?: () => void;
}

// Goal Setting Modal Component
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
            <TextInput style={styles.input} value={targetDate} onChangeText={setTargetDate} placeholder="MM/YYYY" />
          </View>

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

const SavingsDetailScreen: React.FC<SavingsDetailScreenProps> = ({ onBackPress }) => {
  const dispatch = useDispatch();
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);
  const currency = useSelector(selectCurrency);
  const expenses = useSelector(selectExpenses);
  const savingsGoals = useSelector(selectSavingsGoals) as SavingsGoals;

  // Goal setting modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string }>({ id: "", name: "" });

  // Get all savings categories
  const savingsCategories = useSelector((state) => selectCategoriesByType(state, "Savings"));

  // Calculate savings budget amount
  const savingsBudgetAmount = monthlyIncome * (budgetRule.savings / 100);

  // Calculate savings spent
  const savingsSpent = useMemo(() => {
    return expenses.filter((expense) => expense.category === "Savings").reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  // Calculate remaining amount
  const remainingAmount = savingsBudgetAmount - savingsSpent;

  // Calculate percentage used
  const percentageUsed = Math.round((savingsSpent / savingsBudgetAmount) * 100 * 10) / 10;

  // Calculate spending by category with goals
  const categorySpending = useMemo(() => {
    // Calculate total spent on savings
    const totalSavingsSpent = savingsSpent > 0 ? savingsSpent : 1; // Avoid division by zero

    return savingsCategories.map((category) => {
      const spent = expenses.filter((expense) => expense.subcategory === category.name).reduce((total, expense) => total + expense.amount, 0);

      // Calculate percentage of total savings spent (this should add up to 100%)
      const percentage = Math.round((spent / totalSavingsSpent) * 100 * 10) / 10;

      // Calculate percentage of budget for progress bar (this shows progress toward budget goal)
      const budgetPercentage = Math.round((spent / savingsBudgetAmount) * 100 * 10) / 10;

      const goal = savingsGoals[category.id]; // Get goal from redux store

      return {
        ...category,
        spent,
        percentage,
        budgetPercentage,
        goal,
      };
    });
  }, [expenses, savingsCategories, savingsBudgetAmount, savingsGoals, savingsSpent]);

  // Function to open goal setting modal
  const openGoalModal = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setModalVisible(true);
  };

  // Function to save a goal
  const saveGoal = (amount: number, note?: string, targetDate?: string) => {
    if (selectedCategory.id) {
      dispatch(
        setSavingsGoal({
          categoryId: selectedCategory.id,
          goal: {
            amount,
            note,
            targetDate,
          },
        })
      );
    }
  };

  // Get current month and year for header
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  // Get selected category data
  const selectedCategoryGoal = selectedCategory.id ? savingsGoals[selectedCategory.id] : null;

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
              <Text style={styles.spentAmount}>{formatCurrency(savingsSpent, currency)}</Text>
            </View>

            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Goal</Text>
              <Text style={styles.allocatedAmount}>{formatCurrency(savingsBudgetAmount, currency)}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, percentageUsed)}%` }]} />
          </View>

          <View style={styles.progressInfoContainer}>
            <Text style={styles.percentageText}>{percentageUsed}% of goal</Text>
            <Text style={styles.remainingText}>{formatCurrency(remainingAmount, currency)} more to goal</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Savings Categories</Text>

          {categorySpending.map((category) => {
            const goal = category.goal;

            // Progress towards goal
            const goalProgress = goal ? Math.min(100, (category.spent / goal.amount) * 100) : 0;
            const goalPercentage = goalProgress > 0 ? Math.round(goalProgress * 10) / 10 : 0;

            return (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDescription}>
                      {category.name === "Emergency Fund"
                        ? "3-6 months of essential expenses"
                        : category.name === "Investments"
                        ? "Stocks, bonds, retirement accounts"
                        : category.name === "Down Payment"
                        ? "Saving for home purchase"
                        : category.name === "Education"
                        ? "College funds, continuing education"
                        : "Long-term financial security"}
                    </Text>
                  </View>
                  <View style={styles.categoryAmountContainer}>
                    <Text style={styles.categoryAmount}>{formatCurrency(category.spent, currency)}</Text>
                    <Text style={styles.categoryPercentage}>{category.percentage}% of savings</Text>
                  </View>
                </View>

                <View style={styles.categoryProgressContainer}>
                  <View style={[styles.categoryProgressBar, { width: `${Math.min(100, category.budgetPercentage)}%` }]} />
                </View>

                {/* Goal Section */}
                <View style={styles.goalSection}>
                  {goal ? (
                    <>
                      <View style={styles.goalHeader}>
                        <View>
                          <Text style={styles.goalTitle}>Goal: {formatCurrency(goal.amount, currency)}</Text>
                          {goal.targetDate && <Text style={styles.goalSubtitle}>Target: {goal.targetDate}</Text>}
                        </View>
                        <TouchableOpacity style={styles.editGoalButton} onPress={() => openGoalModal(category.id, category.name)}>
                          <Text style={styles.editGoalButtonText}>Edit</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.goalProgressBarContainer}>
                        <View style={[styles.goalProgressBar, { width: `${goalPercentage}%` }]} />
                      </View>

                      <View style={styles.goalProgressInfo}>
                        <Text style={styles.goalProgressText}>{goalPercentage}% complete</Text>
                        <Text style={styles.goalRemainingText}>{formatCurrency(Math.max(0, goal.amount - category.spent), currency)} remaining</Text>
                      </View>

                      {goal.note && (
                        <View style={styles.goalNoteContainer}>
                          <Text style={styles.goalNoteText}>{goal.note}</Text>
                        </View>
                      )}

                      {goal && goal.amount <= category.spent && (
                        <View style={styles.goalAchievedContainer}>
                          <Text style={styles.goalAchievedIcon}>🎉</Text>
                          <Text style={styles.goalAchievedText}>Congratulations! You&apos;ve achieved your savings goal for {category.name}.</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <TouchableOpacity style={styles.setGoalButton} onPress={() => openGoalModal(category.id, category.name)}>
                      <Text style={styles.setGoalButtonText}>+ Set a goal</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  sectionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    marginBottom: responsiveMargin(16),
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
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(12),
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F0", // Light orange background for savings category
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  categoryIcon: {
    fontSize: scaleFontSize(20),
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  categoryDescription: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  categoryAmountContainer: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: scaleFontSize(18),
    fontWeight: "700",
  },
  categoryPercentage: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.savings,
  },
  categoryProgressContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryProgressBar: {
    height: "100%",
    backgroundColor: BudgetColors.savings,
    borderRadius: 4,
  },
  insightContainer: {
    backgroundColor: "#FFF8F0", // Light orange background for savings insight
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
    color: "#FF9C36", // Orange for savings category
  },
  insightText: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
    color: "#333",
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
  // Modal styles
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
});

export default SavingsDetailScreen;
