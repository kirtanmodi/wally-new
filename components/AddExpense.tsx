import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import COLORS from "../app/constants/Colors";
import { BudgetCategory, Expense, ExpenseCategory } from "../app/types/budget";
import { getCurrencySymbol } from "../app/utils/currency";
import { KeyboardAwareView } from "../app/utils/keyboard";
import { CategoryItem, selectCategories, selectCurrency } from "../redux/slices/budgetSlice";
import { FontAwesome } from "@expo/vector-icons";

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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const allCategories = useSelector(selectCategories);
  const currency = useSelector(selectCurrency);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const filteredCategories = allCategories.filter((cat) => cat.type === budgetCategory);
    setFilteredCategories(filteredCategories);
  }, [budgetCategory, allCategories]);

  useEffect(() => {
    if (isEditing && initialExpense) {
      setAmount(initialExpense.amount.toString());
      setDescription(initialExpense.title);
      setBudgetCategory(initialExpense.category);
      setCategory(initialExpense.subcategory);
      setDate(typeof initialExpense.date === "string" ? new Date(initialExpense.date) : initialExpense.date);
    }
  }, [isEditing, initialExpense]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !isEditing) {
      setCategory(filteredCategories[0].name);
    }
  }, [budgetCategory, filteredCategories, isEditing]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSave = () => {
    if (parseFloat(amount) <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing description", "Please enter a description for this expense.");
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDate(selectedDate);
    }

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

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

  const handleIOSDone = () => {
    Animated.timing(datePickerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowIOSModal(false);
    });
  };

  const handleIOSCancel = () => {
    Animated.timing(datePickerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowIOSModal(false);
    });
  };

  const getBudgetCategoryColor = (category: BudgetCategory) => {
    switch (category) {
      case "Needs": return COLORS.primary.green;
      case "Savings": return COLORS.primary.blue;
      case "Wants": return COLORS.primary.pink;
      default: return COLORS.primary.blue;
    }
  };

  return (
    <KeyboardAwareView style={styles.container} keyboardVerticalOffset={10}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color={COLORS.neutral.darkGray} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? "Edit Expense" : "Add Expense"}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
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
              placeholder="0"
              placeholderTextColor={COLORS.neutral.darkGray}
            />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this expense for?"
            placeholderTextColor={COLORS.neutral.darkGray}
            returnKeyType="done"
            blurOnSubmit={true}
          />
        </View>

        {/* Budget Category Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Budget Category</Text>
          <View style={styles.budgetCategoriesContainer}>
            {(["Needs", "Savings", "Wants"] as BudgetCategory[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.budgetCategoryButton,
                  budgetCategory === cat && styles.selectedBudgetCategory,
                ]}
                onPress={() => setBudgetCategory(cat)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={budgetCategory === cat 
                    ? [getBudgetCategoryColor(cat), getBudgetCategoryColor(cat)] 
                    : [COLORS.neutral.lightGray, COLORS.neutral.lightGray]
                  }
                  style={styles.budgetCategoryGradient}
                >
                  <Text style={[
                    styles.budgetCategoryText, 
                    budgetCategory === cat && styles.selectedBudgetCategoryText
                  ]}>
                    {cat}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((option: CategoryItem) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.categoryOption, 
                    category === option.name && styles.selectedCategory
                  ]}
                  onPress={() => setCategory(option.name)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    category === option.name && styles.selectedCategoryLabel
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noCategoriesText}>
                No categories found for {budgetCategory}. Please add categories in settings.
              </Text>
            )}
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Date</Text>
          <TouchableOpacity style={styles.datePickerButton} onPress={showDatepicker}>
            <FontAwesome name="calendar" size={20} color={COLORS.primary.blue} />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <FontAwesome name="chevron-right" size={16} color={COLORS.neutral.darkGray} />
          </TouchableOpacity>

          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker 
              value={date} 
              mode="date" 
              display="default" 
              onChange={onDateChange} 
              maximumDate={new Date()} 
            />
          )}

          {Platform.OS === "ios" && showIOSModal && (
            <Animated.View
              style={[
                styles.iosModalOverlay,
                { opacity: datePickerAnim }
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
                      <Text style={[styles.iosDatePickerButton, { color: COLORS.primary.blue }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerWrapper}>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      textColor={COLORS.neutral.darkGray}
                      themeVariant="light"
                      style={styles.iosDatePicker}
                    />
                  </View>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <LinearGradient
            colors={COLORS.gradients.pinkBlue}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? "Update Expense" : "Save Expense"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAwareView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.neutral.black,
  },
  headerSpacer: {
    width: 44,
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    color: COLORS.neutral.darkGray,
    marginBottom: 16,
    fontWeight: "500",
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "600",
    color: COLORS.neutral.darkGray,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: "700",
    color: COLORS.neutral.black,
    textAlign: "center",
    minWidth: 100,
  },
  formSection: {
    marginBottom: 24,
  },
  descriptionInput: {
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.neutral.black,
  },
  budgetCategoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetCategoryButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  budgetCategoryGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  selectedBudgetCategory: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  budgetCategoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.neutral.darkGray,
  },
  selectedBudgetCategoryText: {
    color: COLORS.neutral.white,
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
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    textAlign: "center",
    color: COLORS.neutral.darkGray,
    fontWeight: "500",
  },
  selectedCategoryLabel: {
    color: COLORS.primary.blue,
    fontWeight: "600",
  },
  noCategoriesText: {
    padding: 16,
    color: COLORS.neutral.darkGray,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.neutral.black,
    flex: 1,
    marginLeft: 12,
    fontWeight: "500",
  },
  saveButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: COLORS.neutral.white,
    fontSize: 16,
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
    backgroundColor: COLORS.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 42 : 32,
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.lightGray,
  },
  iosDatePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.neutral.black,
  },
  iosDatePickerButton: {
    fontSize: 16,
    padding: 4,
    color: COLORS.neutral.darkGray,
  },
  datePickerWrapper: {
    width: "100%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 8 : 0,
    overflow: "hidden",
  },
  iosDatePicker: {
    height: 180,
    width: "100%",
  },
});

export default AddExpense;