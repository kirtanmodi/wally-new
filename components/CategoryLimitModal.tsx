import React, { useEffect, useState } from "react";
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetColors } from "../app/constants/Colors";
import { formatCurrency } from "../app/utils/currency";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../app/utils/responsive";
import { selectCurrency, selectDenominationFormat } from "../redux/slices/budgetSlice";

interface CategoryLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (limit: number) => void;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  currentLimit?: number;
}

const CategoryLimitModal: React.FC<CategoryLimitModalProps> = ({
  visible,
  onClose,
  onSave,
  categoryId,
  categoryName,
  categoryIcon,
  currentLimit = 0,
}) => {
  const [limit, setLimit] = useState(currentLimit.toString());
  const currency = useSelector(selectCurrency) || { code: "USD", symbol: "$", name: "US Dollar" };
  const denominationFormat = useSelector(selectDenominationFormat);

  useEffect(() => {
    if (visible) {
      setLimit(currentLimit.toString());
    }
  }, [visible, currentLimit]);

  const handleSave = () => {
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number for the category limit.");
      return;
    }

    onSave(numLimit);
    onClose();
  };

  const handleClose = () => {
    setLimit(currentLimit.toString());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            </View>
            <Text style={styles.modalTitle}>Set Budget Limit</Text>
            <Text style={styles.categoryName}>{categoryName}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Monthly Budget Limit ({currency.symbol})</Text>
            <TextInput
              style={styles.input}
              value={limit}
              onChangeText={setLimit}
              placeholder="Enter amount"
              keyboardType="numeric"
              returnKeyType="done"
              selectTextOnFocus
            />
            <Text style={styles.helperText}>
              Set how much you want to budget for {categoryName} this month
            </Text>
          </View>

          {currentLimit > 0 && (
            <View style={styles.currentLimitContainer}>
              <Text style={styles.currentLimitLabel}>Current Limit:</Text>
              <Text style={styles.currentLimitAmount}>
                {formatCurrency(currentLimit, currency, denominationFormat)}
              </Text>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Limit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: responsivePadding(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: responsiveMargin(20),
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${BudgetColors.needs}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveMargin(12),
  },
  categoryIcon: {
    fontSize: scaleFontSize(24),
  },
  modalTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(4),
  },
  categoryName: {
    fontSize: scaleFontSize(16),
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: responsiveMargin(20),
  },
  inputLabel: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginBottom: responsiveMargin(8),
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 12,
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    fontSize: scaleFontSize(16),
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  helperText: {
    fontSize: scaleFontSize(12),
    color: "#888",
    marginTop: responsiveMargin(6),
    lineHeight: 16,
  },
  currentLimitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: responsivePadding(12),
    marginBottom: responsiveMargin(20),
  },
  currentLimitLabel: {
    fontSize: scaleFontSize(14),
    color: "#666",
    fontWeight: "500",
  },
  currentLimitAmount: {
    fontSize: scaleFontSize(14),
    color: BudgetColors.needs,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: responsiveMargin(8),
  },
  modalButton: {
    flex: 1,
    paddingVertical: responsivePadding(14),
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: responsiveMargin(6),
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  cancelButtonText: {
    fontSize: scaleFontSize(16),
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: BudgetColors.needs,
  },
  saveButtonText: {
    fontSize: scaleFontSize(16),
    color: "white",
    fontWeight: "600",
  },
});

export default CategoryLimitModal;