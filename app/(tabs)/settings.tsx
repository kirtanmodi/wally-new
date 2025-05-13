import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import BudgetSettings from "../../components/BudgetSettings";
import { selectMonthlyIncome } from "../../redux/slices/budgetSlice";
import { selectIsFirstTimeUser } from "../../redux/slices/expenseSlice";
import { KeyboardAwareView } from "../utils/keyboard";

export default function SettingsTab() {
  const router = useRouter();
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);

  const handleBackPress = () => {
    if (monthlyIncome === 0 && isFirstTimeUser) {
      router.push("/welcome");
    } else {
      router.push("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView scrollEnabled={false} style={styles.container}>
        <BudgetSettings onBackPress={handleBackPress} />
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
