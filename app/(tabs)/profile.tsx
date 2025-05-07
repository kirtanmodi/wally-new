import { useClerk } from "@clerk/clerk-expo";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { selectBudgetRule, selectMonthlyIncome } from "../../redux/slices/budgetSlice";
import { selectExpenses } from "../../redux/slices/expenseSlice";
import {
  selectAuthProvider,
  selectUserAvatar,
  selectUserEmail,
  selectUserFullName,
  selectUserPreferences,
  selectUsername,
  setIsAuthenticated,
  updateProfile,
} from "../../redux/slices/userSlice";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { signOut } = useClerk();

  // User information
  const username = useSelector(selectUsername);
  const email = useSelector(selectUserEmail);
  const fullName = useSelector(selectUserFullName);
  const avatar = useSelector(selectUserAvatar);
  const preferences = useSelector(selectUserPreferences) || {};
  const authProvider = useSelector(selectAuthProvider);

  // Budget information
  const expenses = useSelector(selectExpenses) || [];
  const monthlyIncome = useSelector(selectMonthlyIncome) || 0;
  const budgetRules = useSelector(selectBudgetRule);

  // Default display names
  const displayName = fullName || username || "Guest User";
  const displayEmail = email || "user@example.com";

  // Determine membership status
  const membershipStatus = useMemo(() => {
    return preferences?.membership?.status || "free";
  }, [preferences]);

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
  const spendingPercentage = useMemo(() => {
    if (!monthlyIncome) return 0;
    return Math.min((totalSpent / monthlyIncome) * 100, 100);
  }, [totalSpent, monthlyIncome]);

  // Calculate category spending
  const categorySpending = useMemo(() => {
    const needs = currentMonthExpenses.filter((expense) => expense.category === "Needs").reduce((sum, expense) => sum + expense.amount, 0);

    const wants = currentMonthExpenses.filter((expense) => expense.category === "Wants").reduce((sum, expense) => sum + expense.amount, 0);

    const savings = currentMonthExpenses.filter((expense) => expense.category === "Savings").reduce((sum, expense) => sum + expense.amount, 0);

    return { needs, wants, savings };
  }, [currentMonthExpenses]);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return "$" + amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Handle avatar selection
  const handleAvatarSelection = useCallback(async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Denied", "You need to grant permission to access your photo library");
        return;
      }

      // Launch image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        const selectedImageUri = pickerResult.assets[0].uri;
        // Update profile with new avatar
        dispatch(updateProfile({ avatar: selectedImageUri }));
      }
    } catch (error) {
      console.error("Error selecting avatar:", error);
      Alert.alert("Error", "There was an error selecting your avatar");
    }
  }, [dispatch]);

  // Navigation handlers
  const handleNavigateToSettings = useCallback(() => {
    router.push("/(tabs)/settings");
  }, [router]);

  const handleNavigateToAnalytics = useCallback(() => {
    router.push("/(tabs)/analytics");
  }, [router]);

  // Menu item handlers
  const handleMenuItemPress = useCallback(
    (section: string) => {
      switch (section) {
        case "notifications":
          router.push("/(modals)/notifications");
          break;
        case "privacy":
          router.push("/(modals)/privacy");
          break;
        case "payment":
        case "help":
        default:
          // If route doesn't exist yet, show alert
          Alert.alert("Coming Soon", `The ${section} section is coming soon!`);
      }
    },
    [router]
  );

  // Handle membership upgrade
  const handleUpgradeMembership = useCallback(() => {
    if (membershipStatus === "premium") {
      Alert.alert("Already Premium", "You're already enjoying premium benefits!");
    } else {
      Alert.alert("Upgrade to Premium", "Would you like to upgrade to a premium membership for exclusive features?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Upgrade",
          onPress: () => {
            // In a real app, you would handle payment processing here
            dispatch(
              updateProfile({
                preferences: {
                  membership: {
                    status: "premium",
                    startDate: new Date().toISOString(),
                  },
                },
              })
            );
            Alert.alert("Success", "You've been upgraded to Premium!");
          },
        },
      ]);
    }
  }, [dispatch, membershipStatus]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.profileCard} entering={FadeIn.duration(300)}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={handleNavigateToSettings}>
              <FontAwesome name="gear" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Profile picture and name */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={avatar ? { uri: avatar } : require("../../assets/images/wally_logo.png")}
                style={styles.avatar}
                defaultSource={require("../../assets/images/wally_logo.png")}
              />
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleAvatarSelection}>
                <FontAwesome name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{displayEmail}</Text>
            <TouchableOpacity
              style={[styles.membershipBadge, membershipStatus === "premium" ? styles.premiumBadge : styles.freeBadge]}
              onPress={handleUpgradeMembership}
            >
              <FontAwesome name="star" size={12} color={membershipStatus === "premium" ? "#FFD700" : "#888"} />
              <Text style={[styles.membershipText, membershipStatus === "premium" ? styles.premiumText : styles.freeText]}>
                {membershipStatus === "premium" ? "Premium Member" : "Free Account"}
              </Text>
            </TouchableOpacity>
            <View style={styles.statsContainer}>
              {/* Display auth method badge */}
              {authProvider && (
                <View style={styles.authBadgeContainer}>
                  <FontAwesome name={authProvider === "google" ? "google" : "envelope"} size={14} color="#fff" style={styles.authBadgeIcon} />
                  <Text style={styles.authBadgeText}>{authProvider === "google" ? "Google" : "Email"} Login</Text>
                </View>
              )}
            </View>
          </View>

          {/* Budget Stats */}
          <View style={styles.statsCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Budget Stats</Text>
              <TouchableOpacity onPress={handleNavigateToAnalytics}>
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

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress("notifications")}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="bell" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuSubtext}>Manage your alerts</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress("privacy")}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="shield" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Privacy & Security</Text>
              <Text style={styles.menuSubtext}>Manage your account security</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress("payment")}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="credit-card" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Payment Methods</Text>
              <Text style={styles.menuSubtext}>Manage your payment options</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress("help")}>
            <View style={styles.menuIconContainer}>
              <FontAwesome name="question-circle" size={20} color="#8A2BE2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuSubtext}>Get assistance and FAQs</Text>
            </View>
            <FontAwesome name="angle-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutButton]}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to log out?", [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Logout",
                  onPress: () => {
                    signOut();
                    dispatch(setIsAuthenticated(false));
                    router.replace("/(auth)/login");
                  },
                  style: "destructive",
                },
              ]);
            }}
          >
            <View style={styles.menuIconContainer}>
              <FontAwesome name="sign-out" size={20} color="#ff3b30" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuText, { color: "#ff3b30" }]}>Logout</Text>
              <Text style={styles.menuSubtext}>Sign out of your account</Text>
            </View>
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
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  premiumBadge: {
    backgroundColor: "#FFF9E5",
    borderColor: "#FFE082",
  },
  freeBadge: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  membershipText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  premiumText: {
    color: "#D4A000",
  },
  freeText: {
    color: "#666",
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
  logoutButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  authBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8A2BE2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: "center",
  },
  authBadgeIcon: {
    marginRight: 6,
  },
  authBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
