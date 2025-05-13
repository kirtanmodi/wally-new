import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AdditionalColors, BudgetColors } from "../app/constants/Colors";
import { BudgetCategory } from "../app/types/budget";
import { getCurrencySymbol } from "../app/utils/currency";
import { DenominationFormat, getFormatPreviews } from "../app/utils/denominationFormatter";
import { KeyboardAwareView } from "../app/utils/keyboard";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import {
  AVAILABLE_CURRENCIES,
  CategoryItem,
  CurrencyInfo,
  addCategory,
  deleteCategory,
  selectBudgetRule,
  selectCategories,
  selectCurrency,
  selectDenominationFormat,
  selectMonthlyIncome,
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

interface BudgetSettingsProps {
  onBackPress?: () => void;
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({ onBackPress }) => {
  const dispatch = useDispatch();
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);
  const categories = useSelector(selectCategories);
  const currency = useSelector(selectCurrency);
  const denominationFormat = useSelector(selectDenominationFormat);

  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());
  const [needsInput, setNeedsInput] = useState(budgetRule.needs.toString());
  const [savingsInput, setSavingsInput] = useState(budgetRule.savings.toString());
  const [wantsInput, setWantsInput] = useState(budgetRule.wants.toString());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

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

  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);

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

  const renderCategoryItem = ({ item, index }: { item: CategoryItem; index: number }) => {
    const itemFade = new Animated.Value(0);
    const itemSlide = new Animated.Value(20);

    Animated.parallel([
      Animated.timing(itemFade, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(itemSlide, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();

    return (
      <Animated.View
        style={[
          styles.categoryItem,
          {
            opacity: itemFade,
            transform: [{ translateY: itemSlide }],
          },
        ]}
      >
        <View style={styles.categoryLeft}>
          <View style={styles.iconContainer}>
            <Text style={styles.categoryIcon}>{item.icon}</Text>
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
        <View style={styles.categoryRight}>
          <View style={[styles.categoryTypeBadge, { backgroundColor: getCategoryColor(item.type) + "20" }]}>
            <Text style={[styles.categoryType, { color: getCategoryColor(item.type) }]}>{item.type}</Text>
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCategory(item.id)}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
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
    { threshold: 0, split: { needs: 40, savings: 50, wants: 10 } }, // Low income
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
        {/* <TouchableOpacity style={styles.backButtonContainer} onPress={onBackPress} activeOpacity={0.7}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity> */}
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
                <Text style={styles.currencyButtonText}>{currency?.code || "USD"}</Text>
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
            <Text style={styles.sectionTitle}>Budget Allocation</Text>
            <TouchableOpacity
              style={styles.recommendButton}
              onPress={() => {
                const income = parseFloat(incomeInput);

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
          <Text style={styles.recommendationInfo}>
            <Text style={styles.infoIcon}>ℹ️ </Text>
            <Text>
              Recommendations adapt based on your income level, with 7 different brackets from very low to very high income. Higher incomes allow for
              more savings, while lower incomes prioritize essential needs.{" "}
            </Text>
            <TouchableOpacity onPress={() => setShowLearnMoreModal(true)}>
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </Text>

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
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity style={styles.addButton} onPress={handleAddCategoryWithAnimation} activeOpacity={0.7}>
                <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addButtonGradient}>
                  <Text style={styles.addButtonText}>+ Add New</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {categories.length === 0 ? (
            <Text style={styles.emptyText}>No categories yet. Add your first one!</Text>
          ) : (
            <View>
              {categories.map((item, index) => {
                const itemFade = new Animated.Value(0);
                const itemSlide = new Animated.Value(20);

                Animated.parallel([
                  Animated.timing(itemFade, {
                    toValue: 1,
                    duration: 300,
                    delay: index * 50,
                    useNativeDriver: true,
                  }),
                  Animated.timing(itemSlide, {
                    toValue: 0,
                    duration: 300,
                    delay: index * 50,
                    useNativeDriver: true,
                  }),
                ]).start();

                return (
                  <React.Fragment key={item.id}>
                    {index > 0 && <View style={styles.separator} />}
                    <Animated.View
                      style={[
                        styles.categoryItem,
                        {
                          opacity: itemFade,
                          transform: [{ translateY: itemSlide }],
                        },
                      ]}
                    >
                      <View style={styles.categoryLeft}>
                        <View style={styles.iconContainer}>
                          <Text style={styles.categoryIcon}>{item.icon}</Text>
                        </View>
                        <Text style={styles.categoryName}>{item.name}</Text>
                      </View>
                      <View style={styles.categoryRight}>
                        <View style={[styles.categoryTypeBadge, { backgroundColor: getCategoryColor(item.type) + "20" }]}>
                          <Text style={[styles.categoryType, { color: getCategoryColor(item.type) }]}>{item.type}</Text>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCategory(item.id)}>
                          <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </View>

        {/* Currency Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Currency</Text>
            <TouchableOpacity style={styles.currencyButton} onPress={() => setShowCurrencyModal(true)}>
              <Text style={styles.currencyButtonText}>{currency.code}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDescription}>Set your preferred currency for the app.</Text>
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

      {/* Learn More Modal */}
      <Modal visible={showLearnMoreModal} animationType="fade" transparent onRequestClose={() => setShowLearnMoreModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerView}>
            {/* Header */}
            <View style={styles.modalHeaderView}>
              <Text style={styles.modalTitleText}>Budget Allocation Guide</Text>
              <TouchableOpacity onPress={() => setShowLearnMoreModal(false)} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.learnMoreTitle}>Aggressive Savings Rule</Text>
              <Text style={styles.learnMoreParagraph}>
                For disciplined wealth building, allocate the highest possible percentage to savings, especially as your income increases. Needs and
                wants are kept minimal.
              </Text>

              <Text style={styles.learnMoreTitle}>Why Recommendations Change Based on Income</Text>
              <Text style={styles.learnMoreParagraph}>
                • <Text style={styles.bold}>Higher incomes</Text>: Essential needs don&apos;t scale with income, so you can (and should) save much
                more.
              </Text>
              <Text style={styles.learnMoreParagraph}>
                • <Text style={styles.bold}>Lower incomes</Text>: Prioritize needs, but always save something, even if it&apos;s a small percentage.
              </Text>

              <Text style={styles.learnMoreTitle}>Income-Based Recommendations</Text>
              <Text style={styles.learnMoreParagraph}>
                Recommendations adjust for your income and currency. Thresholds are scaled for your local purchasing power.
              </Text>
              <View style={styles.tableContainer}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableHeader]}>Income Level (USD Base)</Text>
                  <Text style={[styles.tableCell, styles.tableHeader]}>Needs</Text>
                  <Text style={[styles.tableCell, styles.tableHeader]}>Savings</Text>
                  <Text style={[styles.tableCell, styles.tableHeader]}>Wants</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Ultra High (≥$15,000)</Text>
                  <Text style={styles.tableCell}>10%</Text>
                  <Text style={styles.tableCell}>85%</Text>
                  <Text style={styles.tableCell}>5%</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Very High ($10,000-$14,999)</Text>
                  <Text style={styles.tableCell}>12%</Text>
                  <Text style={styles.tableCell}>80%</Text>
                  <Text style={styles.tableCell}>8%</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>High ($5,000-$9,999)</Text>
                  <Text style={styles.tableCell}>15%</Text>
                  <Text style={styles.tableCell}>75%</Text>
                  <Text style={styles.tableCell}>10%</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Upper Middle ($3,000-$4,999)</Text>
                  <Text style={styles.tableCell}>20%</Text>
                  <Text style={styles.tableCell}>70%</Text>
                  <Text style={styles.tableCell}>10%</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Middle ($2,000-$2,999)</Text>
                  <Text style={styles.tableCell}>25%</Text>
                  <Text style={styles.tableCell}>65%</Text>
                  <Text style={styles.tableCell}>10%</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Lower Middle ($1,500-$1,999)</Text>
                  <Text style={styles.tableCell}>30%</Text>
                  <Text style={styles.tableCell}>60%</Text>
                  <Text style={styles.tableCell}>10%</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Low (&lt;$1,500)</Text>
                  <Text style={styles.tableCell}>40%</Text>
                  <Text style={styles.tableCell}>50%</Text>
                  <Text style={styles.tableCell}>10%</Text>
                </View>
              </View>

              <Text style={styles.learnMoreTitle}>Currency Adjustments</Text>
              <Text style={styles.learnMoreParagraph}>
                Income thresholds are adjusted for your currency&apos;s value. Stronger currencies lower the thresholds, weaker ones raise them.
              </Text>

              <Text style={styles.learnMoreTitle}>Tips for Successful Budgeting</Text>
              <Text style={styles.learnMoreParagraph}>
                1. <Text style={styles.bold}>Track all expenses</Text>: Know where your money goes.
              </Text>
              <Text style={styles.learnMoreParagraph}>
                2. <Text style={styles.bold}>Emergency fund</Text>: Save 3-6 months of expenses first.
              </Text>
              <Text style={styles.learnMoreParagraph}>
                3. <Text style={styles.bold}>Automate savings</Text>: Set up automatic transfers.
              </Text>
              <Text style={styles.learnMoreParagraph}>
                4. <Text style={styles.bold}>Review regularly</Text>: Adjust your budget monthly.
              </Text>
              <Text style={styles.learnMoreParagraph}>
                5. <Text style={styles.bold}>Be flexible</Text>: Update your allocations as life changes.
              </Text>
            </ScrollView>
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
});

export default BudgetSettings;
