import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { BudgetCategory, Expense, ExpenseCategory } from "../app/types/budget";
import { getCurrencySymbol } from "../app/utils/currency";
import { KeyboardAwareView } from "../app/utils/keyboard";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { CategoryItem, selectCategories, selectCurrency } from "../redux/slices/budgetSlice";

interface AddExpenseProps {
  onSave?: (expenseData: {
    amount: number;
    description: string;
    budgetCategory: BudgetCategory;
    category: ExpenseCategory | string;
    date: Date;
  }) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  initialExpense?: Expense | null;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onSave, onCancel, isEditing = false, initialExpense = null }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [budgetCategory, setBudgetCategory] = useState<BudgetCategory>("Needs");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [filteredCategories, setFilteredCategories] = useState<CategoryItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const datePickerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const filteredCategories = allCategories.filter((cat) => cat.type === budgetCategory);
    setFilteredCategories(filteredCategories);
  }, [budgetCategory]);

  // Get categories from Redux
  const allCategories = useSelector(selectCategories);
  const currency = useSelector(selectCurrency);

  // Initialize form values when editing
  useEffect(() => {
    if (isEditing && initialExpense) {
      setAmount(initialExpense.amount.toString());
      setDescription(initialExpense.title);
      setBudgetCategory(initialExpense.category);
      setCategory(initialExpense.subcategory);
      setDate(typeof initialExpense.date === "string" ? new Date(initialExpense.date) : initialExpense.date);
    }
  }, [isEditing, initialExpense]);

  // Filter categories by budget type
  // const filteredCategories = allCategories.filter((cat) => cat.type === budgetCategory);

  // Set default category when budget category changes (only for editing flows)
  useEffect(() => {
    if (filteredCategories.length > 0 && !isEditing) {
      setCategory(filteredCategories[0].name);
    }
  }, [budgetCategory, filteredCategories, isEditing]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleSave = () => {
    if (parseFloat(amount) <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    if (onSave) {
      onSave({
        amount: parseFloat(amount),
        description,
        budgetCategory,
        category,
        date,
      });
    }
  };

  // Date picker handling
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }

    // Hide date picker on Android automatically
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  // Show date picker - platform specific
  const showDatepicker = () => {
    if (Platform.OS === "ios") {
      setShowIOSModal(true);
      Animated.timing(datePickerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setShowDatePicker(true);
    }
  };

  // For iOS - handle the done button
  const handleIOSDone = () => {
    Animated.timing(datePickerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowIOSModal(false);
    });
  };

  // For iOS - handle cancel
  const handleIOSCancel = () => {
    Animated.timing(datePickerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowIOSModal(false);
    });
  };

  return (
    <KeyboardAwareView style={styles.container} keyboardVerticalOffset={10}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? "Edit Expense" : "Add Expense"}</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>{getCurrencySymbol(currency)}</Text>
          <TextInput
            autoFocus={true}
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="What was this expense for?"
          placeholderTextColor="#999"
          returnKeyType="done"
          blurOnSubmit={true}
        />
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Budget Category</Text>
        <View style={styles.budgetCategoriesContainer}>
          <TouchableOpacity
            style={[
              styles.budgetCategoryButton,
              budgetCategory === "Needs" && styles.selectedBudgetCategory,
              { backgroundColor: budgetCategory === "Needs" ? BudgetColors.needs : BudgetColors.needs + "20" },
            ]}
            onPress={() => setBudgetCategory("Needs")}
          >
            <Text style={[styles.budgetCategoryText, budgetCategory === "Needs" && styles.selectedBudgetCategoryText]}>Needs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.budgetCategoryButton,
              budgetCategory === "Savings" && styles.selectedBudgetCategory,
              { backgroundColor: budgetCategory === "Savings" ? BudgetColors.savings : BudgetColors.savings + "20" },
            ]}
            onPress={() => setBudgetCategory("Savings")}
          >
            <Text style={[styles.budgetCategoryText, budgetCategory === "Savings" && styles.selectedBudgetCategoryText]}>Savings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.budgetCategoryButton,
              budgetCategory === "Wants" && styles.selectedBudgetCategory,
              { backgroundColor: budgetCategory === "Wants" ? BudgetColors.wants : BudgetColors.wants + "20" },
            ]}
            onPress={() => setBudgetCategory("Wants")}
          >
            <Text style={[styles.budgetCategoryText, budgetCategory === "Wants" && styles.selectedBudgetCategoryText]}>Wants</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Category (Optional)</Text>
        <View style={styles.categoryGrid}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((option: CategoryItem) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.categoryOption, category === option.name && styles.selectedCategory]}
                onPress={() => setCategory(option.name)}
              >
                <Text style={styles.categoryIcon}>{option.icon}</Text>
                <Text style={styles.categoryLabel}>{option.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noCategoriesText}>No categories found for {budgetCategory}. Please add categories in settings.</Text>
          )}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionLabel}>Date</Text>
        <TouchableOpacity style={styles.datePickerButton} onPress={showDatepicker}>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </TouchableOpacity>

        {/* Android Date Picker */}
        {Platform.OS === "android" && showDatePicker && (
          <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} maximumDate={new Date()} />
        )}

        {/* iOS Date Picker with modal */}
        {Platform.OS === "ios" && showIOSModal && (
          <Animated.View
            style={[
              styles.iosModalOverlay,
              {
                opacity: datePickerAnim,
              },
            ]}
          >
            <TouchableOpacity style={styles.iosModalBackdrop} onPress={handleIOSCancel} activeOpacity={1}>
              <Animated.View
                style={[
                  styles.iosDatePickerContainer,
                  {
                    transform: [
                      {
                        translateY: datePickerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [300, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.iosDatePickerHeader}>
                  <TouchableOpacity onPress={handleIOSCancel}>
                    <Text style={styles.iosDatePickerButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.iosDatePickerTitle}>Select Date</Text>
                  <TouchableOpacity onPress={handleIOSDone}>
                    <Text style={[styles.iosDatePickerButton, { color: BudgetColors.needs }]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.datePickerWrapper}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    textColor="#333"
                    themeVariant="light"
                    style={styles.iosDatePicker}
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{isEditing ? "Update Expense" : "Save Expense"}</Text>
      </TouchableOpacity>
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: responsivePadding(16),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveMargin(24),
  },
  backButton: {
    fontSize: scaleFontSize(24),
    marginRight: responsiveMargin(10),
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
  },
  formSection: {
    marginBottom: responsiveMargin(24),
  },
  sectionLabel: {
    fontSize: scaleFontSize(16),
    color: "#666",
    marginBottom: responsiveMargin(8),
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: scaleFontSize(24),
    marginRight: 8,
  },
  amountInput: {
    fontSize: scaleFontSize(32),
    flex: 1,
  },
  descriptionInput: {
    fontSize: scaleFontSize(16),
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  budgetCategoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetCategoryButton: {
    flex: 1,
    paddingVertical: responsivePadding(12),
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedBudgetCategory: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  budgetCategoryText: {
    fontSize: scaleFontSize(14),
  },
  selectedBudgetCategoryText: {
    color: "white",
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  categoryOption: {
    width: "33.33%",
    padding: 8,
    alignItems: "center",
  },
  selectedCategory: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  categoryIcon: {
    fontSize: scaleFontSize(24),
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: scaleFontSize(12),
    textAlign: "center",
  },
  noCategoriesText: {
    padding: responsivePadding(16),
    color: "#999",
    textAlign: "center",
    width: "100%",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: scaleFontSize(16),
  },
  saveButton: {
    backgroundColor: BudgetColors.needs,
    paddingVertical: responsivePadding(16),
    borderRadius: 8,
    alignItems: "center",
    marginTop: responsiveMargin(16),
    marginBottom: responsiveMargin(32),
  },
  saveButtonText: {
    color: "white",
    fontSize: scaleFontSize(16),
    fontWeight: "600",
  },
  iosModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    justifyContent: "flex-end",
  },
  iosModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  iosDatePickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: responsivePadding(16),
    paddingBottom: Platform.OS === "ios" ? 42 : responsivePadding(32),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  iosDatePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsivePadding(20),
    paddingBottom: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iosDatePickerTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  iosDatePickerButton: {
    fontSize: scaleFontSize(16),
    padding: responsivePadding(4),
  },
  datePickerWrapper: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: Platform.OS === "ios" ? responsivePadding(8) : 0,
    overflow: "hidden",
  },
  iosDatePicker: {
    height: 180,
    width: "100%",
  },
});

export default AddExpense;