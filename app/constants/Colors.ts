/**
 * WellFin Design System Colors
 * Beautiful, modern color palette for wellness-finance hybrid app
 */

const COLORS = {
  // Primary Colors
  primary: {
    pink: "#FF69B4",
    blue: "#4A90E2", 
    green: "#7ED321",
  },
  
  // Secondary Colors
  secondary: {
    lightPink: "#FFB6C1",
    lightBlue: "#87CEEB", 
    lightGreen: "#98FB98",
  },
  
  // Neutral Colors
  neutral: {
    white: "#FFFFFF",
    lightGray: "#F5F5F5",
    darkGray: "#333333",
    black: "#000000",
  },
  
  // Semantic Colors
  semantic: {
    success: "#50E3C2",
    warning: "#F5A623", 
    error: "#D0021B",
    info: "#4A90E2",
  },
  
  // Gradients
  gradients: {
    pinkBlue: ["#FF69B4", "#4A90E2"],
    blueGreen: ["#4A90E2", "#7ED321"],
    lightPink: ["#FFB6C1", "#FF69B4"],
    wellness: ["#87CEEB", "#98FB98"],
  }
};

export const Colors = {
  light: {
    main: COLORS.primary.blue,
    secondary: COLORS.primary.pink,
    text: COLORS.neutral.darkGray,
    background: COLORS.neutral.white,
    tint: COLORS.primary.blue,
    accent: COLORS.primary.green,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: COLORS.primary.blue,
    card: COLORS.neutral.white,
    border: "#E2E8F0",
    shadow: "rgba(0, 0, 0, 0.1)",
    inputBackground: "#F1F5F9",
    placeholder: "#94A3B8",
    muted: "#64748B",
  },
  dark: {
    main: COLORS.primary.blue,
    secondary: COLORS.primary.pink,
    text: "#E2E8F0",
    background: "#121212",
    tint: COLORS.primary.blue,
    accent: COLORS.primary.green,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6", 
    tabIconSelected: COLORS.primary.blue,
    card: "#1E1E1E",
    border: "#2D3748",
    shadow: "rgba(0, 0, 0, 0.3)",
    inputBackground: "#2D3748",
    placeholder: "#64748B",
    muted: "#94A3B8",
  },
};

// Budget-related colors
export const BudgetColors = {
  needs: COLORS.primary.green,
  savings: COLORS.primary.blue,
  wants: COLORS.primary.pink,
  categories: {
    food: "#FF6B6B",
    clothing: "#4ECDC4", 
    housing: COLORS.primary.green,
    transport: "#FFD166",
    health: "#B980F0",
    more: "#A0AEC0",
  },
};

// Additional colors for UI elements
export const AdditionalColors = {
  success: COLORS.semantic.success,
  warning: COLORS.semantic.warning,
  error: COLORS.semantic.error,
  info: COLORS.semantic.info,
  gradient: {
    start: COLORS.primary.pink,
    end: COLORS.primary.blue,
  },
};

export default COLORS;