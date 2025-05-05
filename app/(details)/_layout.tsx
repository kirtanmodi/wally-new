import { Stack } from "expo-router";
import React from "react";

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F8F9FA" },
      }}
    >
      <Stack.Screen name="needs" />
      <Stack.Screen name="wants" />
      <Stack.Screen name="savings" />
    </Stack>
  );
}
