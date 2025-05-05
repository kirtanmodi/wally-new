import React, { createContext, ReactNode, useContext } from "react";
import { StatusBar } from "react-native";
import { useTheme } from "../hooks/useTheme";

// Create a context for the theme
export const ThemeContext = createContext<ReturnType<typeof useTheme> | undefined>(undefined);

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar barStyle={theme.theme === "dark" ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
