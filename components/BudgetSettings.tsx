import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory } from "../app/types/budget";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import {
  CategoryItem,
  addCategory,
  deleteCategory,
  selectBudgetRule,
  selectCategories,
  selectMonthlyIncome,
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

  // Local state
  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());
  const [needsInput, setNeedsInput] = useState(budgetRule.needs.toString());
  const [savingsInput, setSavingsInput] = useState(budgetRule.savings.toString());
  const [wantsInput, setWantsInput] = useState(budgetRule.wants.toString());
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Category modal state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(COMMON_ICONS[0]);
  const [selectedType, setSelectedType] = useState<BudgetCategory>("Needs");

  // Error state
  const [percentageError, setPercentageError] = useState(false);

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

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryLeft}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>50-30-20 Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Income</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.dollarSign}>$</Text>
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
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddCategory(true)}>
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No categories added yet.</Text>}
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
    </View>
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
  },
  backButton: {
    fontSize: scaleFontSize(24),
    marginRight: responsiveMargin(10),
    color: "#333",
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: responsivePadding(16),
    backgroundColor: "#FFF",
    marginBottom: responsiveMargin(16),
    borderRadius: 12,
    marginHorizontal: responsiveMargin(16),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(12),
    color: "#333",
  },
  sectionDescription: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(16),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: responsivePadding(12),
    height: 50,
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
    marginBottom: responsiveMargin(12),
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
    borderColor: "#DDD",
    borderRadius: 4,
    paddingHorizontal: responsivePadding(8),
    textAlign: "center",
    fontSize: scaleFontSize(16),
    marginRight: responsiveMargin(4),
  },
  percentSign: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  errorInput: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
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
    paddingVertical: responsivePadding(6),
    backgroundColor: BudgetColors.needs + "20",
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
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    fontSize: scaleFontSize(20),
    marginRight: responsiveMargin(12),
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
    paddingHorizontal: responsivePadding(8),
    paddingVertical: responsivePadding(4),
    borderRadius: 12,
    marginRight: responsiveMargin(8),
  },
  categoryType: {
    fontSize: scaleFontSize(12),
    fontWeight: "500",
  },
  deleteButton: {
    padding: responsivePadding(8),
  },
  deleteIcon: {
    fontSize: scaleFontSize(16),
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    padding: responsivePadding(20),
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
});

export default BudgetSettings;
