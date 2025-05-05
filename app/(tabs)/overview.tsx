import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import BudgetOverview from "../../components/BudgetOverview";
import { selectMonthlyIncome } from "../../redux/slices/budgetSlice";
import { getCurrentMonthYearKey } from "../utils/dateUtils";
import { KeyboardAwareView } from "../utils/keyboard";

export default function OverviewTab() {
  const router = useRouter();
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYearKey());

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView scrollEnabled={false} style={styles.container}>
        <BudgetOverview
          monthlyIncome={monthlyIncome || 0}
          onBackPress={() => router.back()}
          onOpenSettings={() => router.push("/(tabs)/settings")}
          onOpenNeedsDetail={() => router.push("/(details)/needs")}
          onOpenWantsDetail={() => router.push("/(details)/wants")}
          onOpenSavingsDetail={() => router.push("/(details)/savings")}
          selectedMonth={selectedMonth}
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
