import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Expense } from "../../app/types/budget";
import { RootState } from "../types";

// Sample expenses for new users
// const sampleExpenses: Expense[] = [
//   {
//     id: "sample-1",
//     title: "Rent",
//     amount: 1200,
//     category: "Needs",
//     subcategory: "Housing",
//     icon: "🏠",
//     date: new Date(),
//   },
//   {
//     id: "sample-2",
//     title: "Grocery Shopping",
//     amount: 185.5,
//     category: "Needs",
//     subcategory: "Food",
//     icon: "🛒",
//     date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
//   },
// ];

// Define expenses state
interface ExpenseState {
  expenses: Expense[];
  isFirstTimeUser: boolean;
  onboarded: boolean;
}

// Define initial state
const initialState: ExpenseState = {
  expenses: [],
  isFirstTimeUser: true,
  onboarded: false,
};

// Create slice
export const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    resetExpenses: (state) => {
      state.expenses = [];
      state.onboarded = false;
      state.isFirstTimeUser = true;
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.unshift(action.payload);
    },
    updateExpense: (state, action: PayloadAction<{ id: string; updates: Partial<Omit<Expense, "id">> }>) => {
      const index = state.expenses.findIndex((exp) => exp.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = {
          ...state.expenses[index],
          ...action.payload.updates,
        };
      }
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter((exp) => exp.id !== action.payload);
    },
    clearSampleExpenses: (state) => {
      if (state.isFirstTimeUser) {
        state.expenses = state.expenses.filter((exp) => !exp.id.startsWith("sample-"));
        state.isFirstTimeUser = false;
      }
    },
    setUserOnboarded: (state) => {
      state.isFirstTimeUser = false;
      state.onboarded = true;
    },
  },
});

// Export actions
export const { addExpense, updateExpense, deleteExpense, clearSampleExpenses, setUserOnboarded, resetExpenses } = expenseSlice.actions;

// Export selectors
export const selectExpenses = (state: RootState) => state.expenses.expenses;
export const selectExpensesByCategory = (state: RootState, category: string) => state.expenses.expenses.filter((exp) => exp.category === category);
export const selectIsFirstTimeUser = (state: RootState) => state.expenses.isFirstTimeUser;
export const selectOnboarded = (state: RootState) => state.expenses.onboarded;
// Export reducer
export default expenseSlice.reducer;
