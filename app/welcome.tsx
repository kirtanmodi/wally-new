import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import WelcomeScreen from "../components/WelcomeScreen";
import { selectMonthlyIncome } from "../redux/slices/budgetSlice";
import { setUserOnboarded } from "../redux/slices/expenseSlice";
import { KeyboardAwareView } from "./utils/keyboard";

export default function Welcome() {
  const router = useRouter();
  const dispatch = useDispatch();
  const monthlyIncome = useSelector(selectMonthlyIncome);

  const handleGetStarted = () => {
    dispatch(setUserOnboarded());
    // if (monthlyIncome === 0) {
    //   router.push("/(tabs)/settings");
    // } else {
    //   router.push("/(tabs)");
    // }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView scrollEnabled={false} style={styles.container}>
        <WelcomeScreen onGetStarted={handleGetStarted} />
      </KeyboardAwareView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7FAFF5",
  },
});
