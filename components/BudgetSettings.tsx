import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AdditionalColors, BudgetColors } from "../app/constants/Colors";
import { BudgetCategory } from "../app/types/budget";
import { getCurrencySymbol } from "../app/utils/currency";
import { getCurrentMonthYearKey } from "../app/utils/dateUtils";
import { DenominationFormat, getFormatPreviews } from "../app/utils/denominationFormatter";
import { KeyboardAwareView } from "../app/utils/keyboard";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import {
  AVAILABLE_CURRENCIES,
  AdditionalIncomeItem,
  CurrencyInfo,
  addCategory,
  deleteCategory,
  selectBudgetRule,
  selectCategories,
  selectCategorySortOption,
  selectCurrency,
  selectDenominationFormat,
  selectMonthlyIncome,
  setCategorySortOption,
  setCurrency,
  setDenominationFormat,
  setMonthlyIncome,
  updateBudgetRule,
} from "../redux/slices/budgetSlice";

const COMMON_ICONS = [
  "🏠",
  "🛒",
  "🚗",
  "💰",
  "📈",
  "🎬",
  "🍽️",
  "👕",
  "💻",
  "📱",
  "🎮",
  "📚",
  "🏥",
  "💼",
  "✈️",
  "🏋️",
  "🎵",
  "🎨",
  "🎁",
  "🐶",
  "💄",
  "🧸",
  "🚿",
  "📝",
];

const DENOMINATION_FORMATS: { value: DenominationFormat; label: string }[] = [
  { value: "none", label: "None (1,234,567)" },
  { value: "compact", label: "Compact (1.2M)" },
  { value: "indian", label: "Indian (12.3L, 1.2Cr)" },
  { value: "international", label: "International (1.2K, 1.2M)" },
];

const SORT_OPTIONS = [
  { id: "type", label: "Category Type", key: "type", direction: "asc" },
  { id: "name_asc", label: "Name (A-Z)", key: "name", direction: "asc" },
  { id: "name_desc", label: "Name (Z-A)", key: "name", direction: "desc" },
];

interface BudgetSettingsProps {
  onBackPress?: () => void;
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({ onBackPress }) => {
  const dispatch = useDispatch();
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const additionalIncome = useSelector((state: any) => state.budget.additionalIncome);

  // Filter additional income for current month only
  const currentMonth = getCurrentMonthYearKey();
  const currentMonthAdditionalIncome = additionalIncome.filter((income: AdditionalIncomeItem) => {
    const incomeDate = new Date(income.date);
    const incomeMonthKey = `${incomeDate.getFullYear()}-${incomeDate.getMonth() + 1}`;
    return incomeMonthKey === currentMonth;
  });

  const totalAdditionalIncome = currentMonthAdditionalIncome.reduce((total: number, income: AdditionalIncomeItem) => total + income.amount, 0);
  const totalIncome = monthlyIncome + totalAdditionalIncome;
  const budgetRule = useSelector(selectBudgetRule);
  const categories = useSelector(selectCategories);
  const currency = useSelector(selectCurrency);
  const denominationFormat = useSelector(selectDenominationFormat);
  const categorySortOption = useSelector(selectCategorySortOption);

  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());
  const [needsInput, setNeedsInput] = useState(budgetRule.needs.toString());
  const [savingsInput, setSavingsInput] = useState(budgetRule.savings.toString());
  const [wantsInput, setWantsInput] = useState(budgetRule.wants.toString());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [activeSortOption, setActiveSortOption] = useState(SORT_OPTIONS.find((option) => option.id === categorySortOption) || SORT_OPTIONS[0]);
  const [sortedCategories, setSortedCategories] = useState<any[]>([]);

  // Add search filter state
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

