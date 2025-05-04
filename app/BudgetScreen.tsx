import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AddExpense from "../components/AddExpense";
import BudgetOverview from "../components/BudgetOverview";
import BudgetSettings from "../components/BudgetSettings";
import ExpensesList from "../components/ExpensesList";
import WelcomeScreen from "../components/WelcomeScreen";
import { selectMonthlyIncome } from "../redux/slices/budgetSlice";
import { addExpense, clearSampleExpenses, selectExpenses, selectIsFirstTimeUser, setUserOnboarded } from "../redux/slices/expenseSlice";
import { BudgetCategory, Expense, ExpenseCategory } from "./types/budget";

type ScreenView = "welcome" | "budget" | "expenses" | "addExpense" | "settings";

interface SaveExpenseData {
  amount: number;
  description: string;
  budgetCategory: BudgetCategory;
  category: ExpenseCategory | string;
  date: Date;
}

const BudgetScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);
  const [currentView, setCurrentView] = useState<ScreenView>(isFirstTimeUser ? "welcome" : "expenses");
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const expenses = useSelector(selectExpenses);

  // useEffect(() => {
  //   dispatch(resetExpenses());
  //   dispatch(resetBudget());
  // }, []);

  const handleGetStarted = () => {
    dispatch(setUserOnboarded());
    setCurrentView("expenses");
  };

  const handleSaveExpense = (expenseData: SaveExpenseData) => {
    // Create a new expense with a unique ID
    const newExpense: Expense = {
      id: Date.now().toString(),
      title: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.budgetCategory,
      subcategory: expenseData.category,
      date: expenseData.date,
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
      {currentView === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} />}

      {currentView === "expenses" && (
        <ExpensesList
          expenses={expenses}
          onAddExpense={() => setCurrentView("addExpense")}
          onOpenBudget={() => setCurrentView("budget")}
          onOpenSettings={() => setCurrentView("settings")}
        />
      )}

      {currentView === "budget" && (
        <BudgetOverview
          monthlyIncome={monthlyIncome}
          onBackPress={() => setCurrentView("expenses")}
          onOpenSettings={() => setCurrentView("settings")}
        />
      )}

      {currentView === "addExpense" && <AddExpense onSave={handleSaveExpense} onCancel={() => setCurrentView("expenses")} />}

      {currentView === "settings" && <BudgetSettings onBackPress={() => setCurrentView("expenses")} />}
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
