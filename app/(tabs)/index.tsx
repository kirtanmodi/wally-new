import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import ExpensesList from "../../components/ExpensesList";
import { selectExpenses } from "../../redux/slices/expenseSlice";
import { Expense } from "../types/budget";
import { getCurrentMonthYearKey } from "../utils/dateUtils";
import { KeyboardAwareView } from "../utils/keyboard";

export default function ExpensesTab() {
  const router = useRouter();
  const expenses = useSelector(selectExpenses);
  const [selectedMonth, setSelectedMonth] = React.useState(getCurrentMonthYearKey());

  const handleEditExpense = (expense: Expense) => {
    router.push({
      pathname: "/(modals)/edit-expense",
      params: { id: expense.id },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView scrollEnabled={false} style={styles.container}>
        <ExpensesList
          expenses={expenses}
          onOpenNeedsDetail={() => router.push("/(details)/needs")}
          onOpenWantsDetail={() => router.push("/(details)/wants")}
          onOpenSavingsDetail={() => router.push("/(details)/savings")}
          onAddExpense={() => router.push("/(modals)/add-expense")}
          onOpenBudget={() => router.push("/(tabs)/overview")}
          onOpenSettings={() => router.push("/(tabs)/settings")}
          onEditExpense={handleEditExpense}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
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