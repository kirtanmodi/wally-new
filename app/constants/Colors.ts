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
const backgroundDark = "#F8F9FA"; // Using light background for both modes as shown in image

// Text colors
const text = "#333333";
// const textDark = '#E2E8F0';

// Card colors
const cardLight = "#FFFFFF";
const cardDark = "#2D3748";

// Category colors (for items within categories)
const categoryFood = "#FF6B6B"; // Red for food
const categoryClothing = "#5EABEF"; // Blue for clothing
const categoryHousing = "#3DB26E"; // Green for housing
const categoryTransport = "#FFD166"; // Yellow for transport
const categoryHealth = "#B980F0"; // Purple for health

export const Colors = {
  light: {
    text: text,
    background: backgroundLight,
    tint: primaryNeeds,
    accent: primarySavings,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: primaryNeeds,
    card: cardLight,
    border: "#E2E8F0",
  },
  dark: {
    text: text,
    background: backgroundDark,
    tint: primaryNeeds,
    accent: primarySavings,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryNeeds,
    card: cardDark,
    border: "#4A5568",
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
