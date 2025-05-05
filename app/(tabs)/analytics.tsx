import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSelector } from "react-redux";
import { selectBudgetRule, selectCategories, selectCurrency, selectMonthlyIncome } from "../../redux/slices/budgetSlice";
import { selectExpenses } from "../../redux/slices/expenseSlice";
import { BudgetCategory } from "../types/budget";
import { getCurrentMonthYearKey } from "../utils/dateUtils";

const { width } = Dimensions.get("window");

type TimePeriod = "Month" | "Quarter" | "Year";

interface CategorySpending {
  id: string;
  name: string;
  icon: string;
  amount: number;
  percentage: number;
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const expenses = useSelector(selectExpenses);
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRules = useSelector(selectBudgetRule);
  const categories = useSelector(selectCategories);
  const currency = useSelector(selectCurrency);

  const [currentDate] = useState(new Date());
  const [selectedMonth] = useState(getCurrentMonthYearKey());
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("Month");
  const [isLoading, setIsLoading] = useState(false);

  // Simulating data loading when changing period
  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setIsLoading(true);
    setSelectedPeriod(period);

    // Simulate API call or heavy computation
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter expenses based on selected period
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    // Set start date based on selected period
    if (selectedPeriod === "Month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (selectedPeriod === "Quarter") {
      startDate.setMonth(now.getMonth() - 3);
    } else if (selectedPeriod === "Year") {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= now;
    });
  }, [expenses, selectedPeriod]);

  // Calculate the 50-30-20 budget performance (or whatever your user's budget rule is)
  const totalSpent = useMemo(() => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0), [filteredExpenses]);

  const needsTotal = useMemo(
    () => filteredExpenses.filter((expense) => expense.category === ("Needs" as BudgetCategory)).reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const wantsTotal = useMemo(
    () => filteredExpenses.filter((expense) => expense.category === ("Wants" as BudgetCategory)).reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const savingsTotal = useMemo(
    () => filteredExpenses.filter((expense) => expense.category === ("Savings" as BudgetCategory)).reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  // Calculate monthly income based on period
  const periodIncome = useMemo(() => {
    if (selectedPeriod === "Month") {
      return monthlyIncome;
    } else if (selectedPeriod === "Quarter") {
      return monthlyIncome * 3;
    } else {
      return monthlyIncome * 12;
    }
  }, [monthlyIncome, selectedPeriod]);

  // Budget allocation percentages from user's budget rule
  const needsAllocation = useMemo(() => (periodIncome * budgetRules.needs) / 100, [periodIncome, budgetRules.needs]);
  const wantsAllocation = useMemo(() => (periodIncome * budgetRules.wants) / 100, [periodIncome, budgetRules.wants]);
  const savingsAllocation = useMemo(() => (periodIncome * budgetRules.savings) / 100, [periodIncome, budgetRules.savings]);

  // Calculate percentage used
  const needsPercentage = useMemo(() => (needsAllocation > 0 ? (needsTotal / needsAllocation) * 100 : 0), [needsTotal, needsAllocation]);
  const wantsPercentage = useMemo(() => (wantsAllocation > 0 ? (wantsTotal / wantsAllocation) * 100 : 0), [wantsTotal, wantsAllocation]);
  const savingsPercentage = useMemo(() => (savingsAllocation > 0 ? (savingsTotal / savingsAllocation) * 100 : 0), [savingsTotal, savingsAllocation]);

  // Calculate spending by subcategory
  const categorySpending: CategorySpending[] = useMemo(() => {
    // First, get the total amount spent per subcategory
    const spendingBySubcategory = filteredExpenses.reduce((acc, expense) => {
      const subcategory = expense.subcategory;
      if (!acc[subcategory]) {
        acc[subcategory] = 0;
      }
      acc[subcategory] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Next, transform into an array with additional info
    return Object.entries(spendingBySubcategory)
      .map(([subcategory, amount]) => {
        // Find the category in our predefined list
        const categoryInfo = categories.find((cat) => cat.name.toLowerCase() === subcategory.toLowerCase()) || {
          id: subcategory,
          name: subcategory,
          icon: "📝",
          type: "Wants" as BudgetCategory,
        };

        return {
          id: categoryInfo.id,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          amount,
          percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, categories, totalSpent]);

  // Top spending categories limited to 3
  const topCategories = useMemo(() => categorySpending.slice(0, 3), [categorySpending]);

  // Get top 4 categories for the pie chart
  const pieChartData = useMemo(() => {
    const top4 = categorySpending.slice(0, 4);

    // Calculate percentages
    const totalTopSpending = top4.reduce((sum, cat) => sum + cat.amount, 0);

    return top4.map((cat) => ({
      ...cat,
      percentage: totalTopSpending > 0 ? (cat.amount / totalTopSpending) * 100 : 0,
    }));
  }, [categorySpending]);

  // Calculate total remaining budget
  const remainingBudget = useMemo(() => periodIncome - totalSpent, [periodIncome, totalSpent]);

  // Get the period display string
  const getPeriodDisplayString = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (selectedPeriod === "Month") {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else if (selectedPeriod === "Quarter") {
      const quarterStartMonth = Math.floor(currentDate.getMonth() / 3) * 3;
      return `${monthNames[quarterStartMonth]} - ${monthNames[Math.min(quarterStartMonth + 2, 11)]} ${currentDate.getFullYear()}`;
    } else {
      return `${currentDate.getFullYear()}`;
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Determine status colors
  const getStatusColor = (percentage: number) => {
    if (percentage < 85) return "#4cd964"; // Green - within budget
    if (percentage < 100) return "#ff9500"; // Yellow - close to limit
    return "#ff3b30"; // Red - over budget
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <TouchableOpacity style={styles.calendarButton} onPress={() => router.push("/(tabs)/settings")}>
            <FontAwesome name="calendar" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Time period selector */}
        <View style={styles.periodSelector}>
          {["Month", "Quarter", "Year"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodOption, selectedPeriod === period && styles.selectedPeriod]}
              onPress={() => handlePeriodChange(period as TimePeriod)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.selectedPeriodText]}>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading analytics data...</Text>
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
            {/* Budget Performance Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                {budgetRules.needs}-{budgetRules.wants}-{budgetRules.savings} Budget Performance
              </Text>

              {/* Needs Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Needs ({budgetRules.needs}%)</Text>
                  <Text style={[styles.progressValue, { color: getStatusColor(needsPercentage) }]}>
                    {Math.min(needsPercentage, 100).toFixed(0)}% used
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(needsPercentage, 100)}%`,
                        backgroundColor: getStatusColor(needsPercentage),
                      },
                    ]}
                  />
                </View>
                <View style={styles.spendingSummary}>
                  <Text style={styles.spendingText}>
                    {formatCurrency(needsTotal)} of {formatCurrency(needsAllocation)}
                  </Text>
                </View>
              </View>

              {/* Wants Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Wants ({budgetRules.wants}%)</Text>
                  <Text style={[styles.progressValue, { color: getStatusColor(wantsPercentage) }]}>
                    {Math.min(wantsPercentage, 100).toFixed(0)}% used
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(wantsPercentage, 100)}%`,
                        backgroundColor: getStatusColor(wantsPercentage),
                      },
                    ]}
                  />
                </View>
                <View style={styles.spendingSummary}>
                  <Text style={styles.spendingText}>
                    {formatCurrency(wantsTotal)} of {formatCurrency(wantsAllocation)}
                  </Text>
                </View>
              </View>

              {/* Savings Progress Bar */}
              <View style={styles.progressSection}>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Savings ({budgetRules.savings}%)</Text>
                  <Text style={[styles.progressValue, { color: getStatusColor(savingsPercentage) }]}>
                    {Math.min(savingsPercentage, 100).toFixed(0)}% used
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(savingsPercentage, 100)}%`,
                        backgroundColor: getStatusColor(savingsPercentage),
                      },
                    ]}
                  />
                </View>
                <View style={styles.spendingSummary}>
                  <Text style={styles.spendingText}>
                    {formatCurrency(savingsTotal)} of {formatCurrency(savingsAllocation)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Spending Breakdown Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Spending by Category</Text>
              <Text style={styles.periodTitle}>{getPeriodDisplayString()}</Text>

              {/* Category Circle Chart - In a real app, use a proper chart library */}
              <View style={styles.chartContainer}>
                <View style={styles.circleChartContainer}>
                  {pieChartData.length > 0 ? (
                    <View style={styles.outerRing}>
                      <View style={styles.middleRing}>
                        <View style={styles.innerRing}>
                          <View style={styles.centerRing}>
                            <Text style={styles.centerRingText}>{formatCurrency(totalSpent)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyChartPlaceholder}>
                      <Text style={styles.emptyChartText}>No spending data</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Legend */}
              <View style={styles.legendContainer}>
                {pieChartData.length > 0 ? (
                  pieChartData.map((category, index) => (
                    <View key={category.id} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: getColorForIndex(index) }]} />
                      <View style={styles.legendTextContainer}>
                        <Text style={styles.legendText}>
                          {category.name} ({category.percentage.toFixed(0)}%)
                        </Text>
                        <Text style={styles.legendAmount}>{formatCurrency(category.amount)}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>Add expenses to see your spending breakdown</Text>
                )}
              </View>
            </View>

            {/* Top Spending Categories Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Spending Trends</Text>
              <Text style={styles.subTitle}>Top Spending Categories</Text>

              {topCategories.length > 0 ? (
                topCategories.map((category, index) => (
                  <TouchableOpacity key={category.id} style={styles.topCategoryItem} onPress={() => router.push("/(tabs)/overview")}>
                    <View style={styles.categoryIconContainer}>
                      <View style={[styles.categoryIcon, { backgroundColor: getColorForIndex(index) }]}>
                        <Text>{category.icon}</Text>
                      </View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <View>
                      <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
                      <View style={styles.categoryBarContainer}>
                        <View
                          style={[
                            styles.categoryBar,
                            {
                              width: `${Math.min(category.percentage, 100)}%`,
                              backgroundColor: getColorForIndex(index),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <FontAwesome name="bar-chart" size={48} color="#DDD" />
                  <Text style={styles.noDataText}>Add expenses to see your top spending categories</Text>
                </View>
              )}
            </View>

            {/* Budget Summary Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Budget Summary</Text>
              <Text style={styles.periodTitle}>{getPeriodDisplayString()}</Text>

              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Period Income</Text>
                <Text style={styles.budgetAmount}>{formatCurrency(periodIncome)}</Text>
              </View>

              <View style={styles.budgetItem}>
                <Text style={styles.budgetLabel}>Total Spent</Text>
                <Text style={styles.budgetAmount}>{formatCurrency(totalSpent)}</Text>
              </View>

              <View style={styles.budgetItem}>
                <Text style={[styles.budgetLabel, styles.remainingLabel]}>Remaining Budget</Text>
                <Text style={[styles.budgetAmount, { color: remainingBudget > 0 ? "#4cd964" : "#ff3b30" }]}>{formatCurrency(remainingBudget)}</Text>
              </View>

              <View style={styles.budgetProgressContainer}>
                <View
                  style={[
                    styles.budgetProgress,
                    {
                      width: periodIncome > 0 ? `${Math.min((totalSpent / periodIncome) * 100, 100)}%` : 0,
                      backgroundColor: totalSpent > periodIncome ? "#ff3b30" : "#5e5ce6",
                    },
                  ]}
                />
              </View>

              <TouchableOpacity style={styles.viewDetailsButton} onPress={() => router.push("/(tabs)/overview")}>
                <Text style={styles.viewDetailsText}>View Budget Details</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get color for index
function getColorForIndex(index: number): string {
  const colors = ["#9c55ff", "#567cff", "#55ff6c", "#ffe455", "#ff9500", "#ff3b30", "#5e5ce6", "#4cd964"];
  return colors[index % colors.length];
}

// Helper function to get emoji for categories
function getEmojiForCategory(category: string): string {
  const mapping: Record<string, string> = {
    housing: "🏠",
    food: "🍔",
    groceries: "🛒",
    dining: "🍽️",
    transportation: "🚗",
    entertainment: "🎬",
    shopping: "🛍️",
    healthcare: "💊",
    education: "📚",
    utilities: "💡",
    insurance: "🔒",
    debt: "💳",
    savings: "💰",
    investments: "📈",
    personal: "👤",
    travel: "✈️",
  };

  const lowerCategory = category.toLowerCase();
  return mapping[lowerCategory] || "📝";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  periodSelector: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
    overflow: "hidden",
  },
  periodOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  selectedPeriod: {
    backgroundColor: "#007AFF",
  },
  periodText: {
    fontSize: 16,
    color: "#555",
  },
  selectedPeriodText: {
    color: "#FFF",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 15,
    color: "#555",
  },
  progressValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 8,
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  circleChartContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  outerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#9c55ff",
    justifyContent: "center",
    alignItems: "center",
  },
  middleRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#567cff",
    justifyContent: "center",
    alignItems: "center",
  },
  innerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#55ff6c",
    justifyContent: "center",
    alignItems: "center",
  },
  centerRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffe455",
    justifyContent: "center",
    alignItems: "center",
  },
  centerRingText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  chartLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginTop: 12,
  },
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendText: {
    fontSize: 14,
    color: "#555",
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  noDataText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },
  emptyChartPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChartText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  periodTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "right",
  },
  topCategoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  categoryIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    color: "#333",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
    marginBottom: 6,
  },
  categoryBarContainer: {
    width: width * 0.4,
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryBar: {
    height: "100%",
    borderRadius: 4,
  },
  budgetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 16,
    color: "#555",
  },
  remainingLabel: {
    fontWeight: "600",
    color: "#333",
  },
  budgetAmount: {
    fontSize: 16,
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
    borderRadius: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyStateContainer: {
    alignItems: "center",
    padding: 30,
  },
  spendingSummary: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  spendingText: {
    fontSize: 12,
    color: "#666",
  },
  viewDetailsButton: {
    marginTop: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
