import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Alert, Animated, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AdditionalColors, BudgetColors } from "../app/constants/Colors";
import { BudgetCategory } from "../app/types/budget";
import { getCurrencySymbol } from "../app/utils/currency";
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
  selectMonthlyIncome,
  setCurrency,
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

interface BudgetSettingsProps {
  onBackPress?: () => void;
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({ onBackPress }) => {
  const dispatch = useDispatch();
  const monthlyIncome = useSelector(selectMonthlyIncome);
  const budgetRule = useSelector(selectBudgetRule);
  const categories = useSelector(selectCategories);
  const currency = useSelector(selectCurrency);

  // Local state
  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());
  const [needsInput, setNeedsInput] = useState(budgetRule.needs.toString());
  const [savingsInput, setSavingsInput] = useState(budgetRule.savings.toString());
  const [wantsInput, setWantsInput] = useState(budgetRule.wants.toString());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Category modal state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(COMMON_ICONS[0]);
  const [selectedType, setSelectedType] = useState<BudgetCategory>("Needs");

  // Error state
  const [percentageError, setPercentageError] = useState(false);

  // Add animation values for micro-interactions
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    validatePercentages();

    // Enhanced entrance animation with sequence
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
      Alert.alert("Error", "Percentages must add up to 100%");
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

    // Reset form
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

  const renderCategoryItem = ({ item, index }: { item: CategoryItem; index: number }) => {
    const itemFade = new Animated.Value(0);
    const itemSlide = new Animated.Value(20);

    // Staggered animation for list items
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

  // Create a pulsing animation function for buttons
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
          <Text style={styles.sectionTitle}>Budget Allocation</Text>
          <Text style={styles.sectionDescription}>Adjust your budget percentages based on the 50-30-20 rule.</Text>

          <View style={styles.budgetRuleContainer}>
            <View style={styles.budgetItemContainer}>
              <LinearGradient colors={["#5BD990", "#3DB26E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.budgetColorIndicator} />
              <Text style={styles.budgetItemLabel}>Needs</Text>
              <TextInput
                style={[styles.percentageInput, percentageError && styles.errorInput]}
                value={needsInput}
                onChangeText={setNeedsInput}
                keyboardType="numeric"
                returnKeyType="done"
                onBlur={handleSaveBudgetRule}
              />
              <Text style={styles.percentSign}>%</Text>
            </View>

            <View style={styles.budgetItemContainer}>
              <LinearGradient colors={["#FFBA6E", "#FF9C36"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.budgetColorIndicator} />
              <Text style={styles.budgetItemLabel}>Savings</Text>
              <TextInput
                style={[styles.percentageInput, percentageError && styles.errorInput]}
                value={savingsInput}
                onChangeText={setSavingsInput}
                keyboardType="numeric"
                returnKeyType="done"
                onBlur={handleSaveBudgetRule}
              />
              <Text style={styles.percentSign}>%</Text>
            </View>

            <View style={styles.budgetItemContainer}>
              <LinearGradient colors={["#837BFF", "#605BFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.budgetColorIndicator} />
              <Text style={styles.budgetItemLabel}>Wants</Text>
              <TextInput
                style={[styles.percentageInput, percentageError && styles.errorInput]}
                value={wantsInput}
                onChangeText={setWantsInput}
                keyboardType="numeric"
                returnKeyType="done"
                onBlur={handleSaveBudgetRule}
              />
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

                // Staggered animation for list items
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
  percentageInput: {
    width: 70,
    height: 48,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 14,
    paddingHorizontal: responsivePadding(10),
    textAlign: "center",
    fontSize: scaleFontSize(18),
    marginRight: responsiveMargin(4),
    backgroundColor: "#FCFCFC",
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
});

export default BudgetSettings;
