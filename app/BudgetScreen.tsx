import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetBudget } from "../redux/slices/budgetSlice";
import { resetExpenses, selectIsFirstTimeUser, selectOnboarded } from "../redux/slices/expenseSlice";

export type ScreenView = "welcome" | "budget" | "expenses" | "addExpense" | "settings" | "needsDetail" | "wantsDetail" | "savingsDetail";

interface BudgetScreenProps {
  initialView?: ScreenView;
}

/**
 * @deprecated This component is deprecated. Use the individual screens and navigation instead.
 */
const BudgetScreen: React.FC<BudgetScreenProps> = ({ initialView }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);
  const onboarded = useSelector(selectOnboarded);

  useEffect(() => {
    // Show deprecation warning
    console.warn("BudgetScreen is deprecated. Use the individual screens and navigation instead.");

    dispatch(resetExpenses());
    dispatch(resetBudget());

    // Redirect to the appropriate screen
    if (initialView) {
      switch (initialView) {
        case "welcome":
          router.replace("/welcome");
          break;
        case "budget":
          router.replace("/(tabs)/overview");
          break;
        case "expenses":
          router.replace("/(tabs)");
          break;
        case "addExpense":
          router.replace("/(modals)/add-expense");
          break;
        case "settings":
          router.replace("/(tabs)/settings");
          break;
        case "needsDetail":
          router.replace("/(details)/needs");
          break;
        case "wantsDetail":
          router.replace("/(details)/wants");
          break;
        case "savingsDetail":
          router.replace("/(details)/savings");
          break;
        default:
          if (isFirstTimeUser && !onboarded) {
            router.replace("/welcome");
          } else {
            router.replace("/(tabs)");
          }
      }
    } else if (isFirstTimeUser && !onboarded) {
      router.replace("/welcome");
    } else {
      router.replace("/(tabs)");
    }
  }, []);

  // This component no longer renders anything, as it immediately redirects
  return null;
};

export default BudgetScreen;
