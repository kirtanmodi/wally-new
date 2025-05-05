import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
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

// Define a serialized expense type where date is always a string
interface SerializedExpense extends Omit<Expense, "date"> {
  date: string;
}

// Define expenses state
interface ExpenseState {
  expenses: SerializedExpense[];
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
      // The date may already be a string from BudgetScreen.tsx
      // But ensure it's a string in case it's a Date object
      const serializedExpense: SerializedExpense = {
        ...action.payload,
        date:
          typeof action.payload.date === "string"
            ? action.payload.date
            : action.payload.date instanceof Date
            ? action.payload.date.toISOString()
            : String(action.payload.date),
      };
      state.expenses.unshift(serializedExpense);
    },
    updateExpense: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Omit<Expense, "id">>;
      }>
    ) => {
      const index = state.expenses.findIndex((exp) => exp.id === action.payload.id);
      if (index !== -1) {
        // Create updates object with everything except date
        const { date, ...otherUpdates } = action.payload.updates;

        // Update the expense
        state.expenses[index] = {
          ...state.expenses[index],
          ...otherUpdates,
        };

        // Handle date separately if it exists
        if (date !== undefined) {
          state.expenses[index].date = typeof date === "string" ? date : date instanceof Date ? date.toISOString() : String(date);
        }
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

// Base selector for expenses state
const selectExpensesState = (state: RootState) => state.expenses.expenses;

// Export memoized selectors
export const selectExpenses = createSelector([selectExpensesState], (expenses) =>
  expenses.map((expense) => ({
    ...expense,
    date: new Date(expense.date),
  }))
);

export const selectExpensesByCategory = createSelector([selectExpensesState, (_, category: string) => category], (expenses, category) =>
  expenses
    .filter((exp) => exp.category === category)
    .map((expense) => ({
      ...expense,
      date: new Date(expense.date),
    }))
);

export const selectIsFirstTimeUser = (state: RootState) => state.expenses.isFirstTimeUser;
export const selectOnboarded = (state: RootState) => state.expenses.onboarded;

// Export reducer
export default expenseSlice.reducer;
