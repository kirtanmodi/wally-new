import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import WantsDetailScreen from "../../components/WantsDetailScreen";
import { getCurrentMonthYearKey } from "../utils/dateUtils";
import { KeyboardAwareView } from "../utils/keyboard";

export default function WantsDetailPage() {
  const router = useRouter();
  const { month } = useLocalSearchParams();
  const selectedMonth = (month as string) || getCurrentMonthYearKey();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareView scrollEnabled={false} style={styles.container}>
        <WantsDetailScreen onBackPress={handleBackPress} selectedMonth={selectedMonth} />
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
