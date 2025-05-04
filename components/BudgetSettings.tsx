import React, { useEffect, useState } from "react";
import { Alert, Animated, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AdditionalColors, BudgetColors } from "../app/constants/Colors";
import { BudgetCategory } from "../app/types/budget";
import { getCurrencySymbol } from "../app/utils/currency";
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

  useEffect(() => {
    validatePercentages();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonContainer} onPress={onBackPress} activeOpacity={0.7}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeContainer}>
          {monthlyIncome === 0 && <Text style={styles.welcomeText}>Welcome! Let&apos;s set up your budget to start tracking your finances.</Text>}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Monthly Income</Text>
            <TouchableOpacity style={styles.currencyButton} onPress={() => setShowCurrencyModal(true)} activeOpacity={0.7}>
              <Text style={styles.currencyButtonText}>{currency?.code || "USD"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>{currency ? getCurrencySymbol(currency) : "$"}</Text>
            <TextInput
              style={styles.incomeInput}
              value={incomeInput}
              onChangeText={setIncomeInput}
              keyboardType="numeric"
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
              <View style={[styles.budgetColorIndicator, { backgroundColor: BudgetColors.needs }]} />
              <Text style={styles.budgetItemLabel}>Needs</Text>
              <TextInput
                style={[styles.percentageInput, percentageError && styles.errorInput]}
                value={needsInput}
                onChangeText={setNeedsInput}
                keyboardType="numeric"
                onBlur={handleSaveBudgetRule}
              />
              <Text style={styles.percentSign}>%</Text>
            </View>

            <View style={styles.budgetItemContainer}>
              <View style={[styles.budgetColorIndicator, { backgroundColor: BudgetColors.savings }]} />
              <Text style={styles.budgetItemLabel}>Savings</Text>
              <TextInput
                style={[styles.percentageInput, percentageError && styles.errorInput]}
                value={savingsInput}
                onChangeText={setSavingsInput}
                keyboardType="numeric"
                onBlur={handleSaveBudgetRule}
              />
              <Text style={styles.percentSign}>%</Text>
            </View>

            <View style={styles.budgetItemContainer}>
              <View style={[styles.budgetColorIndicator, { backgroundColor: BudgetColors.wants }]} />
              <Text style={styles.budgetItemLabel}>Wants</Text>
              <TextInput
                style={[styles.percentageInput, percentageError && styles.errorInput]}
                value={wantsInput}
                onChangeText={setWantsInput}
                keyboardType="numeric"
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
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddCategory(true)} activeOpacity={0.7}>
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => <Text style={styles.emptyText}>No categories yet. Add your first one!</Text>}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={showAddCategory} animationType="slide" transparent={true} onRequestClose={() => setShowAddCategory(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Category Name</Text>
              <TextInput
                style={styles.modalInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="e.g., Utilities, Education, etc."
              />

              <Text style={styles.modalLabel}>Select Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconSelector}>
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

              <Text style={styles.modalLabel}>Category Type</Text>
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

              <TouchableOpacity style={styles.saveButton} onPress={handleAddCategory}>
                <Text style={styles.saveButtonText}>Save Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent={true} onRequestClose={() => setShowCurrencyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={AVAILABLE_CURRENCIES}
              keyExtractor={(item) => item.code}
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
    borderBottomColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    marginRight: responsiveMargin(10),
  },
  backButton: {
    fontSize: scaleFontSize(20),
    color: "#333",
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.5,
  },
  welcomeContainer: {
    paddingHorizontal: responsivePadding(16),
    paddingTop: responsivePadding(16),
  },
  welcomeText: {
    fontSize: scaleFontSize(16),
    color: "#666",
    lineHeight: 24,
    marginBottom: responsiveMargin(8),
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: responsivePadding(20),
    backgroundColor: "#FFF",
    marginBottom: responsiveMargin(16),
    borderRadius: 16,
    marginHorizontal: responsiveMargin(16),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(12),
    color: "#333",
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(16),
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: responsivePadding(12),
    height: 50,
    backgroundColor: "#FCFCFC",
  },
  dollarSign: {
    fontSize: scaleFontSize(20),
    color: "#333",
    marginRight: responsiveMargin(4),
  },
  incomeInput: {
    flex: 1,
    fontSize: scaleFontSize(18),
    color: "#333",
    height: "100%",
  },
  budgetRuleContainer: {
    marginTop: responsiveMargin(8),
  },
  budgetItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(16),
  },
  budgetColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: responsiveMargin(12),
  },
  budgetItemLabel: {
    flex: 1,
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  percentageInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 10,
    paddingHorizontal: responsivePadding(8),
    textAlign: "center",
    fontSize: scaleFontSize(16),
    marginRight: responsiveMargin(4),
    backgroundColor: "#FCFCFC",
  },
  percentSign: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  errorInput: {
    borderColor: AdditionalColors.error,
  },
  errorText: {
    color: AdditionalColors.error,
    fontSize: scaleFontSize(14),
    marginTop: responsiveMargin(4),
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(16),
  },
  addButton: {
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(8),
    backgroundColor: `${BudgetColors.needs}30`,
    borderRadius: 20,
  },
  addButtonText: {
    color: BudgetColors.needs,
    fontSize: scaleFontSize(14),
    fontWeight: "600",
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsivePadding(12),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    fontSize: scaleFontSize(18),
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTypeBadge: {
    paddingHorizontal: responsivePadding(10),
    paddingVertical: responsivePadding(6),
    borderRadius: 12,
    marginRight: responsiveMargin(8),
  },
  categoryType: {
    fontSize: scaleFontSize(12),
    fontWeight: "500",
  },
  deleteButton: {
    padding: responsivePadding(8),
    borderRadius: 16,
  },
  deleteIcon: {
    fontSize: scaleFontSize(16),
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: responsiveMargin(4),
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    padding: responsivePadding(20),
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: responsivePadding(20),
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(16),
  },
  modalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    fontSize: scaleFontSize(20),
    color: "#666",
  },
  modalForm: {
    marginBottom: responsiveMargin(20),
  },
  modalLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#333",
    marginBottom: responsiveMargin(6),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(10),
    fontSize: scaleFontSize(16),
    marginBottom: responsiveMargin(16),
  },
  iconSelector: {
    flexDirection: "row",
    marginBottom: responsiveMargin(16),
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    marginRight: responsiveMargin(8),
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
    marginBottom: responsiveMargin(20),
  },
  typeOption: {
    flex: 1,
    paddingVertical: responsivePadding(8),
    marginHorizontal: responsiveMargin(4),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },
  selectedType: {
    borderWidth: 1,
  },
  typeText: {
    fontSize: scaleFontSize(14),
    color: "#666",
  },
  saveButton: {
    backgroundColor: BudgetColors.needs,
    padding: responsivePadding(12),
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  currencyButton: {
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(6),
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  currencyButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#555",
  },
  currencyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(16),
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
    marginRight: responsiveMargin(12),
    width: 24,
    textAlign: "center",
  },
  currencyName: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  currencyCode: {
    fontSize: scaleFontSize(14),
    color: "#666",
    fontWeight: "500",
  },
});

export default BudgetSettings;
