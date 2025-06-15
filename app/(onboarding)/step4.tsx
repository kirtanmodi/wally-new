import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import OnboardingStep from "../../components/OnboardingStep";
import { scaleFontSize, responsivePadding } from "../utils/responsive";
import {
  selectCategories,
  addCategory,
  deleteCategory,
  CategoryItem,
} from "../../redux/slices/budgetSlice";
import { BudgetCategory } from "../types/budget";

export default function OnboardingStep4() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const categories = useSelector(selectCategories);
  const [selectedType, setSelectedType] = useState<BudgetCategory>("Needs");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("💡");

  const handleNext = () => {
    router.push("/(onboarding)/step5");
  };

  const handleBack = () => {
    router.back();
  };

  const categoryTypes: BudgetCategory[] = ["Needs", "Savings", "Wants"];

  const getFilteredCategories = (type: BudgetCategory) => {
    return categories.filter(cat => cat.type === type);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: CategoryItem = {
        id: `custom_${Date.now()}`,
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        type: selectedType,
      };
      dispatch(addCategory(newCategory));
      setNewCategoryName("");
      setNewCategoryIcon("💡");
      setShowAddForm(false);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => dispatch(deleteCategory(categoryId)),
        },
      ]
    );
  };

  const availableIcons = ["💡", "🏠", "💼", "🛒", "🚗", "💰", "📈", "🍽️", "🛍️", "🎬", "✈️", "🏥", "📚", "🎮", "🏋️", "🎵"];

  const renderTypeSelector = () => (
    <View style={styles.typeSelectorContainer}>
      <Text style={styles.typeSelectorTitle}>Category Type</Text>
      <View style={styles.typeButtons}>
        {categoryTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType(type)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type && styles.typeButtonTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategoryItem = (category: CategoryItem) => (
    <View key={category.id} style={styles.categoryItem}>
      <View style={styles.categoryLeft}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>
      {category.id.startsWith("custom_") && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(category.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAddForm = () => (
    <View style={styles.addFormContainer}>
      <View style={styles.addFormHeader}>
        <Text style={styles.addFormTitle}>Add New Category</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setShowAddForm(false);
            setNewCategoryName("");
            setNewCategoryIcon("💡");
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category Name</Text>
        <TextInput
          style={styles.textInput}
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholder="Enter category name"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          maxLength={20}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Choose Icon</Text>
        <View style={styles.iconGrid}>
          {availableIcons.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                newCategoryIcon === icon && styles.iconOptionSelected,
              ]}
              onPress={() => setNewCategoryIcon(icon)}
              activeOpacity={0.7}
            >
              <Text style={styles.iconOptionText}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          !newCategoryName.trim() && styles.addButtonDisabled,
        ]}
        onPress={handleAddCategory}
        disabled={!newCategoryName.trim()}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.addButtonText,
            !newCategoryName.trim() && styles.addButtonTextDisabled,
          ]}
        >
          Add Category
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategoriesSection = () => {
    const filteredCategories = getFilteredCategories(selectedType);
    
    return (
      <View style={styles.categoriesSection}>
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>
            {selectedType} Categories ({filteredCategories.length})
          </Text>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addCategoryButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesList}>
          {filteredCategories.map(renderCategoryItem)}
        </View>

        {showAddForm && renderAddForm()}
      </View>
    );
  };

  return (
    <OnboardingStep
      title="Customize Categories"
      subtitle="Personalize your expense categories"
      currentStep={4}
      totalSteps={5}
      onNext={handleNext}
      onBack={handleBack}
      nextButtonText="Continue"
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            We&apos;ve set up some default categories for you. You can add new ones or remove categories you don&apos;t need.
          </Text>
        </View>

        {renderTypeSelector()}
        {renderCategoriesSection()}

        <View style={styles.tipSection}>
          <Text style={styles.tipTitle}>💡 Tips for Categories</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • Keep categories broad enough to be useful but specific enough to track spending
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • You can always add, edit, or remove categories later in settings
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipText}>
              • Default categories cover most common expenses for getting started
            </Text>
          </View>
        </View>
      </ScrollView>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  introSection: {
    marginBottom: responsivePadding(25),
  },
  introText: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
  },
  typeSelectorContainer: {
    marginBottom: responsivePadding(25),
  },
  typeSelectorTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
  },
  typeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  typeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    minWidth: 80,
  },
  typeButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  typeButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
  },
  typeButtonTextActive: {
    fontWeight: "600",
    opacity: 1,
  },
  categoriesSection: {
    marginBottom: responsivePadding(25),
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  categoriesTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addCategoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  addCategoryButtonText: {
    fontSize: scaleFontSize(12),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  categoriesList: {
    gap: 10,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: scaleFontSize(20),
    marginRight: 12,
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#FFFFFF",
    flex: 1,
  },
  deleteButton: {
    width: 30,
    height: 30,
    backgroundColor: "rgba(255, 107, 107, 0.3)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.5)",
  },
  deleteButtonText: {
    fontSize: scaleFontSize(18),
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  addFormContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  addFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  addFormTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 107, 107, 0.3)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.5)",
  },
  cancelButtonText: {
    fontSize: scaleFontSize(12),
    fontWeight: "600",
    color: "#FF6B6B",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 8,
    opacity: 0.9,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconOption: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  iconOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  iconOptionText: {
    fontSize: scaleFontSize(18),
  },
  addButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  addButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  addButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addButtonTextDisabled: {
    opacity: 0.5,
  },
  tipSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tipTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  tipItem: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
  },
});