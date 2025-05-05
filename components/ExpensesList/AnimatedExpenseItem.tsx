import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { BudgetCategory, Expense } from "../../app/types/budget";
import { formatCurrency } from "../../app/utils/currency";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../../app/utils/responsive";
import { selectCurrency } from "../../redux/slices/budgetSlice";

interface AnimatedExpenseItemProps {
  item: Expense;
  index: number;
  getCategoryColor: (category: BudgetCategory) => string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const AnimatedExpenseItem: React.FC<AnimatedExpenseItemProps> = ({ item, index, getCategoryColor, onEdit, onDelete }) => {
  // Handle date formatting whether it's a Date object or string
  const formattedDate = typeof item.date === "string" ? new Date(item.date).toLocaleDateString() : item.date.toLocaleDateString();

  const itemFade = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(20)).current;
  const currency = useSelector(selectCurrency);

  // Add states for swipe actions
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    // Staggered animation
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
  }, []);

  return (
    <Animated.View
      style={[
        styles.expenseItem,
        {
          opacity: itemFade,
          transform: [{ translateY: itemSlide }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} style={styles.expenseContentContainer} onPress={() => setShowActions(!showActions)}>
        <View style={[styles.expenseIcon, { backgroundColor: getCategoryColor(item.category) + "20" }]}>
          <Text style={[styles.iconText, { color: getCategoryColor(item.category) }]}>{item.icon}</Text>
        </View>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <View style={styles.expenseSubDetail}>
            <Text style={styles.expenseCategory}>{item.subcategory}</Text>
            <Text style={styles.expenseDate}>{formattedDate}</Text>
          </View>
        </View>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount, currency, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
      </TouchableOpacity>

      {showActions && (
        <View style={styles.expenseActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              setShowActions(false);
              onEdit(item);
            }}
          >
            <Text style={styles.actionButtonIcon}>✏️</Text>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              setShowActions(false);
              onDelete(item.id);
            }}
          >
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  expenseItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: responsiveMargin(12),
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: "hidden",
  },
  expenseContentContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: responsivePadding(16),
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  iconText: {
    fontSize: scaleFontSize(18),
  },
  expenseDetails: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
    marginBottom: responsiveMargin(4),
  },
  expenseSubDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseCategory: {
    fontSize: scaleFontSize(14),
    color: "#666",
    marginRight: responsiveMargin(8),
  },
  expenseDate: {
    fontSize: scaleFontSize(14),
    color: "#888",
  },
  expenseAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  expenseActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: responsivePadding(12),
    paddingBottom: responsivePadding(12),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsivePadding(6),
    paddingHorizontal: responsivePadding(10),
    borderRadius: 8,
    marginLeft: responsiveMargin(8),
  },
  editButton: {
    backgroundColor: "#F0F5FF",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
  },
  actionButtonIcon: {
    fontSize: scaleFontSize(14),
    marginRight: responsiveMargin(4),
  },
  actionButtonText: {
    fontSize: scaleFontSize(12),
    fontWeight: "600",
  },
});

export default AnimatedExpenseItem;
