import React from "react";
import { KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform, ScrollView, StyleSheet, View, ViewStyle } from "react-native";

interface KeyboardAwareViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
  keyboardVerticalOffset?: number;
  behavior?: KeyboardAvoidingViewProps["behavior"];
  isModal?: boolean;
}

export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  style,
  scrollEnabled = true,
  keyboardVerticalOffset = 0,
  behavior = Platform.OS === "ios" ? "padding" : "height",
  isModal = false,
}) => {
  const offset = isModal && Platform.OS === "ios" ? 10 : keyboardVerticalOffset;
  const modalBehavior = isModal ? "position" : behavior;

  if (scrollEnabled) {
    return (
      <KeyboardAvoidingView style={[styles.container, style]} behavior={modalBehavior} keyboardVerticalOffset={offset}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, style]} behavior={modalBehavior} keyboardVerticalOffset={offset}>
      <View style={styles.innerContainer}>{children}</View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
  },
});
