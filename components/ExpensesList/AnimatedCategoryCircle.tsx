import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { CategorySummary } from "../../app/types/budget";
import { formatCurrency } from "../../app/utils/currency";
import { responsiveMargin, scaleFontSize, wp } from "../../app/utils/responsive";
import { selectCurrency } from "../../redux/slices/budgetSlice";

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
  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const warningFade = useRef(new Animated.Value(0)).current;
  const currency = useSelector(selectCurrency);

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

    // Add pulsing animation if over budget
    if (isOverBudget && item.category !== "Savings") {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Warning text fade in
      Animated.timing(warningFade, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOverBudget]);

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
        <Animated.View style={[styles.categoryCircleContainer, isOverBudget && item.category !== "Savings" && {}]}>
          <LinearGradient
            colors={isOverBudget && item.category !== "Savings" ? ["#FF7171", "#FF4040"] : (item.gradientColors as [string, string])}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryCircle}
          >
            <Text style={styles.categoryPercentage}>{percentage ? Math.round(percentage) : 0}%</Text>
            <View style={styles.circleProgressContainer}>
              <View
                style={[
                  styles.circleProgress,
                  {
                    height: `${percentage}%`,
                    backgroundColor: "#FFFFFF",
                  },
                ]}
              />
            </View>
          </LinearGradient>
          {isOverBudget && item.category !== "Savings" && (
            <View style={styles.overBudgetBadge}>
              <Text style={styles.overBudgetIcon}>!</Text>
            </View>
          )}
        </Animated.View>
        <Text style={styles.categoryCircleLabel}>{item.category}</Text>
        <Text style={[styles.categoryCircleAmount, isOverBudget && styles.overBudgetText]}>
          {formatCurrency(item.spent, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </Text>
        <Text style={styles.categoryCircleTotal}>
          of {formatCurrency(item.total, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </Text>
        {isOverBudget && <Animated.Text style={[styles.overBudgetMessage, { opacity: warningFade }]}>Over budget</Animated.Text>}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  categoryCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCircle: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(25) / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  circleProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    opacity: 0.3,
  },
  circleProgress: {
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  categoryPercentage: {
    fontSize: scaleFontSize(18),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  categoryCircleLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#333",
    marginTop: responsiveMargin(8),
    textAlign: "center",
  },
  categoryCircleAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "700",
    color: "#333",
    marginTop: responsiveMargin(4),
    textAlign: "center",
  },
  categoryCircleTotal: {
    fontSize: scaleFontSize(12),
    color: "#777",
    textAlign: "center",
  },
  overBudgetBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FF4040",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  overBudgetIcon: {
    fontSize: scaleFontSize(12),
    fontWeight: "900",
    color: "#FF4040",
    textAlign: "center",
  },
  overBudgetText: {
    color: "#FF4040",
  },
  overBudgetMessage: {
    fontSize: scaleFontSize(12),
    fontWeight: "500",
    color: "#FF4040",
    marginTop: responsiveMargin(2),
    textAlign: "center",
  },
});

export default AnimatedCategoryCircle;
