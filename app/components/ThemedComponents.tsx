import React from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
  StyleSheet,
  TextInputProps,
  TextProps,
  TouchableOpacityProps,
  ViewProps,
} from "react-native";
import { useThemeContext } from "./ThemeProvider";

// Themed Text component
export function Text({ style, lightColor, darkColor, ...props }: TextProps & { lightColor?: string; darkColor?: string }) {
  const { theme, colors } = useThemeContext();

  const color = theme === "light" ? lightColor ?? colors.text : darkColor ?? colors.text;

  return <RNText style={[{ color }, style]} {...props} />;
}

// Themed View component
export function View({
  style,
  lightBackgroundColor,
  darkBackgroundColor,
  ...props
}: ViewProps & { lightBackgroundColor?: string; darkBackgroundColor?: string }) {
  const { theme, colors } = useThemeContext();

  const backgroundColor = theme === "light" ? lightBackgroundColor ?? colors.background : darkBackgroundColor ?? colors.background;

  return <RNView style={[{ backgroundColor }, style]} {...props} />;
}

// Themed Card component
export function Card({ style, ...props }: ViewProps) {
  const { theme, colors } = useThemeContext();

  return (
    <RNView
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        style,
      ]}
      {...props}
    />
  );
}

// Themed TextInput component
export function TextInput({ style, placeholderTextColor, ...props }: TextInputProps) {
  const { colors } = useThemeContext();

  return (
    <RNTextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.inputBackground,
          color: colors.text,
          borderColor: colors.border,
        },
        style,
      ]}
      placeholderTextColor={placeholderTextColor || colors.placeholder}
      {...props}
    />
  );
}

// Themed Button component
export function Button({ style, textStyle, title, ...props }: TouchableOpacityProps & { title: string; textStyle?: TextProps["style"] }) {
  const { colors } = useThemeContext();

  return (
    <RNTouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.tint,
        },
        style,
      ]}
      {...props}
    >
      <RNText
        style={[
          styles.buttonText,
          {
            color: "#FFFFFF",
          },
          textStyle,
        ]}
      >
        {title}
      </RNText>
    </RNTouchableOpacity>
  );
}

// Themed separator
export function Separator({ style }: ViewProps) {
  const { colors } = useThemeContext();

  return (
    <RNView
      style={[
        styles.separator,
        {
          backgroundColor: colors.border,
        },
        style,
      ]}
    />
  );
}

// Styles
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    width: "100%",
    marginVertical: 8,
  },
});
