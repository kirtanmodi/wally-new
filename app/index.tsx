import { Redirect } from "expo-router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetApp } from "../redux/slices/appSlice";
import { resetBudget } from "../redux/slices/budgetSlice";
import { resetExpenses, selectIsFirstTimeUser } from "../redux/slices/expenseSlice";
import { resetUser } from "../redux/slices/userSlice";
export default function Index() {
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);
  const dispatch = useDispatch();

  console.log("isFirstTimeUser", isFirstTimeUser);

  useEffect(() => {
    dispatch(resetExpenses());
    dispatch(resetBudget());
    dispatch(resetUser());
    dispatch(resetApp());
  }, [dispatch]);

  // return <Redirect href="/welcome" />;

  // Redirect to welcome for first-time users, otherwise go to the tabs
  return isFirstTimeUser ? <Redirect href="/welcome" /> : <Redirect href="/(tabs)" />;
}
