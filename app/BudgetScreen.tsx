import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import AddExpense from "../components/AddExpense";
import BudgetOverview from "../components/BudgetOverview";
import BudgetSettings from "../components/BudgetSettings";
import ExpensesList from "../components/ExpensesList";
import { selectMonthlyIncome } from "../redux/slices/budgetSlice";
import { BudgetCategory, Expense, ExpenseCategory } from "./types/budget";

type ScreenView = "budget" | "expenses" | "addExpense" | "settings";

interface SaveExpenseData {
  amount: number;
  description: string;
  budgetCategory: BudgetCategory;
  category: ExpenseCategory | string;
  date: Date;
}

const BudgetScreen: React.FC = () => {
  const [currentView, setCurrentView] = useState<ScreenView>("expenses");
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

    setExpenses([newExpense, ...expenses]);
    setCurrentView("expenses");
  };

  const getIconForCategory = (category: string): string => {
    switch (category.toLowerCase()) {
      case "food":
        return "🍔";
      case "clothing":
        return "👕";
      case "housing":
        return "🏠";
      case "transport":
        return "🚗";
      case "health":
        return "💊";
      default:
        return "📝";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentView === "budget" && (
        <BudgetOverview
          monthlyIncome={monthlyIncome}
          onBackPress={() => setCurrentView("expenses")}
          onOpenSettings={() => setCurrentView("settings")}
        />
      )}

      {currentView === "expenses" && (
        <ExpensesList
          expenses={expenses}
          onAddExpense={() => setCurrentView("addExpense")}
          onOpenBudget={() => setCurrentView("budget")}
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
