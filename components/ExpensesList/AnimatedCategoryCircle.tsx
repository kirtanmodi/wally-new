import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSelector } from "react-redux";
import { CategorySummary } from "../../app/types/budget";
import { formatCurrency } from "../../app/utils/currency";
import { responsiveMargin, scaleFontSize, wp } from "../../app/utils/responsive";
import { selectCurrency, selectDenominationFormat } from "../../redux/slices/budgetSlice";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedCategoryCircleProps {
  item: CategorySummary;
  index: number;
  onOpenBudget?: () => void;
  onOpenNeedsDetail?: () => void;
  onOpenWantsDetail?: () => void;
  onOpenSavingsDetail?: () => void;
}

const AnimatedCategoryCircle: React.FC<AnimatedCategoryCircleProps> = ({
  item,
  index,
  onOpenBudget,
  onOpenNeedsDetail,
  onOpenWantsDetail,
  onOpenSavingsDetail,
}) => {
  const percentage = Math.min(100, (item.spent / item.total) * 100);
  const isOverBudget = item.spent > item.total;
  const remaining = Math.max(0, item.total - item.spent);
  const overAmount = isOverBudget ? item.spent - item.total : 0;

  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const warningFade = useRef(new Animated.Value(0)).current;

  const currency = useSelector(selectCurrency);
  const denominationFormat = useSelector(selectDenominationFormat);

  const circleRadius = wp(10);
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDasharray = circumference;

  useEffect(() => {
    // Staggered animation
    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(itemSlide, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress ring
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 1000,
      delay: index * 100 + 200,
      useNativeDriver: false,
    }).start();

    // Add pulsing animation if over budget
    if (isOverBudget && item.category !== "Savings") {
      // Animated.loop(
      //   Animated.sequence([
      //     Animated.timing(pulseAnim, {
      //       toValue: 1.05,
      //       duration: 800,
      //       useNativeDriver: true,
      //     }),
      //     Animated.timing(pulseAnim, {
      //       toValue: 1,
      //       duration: 800,
      //       useNativeDriver: true,
      //     }),
      //   ])
      // ).start();

      Animated.timing(warningFade, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOverBudget, percentage, index]);

  const handleCategoryPress = () => {
    if (item.category === "Needs") {
      onOpenNeedsDetail?.();
    } else if (item.category === "Wants") {
      onOpenWantsDetail?.();
    } else if (item.category === "Savings") {
      onOpenSavingsDetail?.();
    } else {
      onOpenBudget?.();
    }
  };

  return (
    <Animated.View
      style={{
        opacity: itemFade,
        transform: [{ translateY: itemSlide }],
        alignItems: "center",
        marginHorizontal: responsiveMargin(8),
      }}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={handleCategoryPress}>
        <View style={styles.categoryCircleContainer}>
          {/* Background Circle */}
          <LinearGradient
            colors={isOverBudget && item.category !== "Savings" ? ["#FF7171", "#FF4040"] : (item.gradientColors as [string, string])}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryCircle}
          >
            {/* Progress Ring */}
            <View style={styles.progressContainer}>
              <Svg width={wp(25)} height={wp(25)} style={styles.progressSvg}>
                {/* Background circle */}
                <Circle
                  cx={wp(25) / 2}
                  cy={wp(25) / 2}
                  r={circleRadius}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress circle */}
                <AnimatedCircle
                  cx={wp(25) / 2}
                  cy={wp(25) / 2}
                  r={circleRadius}
                  stroke="#FFFFFF"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: [circumference, 0],
                  })}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${wp(25) / 2} ${wp(25) / 2})`}
                />
              </Svg>

              {/* Center Content */}
              <View style={styles.centerContent}>
                <Text style={styles.categoryPercentage}>{Math.round(percentage)}%</Text>
                <Text style={styles.categoryLabel}>{item.category}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Over Budget Badge */}
          {isOverBudget && item.category !== "Savings" && (
            <View style={styles.overBudgetBadge}>
              <Text style={styles.overBudgetIcon}>!</Text>
            </View>
          )}
        </View>

        {/* Budget Information */}
        <View style={styles.budgetInfo}>
          <View style={styles.spentContainer}>
            <Text style={styles.spentLabel}>Spent</Text>
            <Text style={[styles.spentAmount, isOverBudget && styles.overBudgetText]}>
              {formatCurrency(item.spent, currency, denominationFormat)}
            </Text>
          </View>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingLabel}>{isOverBudget ? "Over by" : "Remaining"}</Text>
            <Text style={[styles.remainingAmount, isOverBudget ? styles.overBudgetText : styles.remainingPositive]}>
              {formatCurrency(isOverBudget ? overAmount : remaining, currency, denominationFormat)}
            </Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Budget</Text>
            <Text style={styles.totalAmount}>{formatCurrency(item.total, currency, denominationFormat)}</Text>
          </View>
        </View>

        {/* Over Budget Warning */}
        {isOverBudget && item.category !== "Savings" && (
          <Animated.Text style={[styles.overBudgetMessage, { opacity: warningFade }]}>Over budget</Animated.Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  categoryCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  categoryCircle: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(25) / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  progressContainer: {
    position: "relative",
    width: wp(25),
    height: wp(25),
    justifyContent: "center",
    alignItems: "center",
  },
  progressSvg: {
    position: "absolute",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  categoryPercentage: {
    fontSize: scaleFontSize(16),
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryLabel: {
    fontSize: scaleFontSize(10),
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: responsiveMargin(1),
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  overBudgetBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF4040",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  overBudgetIcon: {
    fontSize: scaleFontSize(13),
    fontWeight: "900",
    color: "#FF4040",
    textAlign: "center",
  },
  budgetInfo: {
    marginTop: responsiveMargin(12),
    alignItems: "center",
    minWidth: wp(25),
  },
  spentContainer: {
    alignItems: "center",
    marginBottom: responsiveMargin(6),
  },
  spentLabel: {
    fontSize: scaleFontSize(11),
    fontWeight: "500",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  spentAmount: {
    fontSize: scaleFontSize(14),
    fontWeight: "700",
    color: "#333",
    marginTop: responsiveMargin(2),
  },
  remainingContainer: {
    alignItems: "center",
    marginBottom: responsiveMargin(6),
  },
  remainingLabel: {
    fontSize: scaleFontSize(11),
    fontWeight: "500",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  remainingAmount: {
    fontSize: scaleFontSize(13),
    fontWeight: "600",
    marginTop: responsiveMargin(2),
  },
  remainingPositive: {
    color: "#27AE60",
  },
  totalContainer: {
    alignItems: "center",
  },
  totalLabel: {
    fontSize: scaleFontSize(10),
    fontWeight: "500",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: scaleFontSize(12),
    fontWeight: "500",
    color: "#777",
    marginTop: responsiveMargin(1),
  },
  overBudgetText: {
    color: "#FF4040",
  },
  overBudgetMessage: {
    fontSize: scaleFontSize(11),
    fontWeight: "600",
    color: "#FF4040",
    marginTop: responsiveMargin(4),
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default AnimatedCategoryCircle;
