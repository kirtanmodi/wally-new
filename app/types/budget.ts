export type BudgetCategory = "Needs" | "Savings" | "Wants";

export type ExpenseCategory = "Food" | "Clothing" | "Housing" | "Transport" | "Health" | "Other";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: BudgetCategory;
  subcategory: ExpenseCategory | string;
  date: Date | string;
  icon: string;
}

export interface BudgetData {
  monthlyIncome: number;
  needs: {
    percentage: number;
    amount: number;
    spent: number;
  };
  savings: {
    percentage: number;
    amount: number;
    spent: number;
  };
  wants: {
    percentage: number;
    amount: number;
    spent: number;
  };
}

export interface CategorySummary {
  category: BudgetCategory;
  spent: number;
  total: number;
  color: string;
  gradientColors?: string[];
}

export interface SavingsGoal {
  amount: number;
  targetDate?: string;
  note?: string;
}

export interface SavingsGoals {
  [categoryId: string]: SavingsGoal;
}
