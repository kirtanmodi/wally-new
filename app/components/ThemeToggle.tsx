import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useThemeContext } from "./ThemeProvider";
import { Text } from "./ThemedComponents";

interface ThemeToggleProps {
  showLabel?: boolean;
  style?: any;
}

export function ThemeToggle({ showLabel = false, style }: ThemeToggleProps) {
  const { theme, toggleTheme, colors } = useThemeContext();

  return (
    <View style={[styles.container, style]}>
      {showLabel && <Text style={styles.label}>{theme === "dark" ? "Dark Mode" : "Light Mode"}</Text>}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.toggle,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={theme === "dark" ? "moon" : "sunny"} size={24} color={theme === "dark" ? "#FFD700" : "#FFA500"} />
      </TouchableOpacity>
    </View>
  );
}

// Compact version that just shows the icon
export function ThemeToggleCompact({ style }: { style?: any }) {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <TouchableOpacity onPress={toggleTheme} style={style}>
      <Ionicons name={theme === "dark" ? "moon" : "sunny"} size={24} color={theme === "dark" ? "#FFD700" : "#FFA500"} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  label: {
    marginRight: 10,
    fontSize: 16,
  },
});
