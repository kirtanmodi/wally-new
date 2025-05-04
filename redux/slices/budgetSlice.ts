import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BudgetCategory } from "../../app/types/budget";
import { RootState } from "../types";

// Define custom category types
export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  type: BudgetCategory;
}

// Define budget settings state
interface BudgetState {
  monthlyIncome: number;
  budgetRule: {
    needs: number;
    savings: number;
    wants: number;
  };
  categories: CategoryItem[];
}

// Define initial state
const initialState: BudgetState = {
  monthlyIncome: 4000,
  budgetRule: {
    needs: 50,
    savings: 30,
    wants: 20,
  },
  categories: [
    { id: "housing", name: "Housing", icon: "🏠", type: "Needs" },
    { id: "groceries", name: "Groceries", icon: "🛒", type: "Needs" },
    { id: "transportation", name: "Transportation", icon: "🚗", type: "Needs" },
    { id: "emergency", name: "Emergency Fund", icon: "💰", type: "Savings" },
    { id: "investments", name: "Investments", icon: "📈", type: "Savings" },
    { id: "entertainment", name: "Entertainment", icon: "🎬", type: "Wants" },
    { id: "dining", name: "Dining Out", icon: "🍽️", type: "Wants" },
  ],
};

// Create slice
export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    setMonthlyIncome: (state, action: PayloadAction<number>) => {
      state.monthlyIncome = action.payload;
    },
    updateBudgetRule: (
      state,
      action: PayloadAction<{
        needs?: number;
        savings?: number;
        wants?: number;
      }>
    ) => {
      state.budgetRule = {
        ...state.budgetRule,
        ...action.payload,
      };
    },
    addCategory: (state, action: PayloadAction<CategoryItem>) => {
      state.categories.push(action.payload);
    },
    updateCategory: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Omit<CategoryItem, "id">>;
      }>
    ) => {
      const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = {
          ...state.categories[index],
          ...action.payload.updates,
        };
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((cat) => cat.id !== action.payload);
    },
  },
});

// Export actions
export const { setMonthlyIncome, updateBudgetRule, addCategory, updateCategory, deleteCategory } = budgetSlice.actions;

// Export selectors
export const selectBudget = (state: RootState) => state.budget;
export const selectMonthlyIncome = (state: RootState) => state.budget.monthlyIncome;
export const selectBudgetRule = (state: RootState) => state.budget.budgetRule;
export const selectCategories = (state: RootState) => state.budget.categories;
export const selectCategoriesByType = (state: RootState, type: BudgetCategory) => state.budget.categories.filter((cat) => cat.type === type);

// Export reducer
export default budgetSlice.reducer;
