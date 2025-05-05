import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import SavingsDetailScreen from "../../components/SavingsDetailScreen";
import { getCurrentMonthYearKey } from "../utils/dateUtils";
import { KeyboardAwareView } from "../utils/keyboard";

export default function SavingsDetailPage() {
  const router = useRouter();
  const { month } = useLocalSearchParams();
  const selectedMonth = (month as string) || getCurrentMonthYearKey();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView scrollEnabled={false} style={styles.container}>
        <SavingsDetailScreen onBackPress={handleBackPress} selectedMonth={selectedMonth} />
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
