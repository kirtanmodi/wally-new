import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import COLORS from "../constants/Colors";
import { formatCurrency } from "../utils/currency";
import { selectBudgetRule, selectCurrency, selectMonthlyIncome } from "../../redux/slices/budgetSlice";
import { selectExpenses } from "../../redux/slices/expenseSlice";
import { selectUserFullName } from "../../redux/slices/userSlice";

const { width } = Dimensions.get("window");

// Emotional Avatar Component
const EmotionalAvatar = ({ mood = "happy", size = 120 }: { mood?: string; size?: number }) => {
  const getExpression = () => {
    switch (mood) {
      case "happy": return "😊";
      case "neutral": return "😐";
      case "sad": return "😔";
      case "excited": return "🤩";
      default: return "😊";
    }
  };

  return (
    <View style={[styles.avatar, { width: size, height: size }]}>
      <LinearGradient
        colors={COLORS.gradients.pinkBlue}
        style={[styles.avatarGradient, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.avatarExpression, { fontSize: size * 0.4 }]}>
          {getExpression()}
        </Text>
      </LinearGradient>
    </View>
  );
};

// Feature Card Component
const FeatureCard = ({ 
  title, 
  subtitle, 
  icon, 
  colors, 
  onPress 
}: { 
  title: string; 
  subtitle: string; 
  icon: string; 
  colors: string[]; 
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={colors} style={styles.featureCard}>
        <View style={styles.featureCardContent}>
          <Text style={styles.featureCardIcon}>{icon}</Text>
          <Text style={styles.featureCardTitle}>{title}</Text>
          <Text style={styles.featureCardSubtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Quick Action Button
const QuickActionButton = ({ 
  icon, 
  label, 
  onPress, 
  color = COLORS.primary.blue 
}: { 
  icon: string; 
  label: string; 
  onPress: () => void;
  color?: string;
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.quickActionButton} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + "20" }]}>
        <FontAwesome name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const [currentMood, setCurrentMood] = useState("happy");
  const fullName = useSelector(selectUserFullName);
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const expenses = useSelector(selectExpenses);
  const currency = useSelector(selectCurrency);
  const budgetRule = useSelector(selectBudgetRule);

  // Calculate current month spending
  const currentMonthSpending = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((total, expense) => total + expense.amount, 0);

  const remainingBudget = monthlyIncome - currentMonthSpending;
  const spendingPercentage = monthlyIncome > 0 ? (currentMonthSpending / monthlyIncome) * 100 : 0;

  // Determine mood based on spending
  useEffect(() => {
    if (spendingPercentage < 50) {
      setCurrentMood("happy");
    } else if (spendingPercentage < 80) {
      setCurrentMood("neutral");
    } else if (spendingPercentage < 100) {
      setCurrentMood("sad");
    } else {
      setCurrentMood("sad");
    }
  }, [spendingPercentage]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = fullName?.split(" ")[0] || "there";

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push("/(modals)/notifications")}
          >
            <FontAwesome name="bell" size={20} color={COLORS.neutral.darkGray} />
          </TouchableOpacity>
        </View>

        {/* Emotional Avatar Section */}
        <Animated.View 
          style={[
            styles.avatarSection,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <EmotionalAvatar mood={currentMood} size={120} />
          <Text style={styles.moodQuestion}>How are your finances today?</Text>
          <Text style={styles.moodSubtext}>
            {spendingPercentage < 50 
              ? "You're doing great! Keep it up!" 
              : spendingPercentage < 80 
              ? "You're on track, stay mindful"
              : "Time to review your spending"}
          </Text>
        </Animated.View>

        {/* Budget Overview Card */}
        <View style={styles.budgetOverviewCard}>
          <LinearGradient
            colors={COLORS.gradients.blueGreen}
            style={styles.budgetGradient}
          >
            <View style={styles.budgetContent}>
              <Text style={styles.budgetLabel}>Monthly Budget</Text>
              <Text style={styles.budgetAmount}>
                {formatCurrency(remainingBudget, currency, "none")}
              </Text>
              <Text style={styles.budgetSubtext}>
                {remainingBudget >= 0 ? "remaining this month" : "over budget"}
              </Text>
              
              <View style={styles.budgetProgress}>
                <View style={styles.progressTrack}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(100, spendingPercentage)}%`,
                        backgroundColor: spendingPercentage > 100 ? COLORS.semantic.error : COLORS.neutral.white
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(spendingPercentage)}% used
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featureGrid}>
          <FeatureCard
            title="Track Expenses"
            subtitle="Log your daily spending"
            icon="💰"
            colors={COLORS.gradients.lightPink}
            onPress={() => router.push("/(modals)/add-expense")}
          />
          <FeatureCard
            title="Budget Goals"
            subtitle="Manage your targets"
            icon="🎯"
            colors={COLORS.gradients.wellness}
            onPress={() => router.push("/(tabs)/overview")}
          />
          <FeatureCard
            title="Analytics"
            subtitle="View spending insights"
            icon="📊"
            colors={COLORS.gradients.pinkBlue}
            onPress={() => router.push("/(tabs)/analytics")}
          />
          <FeatureCard
            title="Savings"
            subtitle="Build your future"
            icon="🏦"
            colors={COLORS.gradients.blueGreen}
            onPress={() => router.push("/(details)/savings")}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="plus"
              label="Add Expense"
              onPress={() => router.push("/(modals)/add-expense")}
              color={COLORS.primary.pink}
            />
            <QuickActionButton
              icon="pie-chart"
              label="View Budget"
              onPress={() => router.push("/(tabs)/overview")}
              color={COLORS.primary.blue}
            />
            <QuickActionButton
              icon="bar-chart"
              label="Analytics"
              onPress={() => router.push("/(tabs)/analytics")}
              color={COLORS.primary.green}
            />
            <QuickActionButton
              icon="gear"
              label="Settings"
              onPress={() => router.push("/(tabs)/settings")}
              color={COLORS.neutral.darkGray}
            />
          </View>
        </View>

        {/* Recent Activity Preview */}
        <View style={styles.recentActivitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/analytics")}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.slice(0, 3).map((expense, index) => (
            <View key={expense.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>{expense.icon}</Text>
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityTitle}>{expense.title}</Text>
                <Text style={styles.activityCategory}>{expense.subcategory}</Text>
              </View>
              <Text style={styles.activityAmount}>
                -{formatCurrency(expense.amount, currency, "none")}
              </Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push("/(modals)/add-expense")}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={COLORS.gradients.pinkBlue}
          style={styles.fabGradient}
        >
          <FontAwesome name="plus" size={24} color={COLORS.neutral.white} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.lightGray,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.neutral.darkGray,
    fontWeight: "400",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.neutral.black,
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatar: {
    marginBottom: 24,
  },
  avatarGradient: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarExpression: {
    color: COLORS.neutral.white,
  },
  moodQuestion: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.neutral.black,
    textAlign: "center",
    marginBottom: 8,
  },
  moodSubtext: {
    fontSize: 16,
    color: COLORS.neutral.darkGray,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  budgetOverviewCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  budgetGradient: {
    padding: 24,
  },
  budgetContent: {
    alignItems: "center",
  },
  budgetLabel: {
    fontSize: 16,
    color: COLORS.neutral.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.neutral.white,
    marginBottom: 4,
  },
  budgetSubtext: {
    fontSize: 14,
    color: COLORS.neutral.white,
    opacity: 0.8,
    marginBottom: 24,
  },
  budgetProgress: {
    width: "100%",
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.neutral.white,
    fontWeight: "500",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  featureCard: {
    width: (width - 48) / 2,
    margin: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureCardContent: {
    padding: 20,
    alignItems: "center",
  },
  featureCardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral.white,
    marginBottom: 4,
    textAlign: "center",
  },
  featureCardSubtitle: {
    fontSize: 14,
    color: COLORS.neutral.white,
    opacity: 0.9,
    textAlign: "center",
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.neutral.black,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionButton: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.neutral.darkGray,
    textAlign: "center",
  },
  recentActivitySection: {
    paddingHorizontal: 24,
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary.blue,
    fontWeight: "500",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.neutral.black,
    marginBottom: 2,
  },
  activityCategory: {
    fontSize: 14,
    color: COLORS.neutral.darkGray,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.semantic.error,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});