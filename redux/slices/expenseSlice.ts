import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Expense } from "../../app/types/budget";
import { RootState } from "../types";

interface SerializedExpense extends Omit<Expense, "date"> {
  date: string;
}

interface ExpenseState {
  expenses: SerializedExpense[];
  isFirstTimeUser: boolean;
  onboarded: boolean;
}

const initialState: ExpenseState = {
  expenses: [],
  isFirstTimeUser: true,
  onboarded: false,
};

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
        const { date, ...otherUpdates } = action.payload.updates;

        state.expenses[index] = {
          ...state.expenses[index],
          ...otherUpdates,
        };

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

export const { addExpense, updateExpense, deleteExpense, clearSampleExpenses, setUserOnboarded, resetExpenses } = expenseSlice.actions;

const selectExpensesState = (state: RootState) => state.expenses.expenses;

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

export default expenseSlice.reducer;
