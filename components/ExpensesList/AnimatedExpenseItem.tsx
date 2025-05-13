import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ReanimatedSwipeable, { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";
import { useSelector } from "react-redux";
import { BudgetCategory, Expense } from "../../app/types/budget";
import { formatCurrency } from "../../app/utils/currency";
import { formatReadableDate } from "../../app/utils/dateUtils";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../../app/utils/responsive";
import { selectCurrency, selectDenominationFormat } from "../../redux/slices/budgetSlice";

interface AnimatedExpenseItemProps {
  item: Expense;
  index: number;
  getCategoryColor: (category: BudgetCategory) => string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const AnimatedExpenseItem: React.FC<AnimatedExpenseItemProps> = ({ item, index, getCategoryColor, onEdit, onDelete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const currency = useSelector(selectCurrency);
  const denominationFormat = useSelector(selectDenominationFormat);
  const swipeableRef = useRef<SwipeableMethods>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, index]);

  const handleEdit = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
    onEdit(item);
  };

  const handleDelete = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
    onDelete(item.id);
  };

  const renderRightActions = (progress: SharedValue<number>, dragX: SharedValue<number>, swipeableMethods: SwipeableMethods) => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const formattedDate = formatReadableDate(item.date);
  const categoryColor = getCategoryColor(item.category);

  return (
    <ReanimatedSwipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableOpacity style={styles.itemContainer} onPress={handleEdit} activeOpacity={0.7}>
          <View style={styles.leftContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.subtitleContainer}>
                <Text style={[styles.category, { color: categoryColor }]}>{item.subcategory}</Text>
                <Text style={styles.date}>{formattedDate}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.amount}>{formatCurrency(item.amount, currency, denominationFormat)}</Text>
        </TouchableOpacity>
      </Animated.View>
    </ReanimatedSwipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: responsiveMargin(10),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemContainer: {
    padding: responsivePadding(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveMargin(12),
  },
  icon: {
    fontSize: scaleFontSize(20),
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
    marginBottom: responsiveMargin(4),
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    marginRight: responsiveMargin(8),
  },
  date: {
    fontSize: scaleFontSize(12),
    color: "#888",
  },
  amount: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    width: 160,
    marginLeft: responsiveMargin(10),
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "60%",
    borderRadius: 12,
  },
  editButton: {
    backgroundColor: "#607D8B",
    marginRight: responsiveMargin(5),
  },
  deleteButton: {
    backgroundColor: "#FF5252",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: scaleFontSize(14),
  },
});

export default AnimatedExpenseItem;
