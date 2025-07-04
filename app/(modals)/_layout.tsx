import { Stack } from "expo-router";
import React from "react";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        animation: "slide_from_bottom",
        contentStyle: { backgroundColor: "#F8F9FA" },
      }}
    >
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="edit-expense" />
    </Stack>
  );
}
