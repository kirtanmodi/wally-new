import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AddExpense from "../components/AddExpense";
import BudgetOverview from "../components/BudgetOverview";
import BudgetSettings from "../components/BudgetSettings";
import ExpensesList from "../components/ExpensesList";
import NeedsDetailScreen from "../components/NeedsDetailScreen";
import SavingsDetailScreen from "../components/SavingsDetailScreen";
import WantsDetailScreen from "../components/WantsDetailScreen";
import WelcomeScreen from "../components/WelcomeScreen";
import { resetBudget, selectMonthlyIncome } from "../redux/slices/budgetSlice";
import {
  addExpense,
  clearSampleExpenses,
  resetExpenses,
  selectExpenses,
  selectIsFirstTimeUser,
  selectOnboarded,
  setUserOnboarded,
  updateExpense,
} from "../redux/slices/expenseSlice";
import { BudgetCategory, Expense, ExpenseCategory } from "./types/budget";
import { KeyboardAwareView } from "./utils/keyboard";

export type ScreenView = "welcome" | "budget" | "expenses" | "addExpense" | "settings" | "needsDetail" | "wantsDetail" | "savingsDetail";

interface SaveExpenseData {
  amount: number;
  description: string;
  budgetCategory: BudgetCategory;
  category: ExpenseCategory | string;
  date: Date | string;
}

interface BudgetScreenProps {
  initialView?: ScreenView;
}

const BudgetScreen: React.FC<BudgetScreenProps> = ({ initialView }) => {
  const dispatch = useDispatch();
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const onboarded = useSelector(selectOnboarded);
  const expenses = useSelector(selectExpenses);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Determine initial view based on user status and income
  const getInitialView = (): ScreenView => {
    if (initialView) {
      return initialView;
    }

    if (isFirstTimeUser) {
      return "welcome";
    }
    if (monthlyIncome === 0) {
      return "settings";
    }
    return "expenses";
  };

  const [currentView, setCurrentView] = useState<ScreenView>(getInitialView());

  useEffect(() => {
    dispatch(resetExpenses());
    dispatch(resetBudget());
  }, []);

  useEffect(() => {
    if (!isFirstTimeUser && monthlyIncome === 0 && onboarded && currentView === "expenses" && !initialView) {
      setCurrentView("settings");
    }
    if (isFirstTimeUser && monthlyIncome === 0 && !onboarded && currentView === "settings" && !initialView) {
      setCurrentView("expenses");
    }
  }, [isFirstTimeUser, monthlyIncome, currentView, initialView]);

  const handleGetStarted = () => {
    dispatch(setUserOnboarded());
    if (monthlyIncome === 0) {
      setCurrentView("settings");
    } else {
      setCurrentView("expenses");
    }
  };

  const handleSaveExpense = (expenseData: SaveExpenseData) => {
    if (expenseToEdit) {
      // Update existing expense
      dispatch(
        updateExpense({
          id: expenseToEdit.id,
          updates: {
            title: expenseData.description,
            amount: expenseData.amount,
            category: expenseData.budgetCategory,
            subcategory: expenseData.category,
            date: typeof expenseData.date === "string" ? expenseData.date : expenseData.date.toISOString(),
          },
        })
      );
      setExpenseToEdit(null);
    } else {
      // Create a new expense with a unique ID
      const newExpense: Expense = {
        id: Date.now().toString(),
        title: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.budgetCategory,
        subcategory: expenseData.category,
        // Convert Date to string before dispatching the action
        date: typeof expenseData.date === "string" ? expenseData.date : expenseData.date.toISOString(),
        // Add an appropriate icon based on category
        icon: getIconForCategory(expenseData.category),
      };

      // If it's the first time user's first custom expense, offer to clear samples
      if (isFirstTimeUser) {
        Alert.alert("New Expense Added", "Would you like to keep the sample expenses or remove them?", [
          {
            text: "Keep Samples",
            style: "cancel",
          },
          {
            text: "Remove Samples",
            onPress: () => dispatch(clearSampleExpenses()),
          },
        ]);
      }

      dispatch(addExpense(newExpense));
    }
    setCurrentView("expenses");
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setCurrentView("addExpense");
  };

  const handleCancelEdit = () => {
    setExpenseToEdit(null);
    setCurrentView("expenses");
  };

  const getIconForCategory = (category: string): string => {
    // Try to find a category icon from our list
    const foundCategory = expenses.find((exp) => exp.subcategory.toLowerCase() === category.toLowerCase());

    if (foundCategory) {
      return foundCategory.icon;
    }

    // Default icons if not found
    switch (category.toLowerCase()) {
      case "food":
      case "groceries":
        return "🍔";
      case "clothing":
        return "👕";
      case "housing":
      case "rent":
        return "🏠";
      case "transport":
      case "transportation":
        return "🚗";
      case "health":
      case "healthcare":
        return "💊";
      case "entertainment":
        return "🎬";
      case "dining":
      case "dining out":
        return "🍽️";
      case "education":
        return "📚";
      case "emergency fund":
        return "💰";
      case "investments":
        return "📈";
      default:
        return "📝";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView scrollEnabled={false} style={styles.container}>
        {currentView === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} />}

        {currentView === "expenses" && (
          <ExpensesList
            expenses={expenses}
            onOpenNeedsDetail={() => setCurrentView("needsDetail")}
            onOpenWantsDetail={() => setCurrentView("wantsDetail")}
            onOpenSavingsDetail={() => setCurrentView("savingsDetail")}
            onAddExpense={() => {
              setExpenseToEdit(null);
              setCurrentView("addExpense");
            }}
            onOpenBudget={() => setCurrentView("budget")}
            onOpenSettings={() => setCurrentView("settings")}
            onEditExpense={handleEditExpense}
          />
        )}

        {currentView === "budget" && (
          <BudgetOverview
            monthlyIncome={monthlyIncome}
            onBackPress={() => setCurrentView("expenses")}
            onOpenSettings={() => setCurrentView("settings")}
            onOpenNeedsDetail={() => setCurrentView("needsDetail")}
            onOpenWantsDetail={() => setCurrentView("wantsDetail")}
            onOpenSavingsDetail={() => setCurrentView("savingsDetail")}
          />
        )}

        {currentView === "addExpense" && (
          <AddExpense onSave={handleSaveExpense} onCancel={handleCancelEdit} initialExpense={expenseToEdit} isEditing={!!expenseToEdit} />
        )}

        {currentView === "settings" && (
          <BudgetSettings onBackPress={() => setCurrentView(monthlyIncome === 0 && isFirstTimeUser ? "welcome" : "expenses")} />
        )}

        {currentView === "needsDetail" && <NeedsDetailScreen onBackPress={() => setCurrentView("expenses")} />}

        {currentView === "wantsDetail" && <WantsDetailScreen onBackPress={() => setCurrentView("expenses")} />}

        {currentView === "savingsDetail" && <SavingsDetailScreen onBackPress={() => setCurrentView("expenses")} />}
      </KeyboardAwareView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
});

export default BudgetScreen;
