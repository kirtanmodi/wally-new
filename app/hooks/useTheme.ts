import { useColorScheme } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { selectTheme, setTheme } from "../../redux/slices/appSlice";
import { AdditionalColors, BudgetColors, Colors } from "../constants/Colors";

export type ColorSchemeName = "light" | "dark" | "system";
export type ThemeType = "light" | "dark";

export function useTheme() {
  const dispatch = useDispatch();
  const themePreference = useSelector(selectTheme);
  const systemColorScheme = useColorScheme() as ThemeType | null;

  // Determine the actual theme based on user preference and system setting
  const activeTheme: ThemeType = themePreference === "system" ? systemColorScheme || "light" : (themePreference as ThemeType);

  // Get the colors for the current theme
  const colors = Colors[activeTheme];

  // Toggle between light and dark themes
  const toggleTheme = () => {
    dispatch(setTheme(activeTheme === "light" ? "dark" : "light"));
  };

  // Set a specific theme
  const changeTheme = (newTheme: ColorSchemeName) => {
    dispatch(setTheme(newTheme));
  };

  // Get a specific color from the current theme
  const getColor = (colorName: keyof typeof Colors.light & keyof typeof Colors.dark) => {
    return colors[colorName];
  };

  // Get a budget color
  const getBudgetColor = (colorName: keyof typeof BudgetColors) => {
    return BudgetColors[colorName];
  };

  // Get a category color
  const getCategoryColor = (category: keyof typeof BudgetColors.categories) => {
    return BudgetColors.categories[category];
  };

  // Get additional UI color
  const getUIColor = (colorName: keyof typeof AdditionalColors) => {
    return AdditionalColors[colorName];
  };

  // Apply theme to component style
  const applyTheme = (lightStyle: any, darkStyle: any) => {
    return activeTheme === "light" ? lightStyle : darkStyle;
  };

  return {
    theme: activeTheme,
    colors,
    budgetColors: BudgetColors,
    additionalColors: AdditionalColors,
    toggleTheme,
    changeTheme,
    getColor,
    getBudgetColor,
    getCategoryColor,
    getUIColor,
    applyTheme,
  };
}
