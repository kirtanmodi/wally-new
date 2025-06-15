import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useEffect } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scaleFontSize, responsivePadding } from "../app/utils/responsive";

interface OnboardingStepProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  nextButtonText?: string;
  nextButtonDisabled?: boolean;
  showBackButton?: boolean;
  showSkipButton?: boolean;
  onSkip?: () => void;
}

const OnboardingStep: React.FC<OnboardingStepProps> = ({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextButtonText = "Continue",
  nextButtonDisabled = false,
  showBackButton = true,
  showSkipButton = false,
  onSkip,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderProgressBar = () => {
    const progress = (currentStep / totalSteps) * 100;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentStep} of {totalSteps}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {showBackButton && currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {showSkipButton && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderProgressBar()}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={[
          styles.nextButton,
          nextButtonDisabled && styles.nextButtonDisabled,
        ]}
        onPress={onNext}
        disabled={nextButtonDisabled}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.nextButtonText,
            nextButtonDisabled && styles.nextButtonTextDisabled,
          ]}
        >
          {nextButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={["#7FAFF5", "#7FAFF5"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {children}
        </Animated.View>
        {onNext && renderFooter()}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: responsivePadding(20),
    paddingTop: responsivePadding(20),
    paddingBottom: responsivePadding(30),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: responsivePadding(20),
    minHeight: 60,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: responsivePadding(10),
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(14),
    fontWeight: "600",
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(14),
    fontWeight: "600",
  },
  title: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBackground: {
    width: "80%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: scaleFontSize(12),
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: responsivePadding(20),
  },
  footer: {
    padding: responsivePadding(20),
    paddingBottom: responsivePadding(30),
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  nextButtonText: {
    color: "#5B6EF5",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  nextButtonTextDisabled: {
    color: "rgba(91, 110, 245, 0.5)",
  },
});

export default OnboardingStep;