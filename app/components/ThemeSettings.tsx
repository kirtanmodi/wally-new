import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ColorSchemeName } from "../hooks/useTheme";
import { useThemeContext } from "./ThemeProvider";
import { Card, Separator, Text } from "./ThemedComponents";

export function ThemeSettings() {
  const { theme, changeTheme, colors } = useThemeContext();

  const themeOptions: { value: ColorSchemeName; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "sunny-outline" },
    { value: "dark", label: "Dark", icon: "moon-outline" },
    { value: "system", label: "System", icon: "phone-portrait-outline" },
  ];

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Appearance</Text>
      <Separator />

      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            theme === option.value && {
              backgroundColor: colors.tint + "20", // Add transparency to tint color
              borderColor: colors.tint,
            },
          ]}
          onPress={() => changeTheme(option.value)}
        >
          <View style={styles.optionContent}>
            <Ionicons name={option.icon as any} size={24} color={theme === option.value ? colors.tint : colors.text} />
            <Text style={[styles.optionText, theme === option.value && { color: colors.tint, fontWeight: "600" }]}>{option.label}</Text>
          </View>

          {theme === option.value && <Ionicons name="checkmark" size={20} color={colors.tint} />}
        </TouchableOpacity>
      ))}

      <Text style={styles.info}>Changing the appearance will affect how the app looks across all screens.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    marginTop: 16,
    fontStyle: "italic",
    opacity: 0.7,
  },
});
