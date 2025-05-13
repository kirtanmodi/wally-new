import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BudgetCategory } from "../../app/types/budget";
import { DenominationFormat } from "../../app/utils/denominationFormatter";
import { RootState } from "../types";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "INR" | "CNY";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const AVAILABLE_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  type: BudgetCategory;
}

export interface SavingsGoal {
  amount: number;
  targetDate?: string;
  note?: string;
  monthlyContribution?: number;
  monthsRemaining?: number;
}

export interface SavingsGoals {
  [categoryId: string]: SavingsGoal;
}

interface BudgetState {
  monthlyIncome: number;
  budgetRule: {
    needs: number;
    savings: number;
    wants: number;
  };
  categories: CategoryItem[];
  currency: CurrencyInfo;
  savingsGoals: SavingsGoals;
  denominationFormat: DenominationFormat;
}

const initialState: BudgetState = {
  monthlyIncome: 0,
  budgetRule: {
    needs: 50,
    savings: 30,
    wants: 20,
  },
  categories: [
    { id: "housing", name: "Housing", icon: "🏠", type: "Needs" },
    { id: "work", name: "Work", icon: "💼", type: "Needs" },
    { id: "groceries", name: "Groceries", icon: "🛒", type: "Needs" },
    { id: "transportation", name: "Transportation", icon: "🚗", type: "Needs" },
    { id: "emergency", name: "Emergency Fund", icon: "💰", type: "Savings" },
    { id: "investments", name: "Investments", icon: "📈", type: "Savings" },
    { id: "dining", name: "Dining Out", icon: "🍽️", type: "Wants" },
    { id: "shopping", name: "Shopping", icon: "🛍️", type: "Wants" },
    { id: "entertainment", name: "Entertainment", icon: "🎬", type: "Wants" },
    { id: "other", name: "Other", icon: "💡", type: "Wants" },
  ],
  currency: AVAILABLE_CURRENCIES[0],
  savingsGoals: {},
  denominationFormat: "none",
};

export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    resetBudget: (state) => {
      state.monthlyIncome = 0;
      state.budgetRule = {
        needs: 50,
        savings: 30,
        wants: 20,
      };
      state.categories = [
        { id: "housing", name: "Housing", icon: "🏠", type: "Needs" },
        { id: "work", name: "Work", icon: "💼", type: "Needs" },
        { id: "groceries", name: "Groceries", icon: "🛒", type: "Needs" },
        { id: "transportation", name: "Transportation", icon: "🚗", type: "Needs" },
        { id: "emergency", name: "Emergency Fund", icon: "💰", type: "Savings" },
        { id: "investments", name: "Investments", icon: "📈", type: "Savings" },
        { id: "dining", name: "Dining Out", icon: "🍽️", type: "Wants" },
        { id: "shopping", name: "Shopping", icon: "🛍️", type: "Wants" },
        { id: "entertainment", name: "Entertainment", icon: "🎬", type: "Wants" },
        { id: "other", name: "Other", icon: "💡", type: "Wants" },
      ];
      state.savingsGoals = {};
      state.currency = AVAILABLE_CURRENCIES[0];
    },
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
    setCurrency: (state, action: PayloadAction<CurrencyInfo>) => {
      state.currency = action.payload;
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
    setSavingsGoal: (
      state,
      action: PayloadAction<{
        categoryId: string;
        goal: SavingsGoal;
      }>
    ) => {
      state.savingsGoals[action.payload.categoryId] = action.payload.goal;
    },
    updateSavingsGoal: (
      state,
      action: PayloadAction<{
        categoryId: string;
        updates: Partial<SavingsGoal>;
      }>
    ) => {
      if (state.savingsGoals[action.payload.categoryId]) {
        state.savingsGoals[action.payload.categoryId] = {
          ...state.savingsGoals[action.payload.categoryId],
          ...action.payload.updates,
        };
      }
    },
    deleteSavingsGoal: (state, action: PayloadAction<string>) => {
      delete state.savingsGoals[action.payload];
    },
    setDenominationFormat: (state, action: PayloadAction<DenominationFormat>) => {
      state.denominationFormat = action.payload;
    },
  },
});

export const {
  setMonthlyIncome,
  updateBudgetRule,
  addCategory,
  updateCategory,
  deleteCategory,
  resetBudget,
  setCurrency,
  setSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  setDenominationFormat,
} = budgetSlice.actions;

const selectBudgetState = (state: RootState) => state.budget;
const selectCategoriesState = (state: RootState) => state.budget.categories;
const selectSavingsGoalsState = (state: RootState) => state.budget.savingsGoals;

export const selectBudget = (state: RootState) => state.budget;
export const selectMonthlyIncome = (state: RootState) => state.budget.monthlyIncome;
export const selectBudgetRule = (state: RootState) => state.budget.budgetRule;
export const selectCategories = (state: RootState) => state.budget.categories;
export const selectCurrency = (state: RootState) => state.budget.currency;
export const selectSavingsGoals = (state: RootState) => state.budget.savingsGoals;
export const selectDenominationFormat = (state: RootState) => state.budget.denominationFormat;

export const selectCategoriesByType = createSelector([selectCategoriesState, (_, type: BudgetCategory) => type], (categories, type) =>
  categories.filter((cat) => cat.type === type)
);

export const selectSavingsGoalByCategory = createSelector(
  [selectSavingsGoalsState, (_, categoryId: string) => categoryId],
  (savingsGoals, categoryId) => savingsGoals[categoryId] || null
);

export default budgetSlice.reducer;
