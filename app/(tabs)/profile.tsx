import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSelector } from "react-redux";
import { selectBudgetRule, selectMonthlyIncome } from "../../redux/slices/budgetSlice";
import { selectExpenses } from "../../redux/slices/expenseSlice";

export default function ProfileScreen() {
  const router = useRouter();
  const expenses = useSelector(selectExpenses);
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRules = useSelector(selectBudgetRule);

  // Filter expenses for current month
  const currentMonthExpenses = useMemo(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= firstDayOfMonth;
    });
  }, [expenses]);

  // Calculate current spending
  const totalSpent = useMemo(() => currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0), [currentMonthExpenses]);
  const remainingBudget = useMemo(() => monthlyIncome - totalSpent, [monthlyIncome, totalSpent]);
  const spendingPercentage = useMemo(() => Math.min((totalSpent / monthlyIncome) * 100, 100), [totalSpent, monthlyIncome]);

  // Calculate category spending
  const categorySpending = useMemo(() => {
    const needs = currentMonthExpenses.filter((expense) => expense.category === "Needs").reduce((sum, expense) => sum + expense.amount, 0);

    const wants = currentMonthExpenses.filter((expense) => expense.category === "Wants").reduce((sum, expense) => sum + expense.amount, 0);

    const savings = currentMonthExpenses.filter((expense) => expense.category === "Savings").reduce((sum, expense) => sum + expense.amount, 0);

    return { needs, wants, savings };
  }, [currentMonthExpenses]);

  // GTD (Getting Things Done) stats
  // In a real app, these would come from a user's task management system
  const tasksCompleted = 15;
  const activeProjects = 6;
  const currentStreak = 8;

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return "$" + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.profileCard} entering={FadeIn.duration(300)}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={() => router.push("/(tabs)/settings")}>
              <FontAwesome name="gear" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Profile picture and name */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image source={require("../../assets/images/icon.png")} style={styles.avatar} defaultSource={require("../../assets/images/icon.png")} />
              <TouchableOpacity style={styles.editAvatarButton}>
                <FontAwesome name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>Alex Johnson</Text>
            <Text style={styles.userEmail}>alex.johnson@example.com</Text>
            <View style={styles.membershipBadge}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.membershipText}>Premium Member</Text>
            </View>
          </View>

          {/* GTD Stats */}
          <View style={styles.statsCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>GTD Stats</Text>
              <TouchableOpacity>
                <Text style={styles.viewMoreLink}>View Details</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{tasksCompleted}</Text>
                <Text style={styles.statLabel}>Tasks Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeProjects}</Text>
                <Text style={styles.statLabel}>Projects Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Days Streak</Text>
              </View>
            </View>
          </View>

          {/* Budget Stats */}
          <View style={styles.statsCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Budget Stats</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/analytics")}>
                <Text style={styles.viewMoreLink}>View Analytics</Text>
              </TouchableOpacity>
            </View>

            {/* Budget Overview */}
            <View style={styles.budgetOverview}>
              <View style={styles.budgetCircleContainer}>
                <View style={styles.budgetCircle}>
                  <Text style={styles.budgetCircleAmount}>{formatCurrency(remainingBudget)}</Text>
                  <Text style={styles.budgetCircleLabel}>Remaining</Text>
                </View>
                {/* Overlay spending indicator */}
                <View
                  style={[
                    styles.spendingOverlay,
                    {
                      height: `${spendingPercentage}%`,
                      backgroundColor: spendingPercentage > 90 ? "#ff3b30" : spendingPercentage > 70 ? "#ff9500" : "#4cd964",
                    },
                  ]}
                />
              </View>

              <View style={styles.budgetDetails}>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Monthly Income</Text>
                  <Text style={styles.budgetAmount}>{formatCurrency(monthlyIncome)}</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Current Spending</Text>
                  <Text style={styles.budgetAmount}>{formatCurrency(totalSpent)}</Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Remaining Budget</Text>
                  <Text style={[styles.budgetAmount, { color: remainingBudget > 0 ? "#4cd964" : "#ff3b30" }]}>{formatCurrency(remainingBudget)}</Text>
                </View>
              </View>
            </View>

            {/* Budget categories breakdown */}
            <View style={styles.categoriesBreakdown}>
              <Text style={styles.categoriesTitle}>Budget Breakdown</Text>

              {/* Needs */}
              <View style={styles.categoryRow}>
                <View style={styles.categoryLabelContainer}>
                  <View style={[styles.categoryDot, { backgroundColor: "#4cd964" }]} />
                  <Text style={styles.categoryLabel}>Needs ({budgetRules.needs}%)</Text>
                </View>
                <Text style={styles.categoryAmount}>{formatCurrency(categorySpending.needs)}</Text>
              </View>

              {/* Wants */}
              <View style={styles.categoryRow}>
                <View style={styles.categoryLabelContainer}>
                  <View style={[styles.categoryDot, { backgroundColor: "#5e5ce6" }]} />
                  <Text style={styles.categoryLabel}>Wants ({budgetRules.wants}%)</Text>
                </View>
                <Text style={styles.categoryAmount}>{formatCurrency(categorySpending.wants)}</Text>
              </View>

              {/* Savings */}
              <View style={styles.categoryRow}>
                <View style={styles.categoryLabelContainer}>
                  <View style={[styles.categoryDot, { backgroundColor: "#ff9500" }]} />
                  <Text style={styles.categoryLabel}>Savings ({budgetRules.savings}%)</Text>
                </View>
                <Text style={styles.categoryAmount}>{formatCurrency(categorySpending.savings)}</Text>
              </View>
            </View>

            <View style={styles.budgetProgressContainer}>
              <View style={[styles.budgetProgress, { width: `${spendingPercentage}%` }]} />
            </View>
          </View>

          {/* Menu items */}
          <Text style={styles.menuSectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="bell" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuSubtext}>Manage your alerts</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="shield" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Privacy & Security</Text>
              <Text style={styles.menuSubtext}>Manage your account security</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="credit-card" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Payment Methods</Text>
              <Text style={styles.menuSubtext}>Manage your payment options</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="question-circle" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuSubtext}>Get assistance and FAQs</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E9ECEF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#8A2BE2",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#FFE082",
  },
  membershipText: {
    fontSize: 12,
    color: "#D4A000",
    fontWeight: "600",
    marginLeft: 6,
  },
  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  viewMoreLink: {
    fontSize: 14,
    color: "#007AFF",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8A2BE2",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  budgetOverview: {
    flexDirection: "row",
    marginBottom: 16,
  },
  budgetCircleContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
    overflow: "hidden",
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
  },
  budgetCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  budgetCircleAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  budgetCircleLabel: {
    fontSize: 12,
    color: "#666",
  },
  spendingOverlay: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  budgetDetails: {
    flex: 1,
    justifyContent: "center",
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 14,
    color: "#555",
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  categoriesBreakdown: {
    marginVertical: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#555",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  budgetProgressContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  budgetProgress: {
    height: "100%",
    backgroundColor: "#5e5ce6",
    borderRadius: 4,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F580",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  menuSubtext: {
    fontSize: 12,
    color: "#888",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: "#888",
  },
});
