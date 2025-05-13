import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { resetApp } from "../redux/slices/appSlice";
import { resetBudget } from "../redux/slices/budgetSlice";
import { resetExpenses } from "../redux/slices/expenseSlice";
import { resetUser } from "../redux/slices/userSlice";

export default function Index() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetExpenses());
    dispatch(resetBudget());
    dispatch(resetUser());
    dispatch(resetApp());
  }, [dispatch]);

  // return <Redirect href="/welcome" />;

  // Redirect to welcome for first-time users, otherwise go to the tabs
  return <Redirect href="/(tabs)" />;
}
