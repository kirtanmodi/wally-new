import React from "react";
import { Keyboard, KeyboardAvoidingView, KeyboardAvoidingViewProps, Platform, ScrollView, StyleSheet, View, ViewStyle } from "react-native";

interface KeyboardAwareViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
  keyboardVerticalOffset?: number;
  behavior?: KeyboardAvoidingViewProps["behavior"];
  isModal?: boolean;
  shouldDismissKeyboard?: boolean;
}

export const dismissKeyboard = () => {
  Keyboard.dismiss();
};

export const KeyboardAwareView: React.FC<KeyboardAwareViewProps> = ({
  children,
  style,
  scrollEnabled = true,
  keyboardVerticalOffset = 0,
  behavior = Platform.OS === "ios" ? "padding" : "height",
  isModal = false,
  shouldDismissKeyboard = true,
}) => {
  const offset = isModal && Platform.OS === "ios" ? 10 : keyboardVerticalOffset;
  const modalBehavior = isModal ? "position" : behavior;

  const handleScrollViewPress = () => {
    if (shouldDismissKeyboard) {
      Keyboard.dismiss();
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, style]} behavior={isModal ? modalBehavior : behavior} keyboardVerticalOffset={offset}>
      {scrollEnabled ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          scrollEventThrottle={16}
          bounces={true}
          alwaysBounceVertical={true}
          onScrollBeginDrag={handleScrollViewPress}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.innerContainer}>{children}</View>
      )}
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