  // Additional income states
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showManageIncomeModal, setShowManageIncomeModal] = useState(false);
  const [showEditIncomeModal, setShowEditIncomeModal] = useState(false);
  const [newIncomeDescription, setNewIncomeDescription] = useState("");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [editingIncome, setEditingIncome] = useState<AdditionalIncomeItem | null>(null);
  const [incomeFilterMonth, setIncomeFilterMonth] = useState<string>("all");
  const [editIncomeDate, setEditIncomeDate] = useState<Date>(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(COMMON_ICONS[0]);
  const [selectedType, setSelectedType] = useState<BudgetCategory>("Needs");

  const [percentageError, setPercentageError] = useState(false);

  const [pulseAnim] = useState(new Animated.Value(1));

  const previewAmount = 1234567;
  const formatPreviews = getFormatPreviews(previewAmount, currency?.symbol || "$");

  const animatedNeeds = useRef(new Animated.Value(parseInt(needsInput) || 0)).current;
  const animatedSavings = useRef(new Animated.Value(parseInt(savingsInput) || 0)).current;
  const animatedWants = useRef(new Animated.Value(parseInt(wantsInput) || 0)).current;

  useEffect(() => {
    validatePercentages();

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    validatePercentages();
  }, [needsInput, savingsInput, wantsInput]);

  useEffect(() => {
    Animated.timing(animatedNeeds, {
      toValue: parseInt(needsInput) || 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [needsInput]);

  useEffect(() => {
    Animated.timing(animatedSavings, {
      toValue: parseInt(savingsInput) || 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [savingsInput]);

  useEffect(() => {
    Animated.timing(animatedWants, {
      toValue: parseInt(wantsInput) || 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [wantsInput]);

  useEffect(() => {
    applySorting();
  }, [categories, activeSortOption]);

  // Add effect to filter categories based on search
  useEffect(() => {
    if (!categorySearchQuery.trim()) {
      setFilteredCategories(sortedCategories);
      return;
    }

    const query = categorySearchQuery.toLowerCase().trim();
    const filtered = sortedCategories.filter(
      (category) => category.name.toLowerCase().includes(query) || category.type.toLowerCase().includes(query)
    );

    setFilteredCategories(filtered);
  }, [sortedCategories, categorySearchQuery]);

  const validatePercentages = () => {
    const needs = parseInt(needsInput) || 0;
    const savings = parseInt(savingsInput) || 0;
    const wants = parseInt(wantsInput) || 0;
    const total = needs + savings + wants;

    setPercentageError(total !== 100);
    return total === 100;
  };

  const handleSaveIncome = () => {
    const income = parseFloat(incomeInput);
    if (!isNaN(income) && income >= 0) {
      dispatch(setMonthlyIncome(income));
    }
  };

  const handleSaveBudgetRule = () => {
    if (!validatePercentages()) {
      return;
    }

    dispatch(
      updateBudgetRule({
        needs: parseInt(needsInput),
        savings: parseInt(savingsInput),
        wants: parseInt(wantsInput),
      })
    );
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("Error", "Category name cannot be empty");
      return;
    }

    const id = newCategoryName.toLowerCase().replace(/\s+/g, "-");
    dispatch(
      addCategory({
        id,
        name: newCategoryName,
        icon: selectedIcon,
        type: selectedType,
      })
    );

    setNewCategoryName("");
    setSelectedIcon(COMMON_ICONS[0]);
    setSelectedType("Needs");
    setShowAddCategory(false);

    // Show success message
    Alert.alert("Success", `Category "${newCategoryName}" has been added.`, [{ text: "OK" }], { cancelable: true });
  };

  const handleDeleteCategory = (id: string) => {
    Alert.alert("Delete Category", "Are you sure you want to delete this category?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteCategory(id)) },
    ]);
  };

  const getCategoryColor = (type: BudgetCategory) => {
    switch (type) {
      case "Needs":
        return BudgetColors.needs;
      case "Savings":
        return BudgetColors.savings;
      case "Wants":
        return BudgetColors.wants;
      default:
        return "#999";
    }
  };

  const handleSelectCurrency = (selectedCurrency: CurrencyInfo) => {
    dispatch(setCurrency(selectedCurrency));
    setShowCurrencyModal(false);
  };

  const handleChangeDenominationFormat = (format: DenominationFormat) => {
    dispatch(setDenominationFormat(format));
  };

  const animatePulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddCategoryWithAnimation = () => {
    animatePulse();
    setShowAddCategory(true);
  };

  const handleShowCurrencyWithAnimation = () => {
    animatePulse();
    setShowCurrencyModal(true);
  };

  const animateBudgetPercentages = (newNeeds: number, newSavings: number, newWants: number) => {
    setNeedsInput(newNeeds.toString());
    setSavingsInput(newSavings.toString());
    setWantsInput(newWants.toString());

    Animated.parallel([
      Animated.timing(animatedNeeds, {
        toValue: newNeeds,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(animatedSavings, {
        toValue: newSavings,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(animatedWants, {
        toValue: newWants,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();

    dispatch(
      updateBudgetRule({
        needs: newNeeds,
        savings: newSavings,
        wants: newWants,
      })
    );
  };
  const CURRENCY_MULTIPLIERS: Record<string, number> = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.75,
    JPY: 110,
    INR: 86,
    CNY: 6.5,
    CAD: 1.25,
    AUD: 1.35,
  };

  const getCurrencyMultiplier = (currencyCode: string): number => {
    return CURRENCY_MULTIPLIERS[currencyCode] ?? 1;
  };

  const BUDGET_SPLITS = [
    { threshold: 15000, split: { needs: 10, savings: 85, wants: 5 } }, // Ultra high income
    { threshold: 10000, split: { needs: 12, savings: 80, wants: 8 } }, // Very high income
    { threshold: 5000, split: { needs: 15, savings: 75, wants: 10 } }, // High income
    { threshold: 3000, split: { needs: 20, savings: 70, wants: 10 } }, // Upper middle
    { threshold: 2000, split: { needs: 25, savings: 65, wants: 10 } }, // Middle
    { threshold: 1500, split: { needs: 30, savings: 60, wants: 10 } }, // Lower middle
    { threshold: 0, split: { needs: 50, savings: 30, wants: 20 } }, // Low income
  ];

  const getRecommendedBudgetSplit = (income: number, currency: { code: string }) => {
    if (income <= 0) {
      return { needs: 50, savings: 20, wants: 30 };
    }

    const multiplier = getCurrencyMultiplier(currency.code);
    const normalizedIncome = income / multiplier;

    for (const { threshold, split } of BUDGET_SPLITS) {
      if (normalizedIncome >= threshold) {
        return split;
      }
    }

    return { needs: 50, savings: 20, wants: 30 };
  };

  const applySorting = () => {
    const { key, direction } = activeSortOption;

    const sorted = [...categories].sort((a, b) => {
      if (key === "name") {
        return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (key === "type") {
        return a.type.localeCompare(b.type);
      } else if (key === "id") {
        // Sort by most recently added first (assuming IDs are somewhat chronological)
        return direction === "asc" ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
      }
      return 0;
    });

    setSortedCategories(sorted);
  };

  const handleSortChange = (option: (typeof SORT_OPTIONS)[0]) => {
    setActiveSortOption(option);
    dispatch(setCategorySortOption(option.id));
  };

  // Add function to handle adding category from the modal
  const handleAddCategoryFromModal = () => {
    setShowCategoriesModal(false);
    // Small delay to allow modal to close before opening another
    setTimeout(() => {
      setShowAddCategory(true);
    }, 300);
  };

  // Additional income functions
  const handleAddAdditionalIncome = () => {
    if (!newIncomeDescription.trim() || !newIncomeAmount.trim()) {
      Alert.alert("Error", "Please fill in both description and amount");
      return;
    }

    const amount = parseFloat(newIncomeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const id = Date.now().toString();
    const incomeItem: AdditionalIncomeItem = {
      id,
      description: newIncomeDescription,
      amount,
      date: new Date().toISOString(),
    };

    dispatch({ type: "budget/addAdditionalIncome", payload: incomeItem });
    setNewIncomeDescription("");
    setNewIncomeAmount("");
    setShowAddIncomeModal(false);

    Alert.alert("Success", `Additional income "${newIncomeDescription}" has been added.`);
  };

  const handleDeleteAdditionalIncome = (id: string) => {
    Alert.alert("Delete Income", "Are you sure you want to delete this additional income?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch({ type: "budget/deleteAdditionalIncome", payload: id }) },
    ]);
  };

  const handleEditIncome = (income: AdditionalIncomeItem) => {
    setEditingIncome(income);
    setNewIncomeDescription(income.description);
    setNewIncomeAmount(income.amount.toString());
    setEditIncomeDate(new Date(income.date));
    setShowManageIncomeModal(false);
    setTimeout(() => setShowEditIncomeModal(true), 300);
  };

  const handleUpdateIncome = () => {
    if (!editingIncome || !newIncomeDescription.trim() || !newIncomeAmount.trim()) {
      Alert.alert("Error", "Please fill in both description and amount");
      return;
    }

    const amount = parseFloat(newIncomeAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    dispatch({
      type: "budget/updateAdditionalIncome",
      payload: {
        id: editingIncome.id,
        updates: {
          description: newIncomeDescription,
          amount: amount,
          date: editIncomeDate.toISOString(),
        },
      },
    });

    setNewIncomeDescription("");
    setNewIncomeAmount("");
    setEditingIncome(null);
    setEditIncomeDate(new Date());
    setShowEditIncomeModal(false);

    Alert.alert("Success", "Income updated successfully.");
  };

  // Get unique months from additional income for filtering
  const getAvailableIncomeMonths = () => {
    const months = new Set<string>();
    additionalIncome.forEach((income: AdditionalIncomeItem) => {
      const incomeDate = new Date(income.date);
      const monthKey = `${incomeDate.getFullYear()}-${incomeDate.getMonth() + 1}`;
      months.add(monthKey);
    });

    return Array.from(months)
      .map((key) => {
        const [year, month] = key.split("-").map(Number);
        const date = new Date(year, month - 1, 1);
        return {
          key,
          display: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        };
      })
      .sort((a, b) => {
        const [yearA, monthA] = a.key.split("-").map(Number);
        const [yearB, monthB] = b.key.split("-").map(Number);
        if (yearA !== yearB) return yearB - yearA;
        return monthB - monthA;
      });
  };

  // Filter income by selected month
  const getFilteredIncome = () => {
    if (incomeFilterMonth === "all") return additionalIncome;

    return additionalIncome.filter((income: AdditionalIncomeItem) => {
      const incomeDate = new Date(income.date);
      const incomeMonthKey = `${incomeDate.getFullYear()}-${incomeDate.getMonth() + 1}`;
      return incomeMonthKey === incomeFilterMonth;
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient colors={["#FFFFFF", "#F8F9FA"]} style={styles.header}>
        <Text style={styles.headerTitle}>Budget Settings</Text>
      </LinearGradient>

      <KeyboardAwareView style={styles.scrollView} keyboardVerticalOffset={20} scrollEnabled={true}>
        <View style={styles.welcomeContainer}>
          {monthlyIncome === 0 && <Text style={styles.welcomeText}>Welcome! Let&apos;s set up your budget to start tracking your finances.</Text>}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Monthly Income</Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.currencyButton} onPress={handleShowCurrencyWithAnimation} activeOpacity={0.7}>
                <Text style={styles.currencyButtonText}>currency: {currency?.code || "USD"}</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>{currency ? getCurrencySymbol(currency) : "$"}</Text>
            <TextInput
              style={styles.incomeInput}
              value={incomeInput}
              onChangeText={setIncomeInput}
              keyboardType="numeric"
              returnKeyType="done"
              placeholder="Enter your monthly income"
              onBlur={handleSaveIncome}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Additional Income</Text>
            <View style={styles.headerButtonsContainer}>
              <TouchableOpacity style={styles.manageButton} onPress={() => setShowManageIncomeModal(true)} activeOpacity={0.7}>
                <Text style={styles.manageButtonText}>📊</Text>
              </TouchableOpacity>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowAddIncomeModal(true)} activeOpacity={0.7}>
                  <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.compactAddButtonGradient}>
                    <Text style={styles.addButtonIcon}>+</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          {totalAdditionalIncome > 0 && (
            <View style={styles.incomeSummaryContainer}>
              <Text style={styles.incomeSummaryText}>
                Total Additional: {currency ? getCurrencySymbol(currency) : "$"}
                {totalAdditionalIncome.toLocaleString()}
              </Text>
              <Text style={styles.totalIncomeText}>
                Total Monthly Income: {currency ? getCurrencySymbol(currency) : "$"}
                {totalIncome.toLocaleString()}
              </Text>
            </View>
          )}

          {currentMonthAdditionalIncome.length === 0 ? (
            <View>
              <Text style={styles.emptyText}>
                No additional income for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} yet.
              </Text>
              {additionalIncome.length > 0 && (
                <TouchableOpacity style={styles.viewAllIncomeButton} onPress={() => setShowManageIncomeModal(true)}>
                  <Text style={styles.viewAllIncomeText}>View All Months ({additionalIncome.length} total)</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.incomeList}>
              {currentMonthAdditionalIncome.map((income: AdditionalIncomeItem) => (
                <View key={income.id} style={styles.incomeItem}>
                  <View style={styles.incomeItemLeft}>
                    <Text style={styles.incomeDescription}>{income.description}</Text>
                    <Text style={styles.incomeDate}>{new Date(income.date).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.incomeRight}>
                    <Text style={styles.incomeAmount}>
                      {currency ? getCurrencySymbol(currency) : "$"}
                      {income.amount.toLocaleString()}
                    </Text>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAdditionalIncome(income.id)}>
                      <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {additionalIncome.length > currentMonthAdditionalIncome.length && (
                <TouchableOpacity style={styles.viewAllIncomeButton} onPress={() => setShowManageIncomeModal(true)}>
                  <Text style={styles.viewAllIncomeText}>View All Months ({additionalIncome.length} total)</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Budget Allocation</Text>
            <TouchableOpacity
              style={styles.recommendButton}
              onPress={() => {
                const income = totalIncome > 0 ? totalIncome : parseFloat(incomeInput);

                const {
                  needs: newNeeds,
                  savings: newSavings,
                  wants: newWants,
                } = getRecommendedBudgetSplit(income, currency || { code: "USD", name: "US Dollar", symbol: "$" });

                animateBudgetPercentages(newNeeds, newSavings, newWants);

                animatePulse();
              }}
              activeOpacity={0.7}
            >
              <LinearGradient colors={["#FFBA6E", "#FF9C36"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.recommendButtonGradient}>
                <Text style={styles.recommendButtonText}>Auto Split</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDescription}>Adjust your budget percentages based on the 50-30-20 rule.</Text>
          <View style={styles.budgetRuleContainer}>
            <View style={styles.budgetItemContainer}>
              <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.budgetColorIndicator} />
              <Text style={styles.budgetItemLabel}>Needs</Text>
              <View style={styles.percentageInputContainer}>
                <Animated.View
                  style={[
                    styles.percentageFill,
                    {
                      width: animatedNeeds.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: BudgetColors.needs + "50",
                    },
                  ]}
                />
                <TextInput
                  style={[styles.percentageInput, percentageError && styles.errorInput]}
                  value={needsInput}
                  onChangeText={setNeedsInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onBlur={handleSaveBudgetRule}
                />
              </View>
              <Text style={styles.percentSign}>%</Text>
            </View>

            <View style={styles.budgetItemContainer}>
              <LinearGradient colors={["#FFBA6E", "#FF9C36"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.budgetColorIndicator} />
              <Text style={styles.budgetItemLabel}>Savings</Text>
              <View style={styles.percentageInputContainer}>
                <Animated.View
                  style={[
                    styles.percentageFill,
                    {
                      width: animatedSavings.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: BudgetColors.savings + "50",
                    },
                  ]}
                />
                <TextInput
                  style={[styles.percentageInput, percentageError && styles.errorInput]}
                  value={savingsInput}
                  onChangeText={setSavingsInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onBlur={handleSaveBudgetRule}
                />
              </View>
              <Text style={styles.percentSign}>%</Text>
            </View>

            <View style={styles.budgetItemContainer}>
              <LinearGradient colors={["#837BFF", "#605BFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.budgetColorIndicator} />
              <Text style={styles.budgetItemLabel}>Wants</Text>
              <View style={styles.percentageInputContainer}>
                <Animated.View
                  style={[
                    styles.percentageFill,
                    {
                      width: animatedWants.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: BudgetColors.wants + "50",
                    },
                  ]}
                />
                <TextInput
                  style={[styles.percentageInput, percentageError && styles.errorInput]}
                  value={wantsInput}
                  onChangeText={setWantsInput}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onBlur={handleSaveBudgetRule}
                />
              </View>
              <Text style={styles.percentSign}>%</Text>
            </View>
          </View>

          {percentageError && <Text style={styles.errorText}>Total must equal 100%. Adjust percentages as needed.</Text>}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Expense Categories</Text>
          </View>

          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories yet. Add your first one!</Text>
          ) : (
            <View style={styles.categorySummary}>
              <Text style={styles.categoryCount}>
                {categories.length} {categories.length === 1 ? "category" : "categories"} configured
              </Text>
              <TouchableOpacity onPress={() => setShowCategoriesModal(true)} style={styles.categoryPreview}>
                <View style={styles.categoryIconRow}>
                  {categories.slice(0, Math.min(categories.length, 5)).map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.previewIconContainer,
                        {
                          zIndex: 5 - index,
                          marginLeft: index > 0 ? -10 : 0,
                          backgroundColor: getCategoryColor(item.type) + "20",
                        },
                      ]}
                    >
                      <Text style={styles.previewCategoryIcon}>{item.icon}</Text>
                    </View>
                  ))}
                  {categories.length > 5 && (
                    <View style={[styles.previewIconContainer, { marginLeft: -10, zIndex: 0 }]}>
                      <Text style={styles.moreIconText}>+{categories.length - 5}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tapToViewText}>Tap to view all</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Add Denomination Format Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number Format</Text>
          <Text style={styles.sectionDescription}>Choose how large numbers are displayed throughout the app.</Text>

          <View style={styles.denominationContainer}>
            {DENOMINATION_FORMATS.map((format) => (
              <TouchableOpacity
                key={format.value}
                style={[styles.denominationOption, denominationFormat === format.value && styles.selectedDenominationOption]}
                onPress={() => handleChangeDenominationFormat(format.value)}
              >
                <Text style={[styles.denominationLabel, denominationFormat === format.value && styles.selectedDenominationLabel]}>
                  {format.label}
                </Text>
                <Text style={[styles.denominationPreview, denominationFormat === format.value && styles.selectedDenominationPreview]}>
                  {formatPreviews[format.value]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAwareView>

      {/* Add Category Modal */}
      <Modal visible={showAddCategory} animationType="fade" transparent={true} onRequestClose={() => setShowAddCategory(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerView}>
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowAddCategory(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="e.g., Utilities, Education, etc."
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconList}>
                  {COMMON_ICONS.map((icon, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.iconOption, selectedIcon === icon && styles.selectedIcon]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category Type</Text>
                <View style={styles.typeSelector}>
                  {["Needs", "Savings", "Wants"].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        selectedType === type && styles.selectedType,
                        selectedType === type && {
                          borderColor: getCategoryColor(type as BudgetCategory),
                          backgroundColor: getCategoryColor(type as BudgetCategory) + "10",
                        },
                      ]}
                      onPress={() => setSelectedType(type as BudgetCategory)}
                    >
                      <Text
                        style={[
                          styles.typeText,
                          selectedType === type && {
                            color: getCategoryColor(type as BudgetCategory),
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity style={styles.saveButtonContainer} onPress={handleAddCategory} activeOpacity={0.8}>
                <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save Category</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal visible={showCurrencyModal} animationType="fade" transparent={true} onRequestClose={() => setShowCurrencyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerView}>
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={AVAILABLE_CURRENCIES}
              keyExtractor={(item) => item.code}
              style={styles.currencyList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.currencyItem, currency?.code === item.code ? styles.selectedCurrencyItem : null]}
                  onPress={() => handleSelectCurrency(item)}
                >
                  <View style={styles.currencyItemLeft}>
                    <Text style={styles.currencySymbol}>{item.symbol}</Text>
                    <Text style={styles.currencyName}>{item.name}</Text>
                  </View>
                  <Text style={styles.currencyCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>

      {/* Add Additional Income Modal */}
      <Modal visible={showAddIncomeModal} animationType="fade" transparent={true} onRequestClose={() => setShowAddIncomeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerView}>
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Add Additional Income</Text>
              <TouchableOpacity onPress={() => setShowAddIncomeModal(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={styles.formInput}
                  value={newIncomeDescription}
                  onChangeText={setNewIncomeDescription}
                  placeholder="e.g., Freelance work, Bonus, etc."
                  returnKeyType="next"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.dollarSign}>{currency ? getCurrencySymbol(currency) : "$"}</Text>
                  <TextInput
                    style={styles.incomeInput}
                    value={newIncomeAmount}
                    onChangeText={setNewIncomeAmount}
                    keyboardType="numeric"
                    returnKeyType="done"
                    placeholder="Enter amount"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButtonContainer} onPress={handleAddAdditionalIncome} activeOpacity={0.8}>
                <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Add Income</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Manage All Income Modal */}
      <Modal visible={showManageIncomeModal} animationType="slide" transparent={true} onRequestClose={() => setShowManageIncomeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.categoriesModalContainer}>
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Manage Additional Income</Text>
              <TouchableOpacity onPress={() => setShowManageIncomeModal(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Summary and Add Button */}
            <View style={styles.searchContainer}>
              <View style={styles.totalIncomeContainer}>
                <Text style={styles.totalIncomeLabel}>{incomeFilterMonth === "all" ? "Total Across All Months" : "Total for Selected Month"}</Text>
                <Text style={styles.totalIncomeValue}>
                  {currency ? getCurrencySymbol(currency) : "$"}
                  {getFilteredIncome()
                    .reduce((total: number, income: AdditionalIncomeItem) => total + income.amount, 0)
                    .toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={() => {
                  setShowManageIncomeModal(false);
                  setTimeout(() => setShowAddIncomeModal(true), 300);
                }}
              >
                <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalAddButtonGradient}>
                  <Text style={styles.modalAddButtonText}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Month Filter */}
            {additionalIncome.length > 0 && (
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Month:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
                  <TouchableOpacity
                    style={[styles.filterOption, incomeFilterMonth === "all" && styles.activeFilterOption]}
                    onPress={() => setIncomeFilterMonth("all")}
                  >
                    <Text style={[styles.filterOptionText, incomeFilterMonth === "all" && styles.activeFilterOptionText]}>
                      All ({additionalIncome.length})
                    </Text>
                  </TouchableOpacity>
                  {getAvailableIncomeMonths().map((month) => {
                    const monthCount = additionalIncome.filter((income: AdditionalIncomeItem) => {
                      const incomeDate = new Date(income.date);
                      const incomeMonthKey = `${incomeDate.getFullYear()}-${incomeDate.getMonth() + 1}`;
                      return incomeMonthKey === month.key;
                    }).length;

                    return (
                      <TouchableOpacity
                        key={month.key}
                        style={[styles.filterOption, incomeFilterMonth === month.key && styles.activeFilterOption]}
                        onPress={() => setIncomeFilterMonth(month.key)}
                      >
                        <Text style={[styles.filterOptionText, incomeFilterMonth === month.key && styles.activeFilterOptionText]}>
                          {month.display} ({monthCount})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {additionalIncome.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIconText}>💰</Text>
                <Text style={styles.emptyText}>No additional income recorded yet</Text>
                <TouchableOpacity
                  style={styles.emptyAddButton}
                  onPress={() => {
                    setShowManageIncomeModal(false);
                    setTimeout(() => setShowAddIncomeModal(true), 300);
                  }}
                >
                  <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyAddButtonGradient}>
                    <Text style={styles.emptyAddButtonText}>Add Income Source</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={getFilteredIncome().sort(
                  (a: AdditionalIncomeItem, b: AdditionalIncomeItem) => new Date(b.date).getTime() - new Date(a.date).getTime()
                )}
                keyExtractor={(item) => item.id}
                style={styles.categoriesList}
                contentContainerStyle={styles.categoriesListContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => {
                  const incomeDate = new Date(item.date);
                  const monthYear = incomeDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  const isCurrentMonth = `${incomeDate.getFullYear()}-${incomeDate.getMonth() + 1}` === currentMonth;

                  return (
                    <View style={[styles.categoryListItem, isCurrentMonth && styles.currentMonthHighlight]}>
                      <View style={styles.categoryLeft}>
                        <View style={styles.categoryIconContainerLarge}>
                          <Text style={styles.categoryIconLarge}>💰</Text>
                        </View>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryNameLarge}>{item.description}</Text>
                          <Text style={[styles.categoryType, { color: isCurrentMonth ? "#2E7D32" : "#666" }]}>
                            {monthYear} {isCurrentMonth && "(Current)"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.incomeItemActions}>
                        <Text style={styles.incomeAmount}>
                          {currency ? getCurrencySymbol(currency) : "$"}
                          {item.amount.toLocaleString()}
                        </Text>
                        <View style={styles.actionButtonsContainer}>
                          <TouchableOpacity style={styles.editButton} onPress={() => handleEditIncome(item)}>
                            <Text style={styles.editIcon}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.deleteButtonLarge} onPress={() => handleDeleteAdditionalIncome(item.id)}>
                            <Text style={styles.deleteIcon}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Income Modal */}
      <Modal visible={showEditIncomeModal} animationType="fade" transparent={true} onRequestClose={() => setShowEditIncomeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerView}>
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Edit Additional Income</Text>
              <TouchableOpacity onPress={() => setShowEditIncomeModal(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={styles.formInput}
                  value={newIncomeDescription}
                  onChangeText={setNewIncomeDescription}
                  placeholder="e.g., Freelance work, Bonus, etc."
                  returnKeyType="next"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.dollarSign}>{currency ? getCurrencySymbol(currency) : "$"}</Text>
                  <TextInput
                    style={styles.incomeInput}
                    value={newIncomeAmount}
                    onChangeText={setNewIncomeAmount}
                    keyboardType="numeric"
                    returnKeyType="done"
                    placeholder="Enter amount"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowEditDatePicker(true)}>
                  <Text style={styles.datePickerButtonText}>
                    {editIncomeDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.datePickerIcon}>📅</Text>
                </TouchableOpacity>
              </View>

              {showEditDatePicker && (
                <View style={styles.datePickerWrapper}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowEditDatePicker(false)} style={styles.datePickerHeaderButton}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowEditDatePicker(false)} style={styles.datePickerHeaderButton}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={editIncomeDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setEditIncomeDate(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(2020, 0, 1)}
                  />
                </View>
              )}

              <TouchableOpacity style={styles.saveButtonContainer} onPress={handleUpdateIncome} activeOpacity={0.8}>
                <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Update Income</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Categories Modal */}
      <Modal visible={showCategoriesModal} animationType="slide" transparent={true} onRequestClose={() => setShowCategoriesModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.categoriesModalContainer}>
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Expense Categories</Text>
              <TouchableOpacity onPress={() => setShowCategoriesModal(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Add search input */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChangeText={setCategorySearchQuery}
                  returnKeyType="search"
                />
                {categorySearchQuery ? (
                  <TouchableOpacity style={styles.clearSearchButton} onPress={() => setCategorySearchQuery("")}>
                    <Text style={styles.clearSearchIcon}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity style={styles.modalAddButton} onPress={handleAddCategoryFromModal}>
                <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalAddButtonGradient}>
                  <Text style={styles.modalAddButtonText}>+</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.sortOptionsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.sortOption, activeSortOption.id === option.id && styles.activeSortOption]}
                    onPress={() => handleSortChange(option)}
                  >
                    <Text style={[styles.sortOptionText, activeSortOption.id === option.id && styles.activeSortOptionText]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <FlatList
              data={filteredCategories}
              keyExtractor={(item) => item.id}
              style={styles.categoriesList}
              contentContainerStyle={[styles.categoriesListContent, filteredCategories.length === 0 && styles.emptyListContent]}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <Animated.View style={styles.categoryListItem}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryIconContainerLarge, { backgroundColor: getCategoryColor(item.type) + "20" }]}>
                      <Text style={styles.categoryIconLarge}>{item.icon}</Text>
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryNameLarge}>{item.name}</Text>
                      <View style={[styles.categoryTypeBadge, { backgroundColor: getCategoryColor(item.type) + "20" }]}>
                        <Text style={[styles.categoryType, { color: getCategoryColor(item.type) }]}>{item.type}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteButtonLarge} onPress={() => handleDeleteCategory(item.id)}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIconText}>📋</Text>
                  <Text style={styles.emptyText}>
                    {categorySearchQuery ? `No categories found matching "${categorySearchQuery}"` : "No categories yet. Add your first one!"}
                  </Text>
                  <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddCategoryFromModal}>
                    <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyAddButtonGradient}>
                      <Text style={styles.emptyAddButtonText}>Add New Category</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    marginRight: responsiveMargin(12),
  },
  backButton: {
    fontSize: scaleFontSize(20),
    color: "#333",
  },
  headerTitle: {
    fontSize: scaleFontSize(22),
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.5,
  },
  welcomeContainer: {
    paddingHorizontal: responsivePadding(16),
    paddingTop: responsivePadding(20),
  },
  welcomeText: {
    fontSize: scaleFontSize(16),
    color: "#666",
    lineHeight: 24,
    marginBottom: responsiveMargin(8),
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: responsivePadding(24),
    backgroundColor: "#FFF",
    marginBottom: responsiveMargin(20),
    borderRadius: 20,
    marginHorizontal: responsiveMargin(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    marginBottom: responsiveMargin(14),
    color: "#333",
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: scaleFontSize(15),
    color: "#666",
    marginBottom: responsiveMargin(18),
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 16,
    paddingHorizontal: responsivePadding(14),
    height: 56,
    backgroundColor: "#FCFCFC",
  },
  dollarSign: {
    fontSize: scaleFontSize(20),
    color: "#333",
    marginRight: responsiveMargin(6),
  },
  incomeInput: {
    flex: 1,
    fontSize: scaleFontSize(18),
    color: "#333",
    height: "100%",
  },
  budgetRuleContainer: {
    marginTop: responsiveMargin(10),
  },
  budgetItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(20),
  },
  budgetColorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: responsiveMargin(14),
  },
  budgetItemLabel: {
    flex: 1,
    fontSize: scaleFontSize(17),
    color: "#333",
    letterSpacing: 0.2,
  },
  percentageInputContainer: {
    position: "relative",
    width: 70,
    height: 48,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    overflow: "hidden",
    marginRight: responsiveMargin(4),
    backgroundColor: "#FCFCFC",
  },
  percentageFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  percentageInput: {
    width: "100%",
    height: "100%",
    paddingHorizontal: responsivePadding(10),
    textAlign: "center",
    fontSize: scaleFontSize(18),
    backgroundColor: "transparent",
    zIndex: 2,
  },
  percentSign: {
    fontSize: scaleFontSize(18),
    color: "#333",
  },
  errorInput: {
    borderColor: AdditionalColors.error,
  },
  errorText: {
    color: AdditionalColors.error,
    fontSize: scaleFontSize(14),
    marginTop: responsiveMargin(4),
    fontWeight: "500",
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(16),
  },
  addButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  addButtonGradient: {
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(8),
    borderRadius: 20,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsivePadding(16),
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(14),
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: scaleFontSize(20),
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    color: "#333",
    letterSpacing: 0.2,
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTypeBadge: {
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(6),
    borderRadius: 14,
    marginRight: responsiveMargin(10),
  },
  categoryType: {
    fontSize: scaleFontSize(13),
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  deleteButton: {
    padding: responsivePadding(8),
    borderRadius: 18,
  },
  deleteIcon: {
    fontSize: scaleFontSize(16),
  },
  separator: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginVertical: responsiveMargin(6),
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    padding: responsivePadding(24),
    fontStyle: "italic",
    fontSize: scaleFontSize(15),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainerView: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalHeaderView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitleText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  modalCloseText: {
    fontSize: scaleFontSize(24),
    color: "#666",
    padding: 4,
  },
  modalScrollView: {
    maxHeight: "100%",
  },
  modalScrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: scaleFontSize(16),
    backgroundColor: "#FCFCFC",
  },
  iconList: {
    flexDirection: "row",
    marginVertical: 10,
  },
  iconOption: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    marginRight: 10,
    backgroundColor: "#FCFCFC",
  },
  selectedIcon: {
    borderColor: BudgetColors.needs,
    backgroundColor: BudgetColors.needs + "10",
  },
  iconText: {
    fontSize: scaleFontSize(20),
  },
  typeSelector: {
    flexDirection: "row",
    marginVertical: 10,
    width: "100%",
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    alignItems: "center",
    backgroundColor: "#FCFCFC",
  },
  selectedType: {
    borderWidth: 1,
  },
  typeText: {
    fontSize: scaleFontSize(15),
    color: "#666",
  },
  saveButtonContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 20,
  },
  saveButton: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  currencyButton: {
    paddingHorizontal: responsivePadding(14),
    paddingVertical: responsivePadding(8),
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  currencyButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#555",
    letterSpacing: 0.2,
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  selectedCurrencyItem: {
    backgroundColor: `${BudgetColors.needs}15`,
  },
  currencyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencySymbol: {
    fontSize: scaleFontSize(18),
    marginRight: responsiveMargin(14),
    width: 24,
    textAlign: "center",
  },
  currencyName: {
    fontSize: scaleFontSize(16),
    color: "#333",
    letterSpacing: 0.2,
  },
  currencyCode: {
    fontSize: scaleFontSize(14),
    color: "#666",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  currencyList: {
    width: "100%",
    maxHeight: 350,
  },
  denominationContainer: {
    marginTop: responsiveMargin(12),
  },
  denominationOption: {
    padding: responsivePadding(14),
    borderRadius: 14,
    backgroundColor: "#F6F6F6",
    marginBottom: responsiveMargin(10),
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  selectedDenominationOption: {
    backgroundColor: `${BudgetColors.needs}15`,
    borderColor: BudgetColors.needs,
  },
  denominationLabel: {
    fontSize: scaleFontSize(15),
    color: "#333",
    fontWeight: "500",
    marginBottom: responsiveMargin(6),
  },
  selectedDenominationLabel: {
    color: "#000",
    fontWeight: "600",
  },
  denominationPreview: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  selectedDenominationPreview: {
    color: "#333",
    fontWeight: "500",
  },
  recommendButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  recommendButtonGradient: {
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(8),
    borderRadius: 14,
  },
  recommendButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: 0.2,
  },
  recommendationInfo: {
    fontSize: scaleFontSize(13),
    color: "#666",
    marginBottom: responsiveMargin(16),
    lineHeight: 18,
    backgroundColor: "#F8F8F8",
    padding: responsivePadding(10),
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FFBA6E",
  },
  infoIcon: {
    fontSize: scaleFontSize(13),
  },
  learnMoreText: {
    color: BudgetColors.savings,
    fontWeight: "600",
    textDecorationLine: "underline",
    alignSelf: "flex-end",
  },
  learnMoreTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
    marginTop: responsiveMargin(20),
    marginBottom: responsiveMargin(10),
  },
  learnMoreParagraph: {
    fontSize: scaleFontSize(15),
    color: "#444",
    marginBottom: responsiveMargin(12),
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
  },
  tableContainer: {
    marginVertical: responsiveMargin(12),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tableHeader: {
    backgroundColor: "#F6F6F6",
    fontWeight: "600",
  },
  tableCell: {
    flex: 1,
    padding: responsivePadding(10),
    fontSize: scaleFontSize(14),
    color: "#333",
    textAlign: "center",
  },
  categoryButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewCategoriesButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  viewButtonGradient: {
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(8),
    borderRadius: 20,
  },
  viewButtonText: {
    color: "#FFF",
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  categorySummary: {
    padding: responsivePadding(16),
    borderRadius: 14,
    backgroundColor: "#FCFCFC",
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  categoryCount: {
    fontSize: scaleFontSize(15),
    fontWeight: "500",
    color: "#444",
    marginBottom: responsiveMargin(10),
  },
  categoryPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  previewCategoryIcon: {
    fontSize: scaleFontSize(16),
  },
  moreIconText: {
    fontSize: scaleFontSize(12),
    fontWeight: "600",
    color: "#666",
  },
  tapToViewText: {
    fontSize: scaleFontSize(14),
    color: "#666",
    textDecorationLine: "underline",
  },
  categoriesModalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "100%",
    height: "90%",
    marginTop: "auto",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sortOptionsContainer: {
    paddingVertical: responsivePadding(10),
    paddingHorizontal: responsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sortOption: {
    paddingHorizontal: responsivePadding(14),
    paddingVertical: responsivePadding(8),
    marginRight: responsiveMargin(8),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FCFCFC",
  },
  activeSortOption: {
    backgroundColor: "#5BD990" + "20",
    borderColor: "#5BD990",
  },
  sortOptionText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  activeSortOptionText: {
    color: "#3DB26E",
    fontWeight: "600",
  },
  categoriesList: {
    flex: 1,
  },
  categoriesListContent: {
    paddingVertical: responsivePadding(16),
  },
  categoryListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(16),
  },
  categoryIconContainerLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(16),
  },
  categoryIconLarge: {
    fontSize: scaleFontSize(24),
  },
  categoryInfo: {
    flex: 1,
    marginRight: responsiveMargin(8),
  },
  categoryNameLarge: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
    marginBottom: responsiveMargin(6),
  },
  deleteButtonLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
    borderRadius: 12,
    paddingHorizontal: responsivePadding(12),
    marginRight: responsiveMargin(12),
    height: 46,
  },
  searchIcon: {
    fontSize: scaleFontSize(16),
    marginRight: responsiveMargin(8),
    color: "#666",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: scaleFontSize(15),
    color: "#333",
  },
  clearSearchButton: {
    padding: responsivePadding(4),
  },
  clearSearchIcon: {
    fontSize: scaleFontSize(14),
    color: "#999",
  },
  modalAddButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: "hidden",
  },
  modalAddButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalAddButtonText: {
    fontSize: scaleFontSize(26),
    color: "#FFF",
    fontWeight: "300",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsivePadding(40),
  },
  emptyIconText: {
    fontSize: scaleFontSize(50),
    marginBottom: responsiveMargin(16),
    opacity: 0.5,
  },
  emptyAddButton: {
    marginTop: responsiveMargin(20),
    borderRadius: 14,
    overflow: "hidden",
  },
  emptyAddButtonGradient: {
    paddingHorizontal: responsivePadding(20),
    paddingVertical: responsivePadding(12),
    borderRadius: 14,
  },
  emptyAddButtonText: {
    color: "#FFF",
    fontSize: scaleFontSize(15),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  incomeSummaryContainer: {
    padding: responsivePadding(16),
    borderRadius: 14,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#E6F3FF",
    marginBottom: responsiveMargin(16),
  },
  incomeSummaryText: {
    fontSize: scaleFontSize(15),
    fontWeight: "500",
    color: "#444",
    marginBottom: responsiveMargin(6),
  },
  totalIncomeText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#2E7D32",
  },
  incomeList: {
    marginTop: responsiveMargin(8),
  },
  incomeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(16),
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: responsiveMargin(8),
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  incomeItemLeft: {
    flex: 1,
    marginRight: responsiveMargin(12),
  },
  incomeDescription: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
    marginBottom: responsiveMargin(4),
  },
  incomeDate: {
    fontSize: scaleFontSize(13),
    color: "#666",
  },
  incomeRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  incomeAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#2E7D32",
    marginRight: responsiveMargin(8),
  },
  viewAllIncomeButton: {
    marginTop: responsiveMargin(12),
    padding: responsivePadding(12),
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6F3FF",
    alignItems: "center",
  },
  viewAllIncomeText: {
    fontSize: scaleFontSize(14),
    color: "#4C7ED9",
    fontWeight: "500",
  },
  totalIncomeContainer: {
    flex: 1,
    marginRight: responsiveMargin(12),
  },
  totalIncomeLabel: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(4),
  },
  totalIncomeValue: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#2E7D32",
  },
  currentMonthHighlight: {
    backgroundColor: "#F0F8FF",
    borderLeftWidth: 4,
    borderLeftColor: "#5BD990",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  manageButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginRight: responsiveMargin(8),
    justifyContent: "center",
    alignItems: "center",
  },
  manageButtonText: {
    fontSize: scaleFontSize(20),
  },
  compactAddButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonIcon: {
    color: "#FFF",
    fontSize: scaleFontSize(24),
    fontWeight: "300",
  },
  filterContainer: {
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  filterLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#333",
    marginBottom: responsiveMargin(8),
  },
  filterScrollView: {
    flexDirection: "row",
  },
  filterOption: {
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(6),
    marginRight: responsiveMargin(8),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FCFCFC",
  },
  activeFilterOption: {
    backgroundColor: "#5BD990" + "20",
    borderColor: "#5BD990",
  },
  filterOptionText: {
    fontSize: scaleFontSize(13),
    color: "#666",
  },
  activeFilterOptionText: {
    color: "#3DB26E",
    fontWeight: "600",
  },
  incomeItemActions: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveMargin(4),
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    marginRight: responsiveMargin(8),
  },
  editIcon: {
    fontSize: scaleFontSize(14),
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    backgroundColor: "#FCFCFC",
  },
  datePickerButtonText: {
    fontSize: scaleFontSize(16),
    color: "#333",
    flex: 1,
  },
  datePickerIcon: {
    fontSize: scaleFontSize(18),
    marginLeft: responsiveMargin(8),
  },
  datePickerWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginVertical: responsiveMargin(10),
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  datePickerHeaderButton: {
    padding: responsivePadding(8),
  },
  datePickerCancel: {
    fontSize: scaleFontSize(16),
    color: "#666",
  },
  datePickerDone: {
    fontSize: scaleFontSize(16),
    color: "#5BD990",
    fontWeight: "600",
  },
});

export default BudgetSettings;
