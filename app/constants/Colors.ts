/**
 * Color scheme for a budget/expenses app.
 * These colors are used in both light and dark modes.
 */

// Primary colors (Budget categories)
const primaryNeeds = "#3DB26E"; // Green for "Needs" category
const primarySavings = "#FF9C36"; // Orange for "Savings" category
const primaryWants = "#605BFF"; // Purple-blue for "Wants" category

// Background colors
const backgroundLight = "#F8F9FA";
const backgroundDark = "#121212"; // Dark background for dark mode

// Text colors
const textLight = "#333333";
const textDark = "#E2E8F0";

// Card colors
const cardLight = "#FFFFFF";
const cardDark = "#1E1E1E";

// Border colors
const borderLight = "#E2E8F0";
const borderDark = "#2D3748";

// Category colors (for items within categories)
const categoryFood = "#FF6B6B"; // Red for food
const categoryClothing = "#5EABEF"; // Blue for clothing
const categoryHousing = "#3DB26E"; // Green for housing
const categoryTransport = "#FFD166"; // Yellow for transport
const categoryHealth = "#B980F0"; // Purple for health

export const Colors = {
  light: {
    text: textLight,
    background: backgroundLight,
    tint: primaryNeeds,
    accent: primarySavings,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: primaryNeeds,
    card: cardLight,
    border: borderLight,
    shadow: "rgba(0, 0, 0, 0.1)",
    inputBackground: "#F1F5F9",
    placeholder: "#94A3B8",
    muted: "#64748B",
  },
  dark: {
    text: textDark,
    background: backgroundDark,
    tint: primaryNeeds,
    accent: primarySavings,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryNeeds,
    card: cardDark,
    border: borderDark,
    shadow: "rgba(0, 0, 0, 0.3)",
    inputBackground: "#2D3748",
    placeholder: "#64748B",
    muted: "#94A3B8",
  },
};

// Budget-related colors
export const BudgetColors = {
  needs: primaryNeeds,
  savings: primarySavings,
  wants: primaryWants,
  categories: {
    food: categoryFood,
    clothing: categoryClothing,
    housing: categoryHousing,
    transport: categoryTransport,
    health: categoryHealth,
    more: "#A0AEC0",
  },
};

// Additional colors for UI elements
export const AdditionalColors = {
  success: primaryNeeds,
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
  gradient: {
    start: primaryNeeds,
    end: primarySavings,
  },
};
