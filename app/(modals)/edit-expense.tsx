import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AddExpense from "../../components/AddExpense";
import { selectExpenses, updateExpense } from "../../redux/slices/expenseSlice";
import { BudgetCategory, ExpenseCategory } from "../types/budget";
import { KeyboardAwareView } from "../utils/keyboard";

interface SaveExpenseData {
  amount: number;
  description: string;
  budgetCategory: BudgetCategory;
  category: ExpenseCategory | string;
  date: Date | string;
}

export default function EditExpenseModal() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();
  const expenses = useSelector(selectExpenses);

  // Find the expense to edit
  const expenseToEdit = expenses.find((expense) => expense.id === id);

  if (!expenseToEdit) {
    // If expense not found, go back
    router.back();
    return null;
  }

  const handleSaveExpense = (expenseData: SaveExpenseData) => {
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
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView style={styles.container}>
        <AddExpense onSave={handleSaveExpense} onCancel={handleCancel} initialExpense={expenseToEdit} isEditing={true} />
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
