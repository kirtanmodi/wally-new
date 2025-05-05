import { useRouter } from "expo-router";
import React from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AddExpense from "../../components/AddExpense";
import { addExpense, clearSampleExpenses, selectIsFirstTimeUser } from "../../redux/slices/expenseSlice";
import { BudgetCategory, Expense, ExpenseCategory } from "../types/budget";
import { KeyboardAwareView } from "../utils/keyboard";

interface SaveExpenseData {
  amount: number;
  description: string;
  budgetCategory: BudgetCategory;
  category: ExpenseCategory | string;
  date: Date | string;
}

export default function AddExpenseModal() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);

  const handleSaveExpense = (expenseData: SaveExpenseData) => {
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

    // Ask about sample expenses if it's a first-time user
    if (isFirstTimeUser) {
      Alert.alert("New Expense Added", "Would you like to keep the sample expenses or remove them?", [
        {
          text: "Keep Samples",
          style: "cancel",
          onPress: () => {
            dispatch(addExpense(newExpense));
            router.back();
          },
        },
        {
          text: "Remove Samples",
          onPress: () => {
            dispatch(addExpense(newExpense));
            dispatch(clearSampleExpenses());
            router.back();
          },
        },
      ]);
    } else {
      dispatch(addExpense(newExpense));
      router.back();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Function to determine the icon based on category
  const getIconForCategory = (category: string): string => {
    // Default icons based on category
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
      <KeyboardAwareView style={styles.container}>
        <AddExpense onSave={handleSaveExpense} onCancel={handleCancel} isEditing={false} />
      </KeyboardAwareView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
});
