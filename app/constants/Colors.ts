/**
 * Modern color scheme with pink as primary color for a doctor's app.
 * These colors are used in both light and dark modes.
 */

// Primary colors (Pink)
const primaryLight = "#FF6B9E"; // A soft, professional pink
const primaryDark = "#FF88B5"; // A slightly lighter pink for dark mode

// Accent colors (A complementary teal)
const accentLight = "#3ACCC9";
const accentDark = "#4FE0DD";

// Background colors
const backgroundLight = "#F8F9FA";
const backgroundDark = "#F8F9FA";

// Text colors
const text = "#333333";
// const textDark = '#E2E8F0';

// Card colors
const cardLight = "#FFFFFF";
const cardDark = "#2D3748";

export const Colors = {
  light: {
    text: text,
    background: backgroundLight,
    tint: primaryLight,
    accent: accentLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: primaryLight,
    card: cardLight,
    border: "#E2E8F0",
  },
  dark: {
    text: text,
    background: backgroundDark,
    tint: primaryDark,
    accent: accentDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryDark,
    card: cardDark,
    border: "#4A5568",
  },
};

// Additional colors for gradients, shadows, etc.
export const AdditionalColors = {
  success: "#4ADE80",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
  gradient: {
    start: primaryLight,
    end: accentLight,
  },
};
