import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetBudget } from "../redux/slices/budgetSlice";
import { resetExpenses, selectIsFirstTimeUser } from "../redux/slices/expenseSlice";

export default function Index() {
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetExpenses());
    dispatch(resetBudget());
  }, [dispatch]);

  // Redirect to welcome for first-time users, otherwise go to the tabs
  return isFirstTimeUser ? <Redirect href="/welcome" /> : <Redirect href="/(tabs)" />;
}
