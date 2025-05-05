import { Redirect } from "expo-router";
import React from "react";
import { useSelector } from "react-redux";
import { selectIsFirstTimeUser } from "../redux/slices/expenseSlice";

export default function Index() {
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);

  // Redirect to welcome for first-time users, otherwise go to the tabs
  return isFirstTimeUser ? <Redirect href="/welcome" /> : <Redirect href="/(tabs)" />;
}
