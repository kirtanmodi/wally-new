import React, { useEffect, useRef } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../../app/constants/Colors";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../../app/utils/responsive";

interface MonthSelectorProps {
  months: { key: string; display: string }[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ months, selectedMonth, onSelectMonth }) => {
  // Create a flat list ref to programmatically scroll
  const scrollRef = useRef<FlatList>(null);

  // Find the current index of the selected month
  const currentIndex = months.findIndex((m) => m.key === selectedMonth);
  const validIndex = currentIndex >= 0 ? currentIndex : 0;

  // Scroll to selected month when component mounts or selection changes
  useEffect(() => {
    if (scrollRef.current && validIndex >= 0) {
      // Use a timeout to ensure the list has rendered
      setTimeout(() => {
        scrollRef.current?.scrollToIndex({
          index: validIndex,
          animated: true,
          viewPosition: 0.5, // Center the item
        });
      }, 100);
    }
  }, [validIndex]);

  // If no months available, don't render anything
  if (!months.length) return null;

  // Handle scroll error (when trying to scroll to an index that doesn't exist yet)
  const handleScrollToIndexFailed = () => {
    // This happens if the list hasn't fully rendered yet
    setTimeout(() => {
      if (scrollRef.current && validIndex >= 0) {
        scrollRef.current.scrollToIndex({
          index: Math.min(validIndex, months.length - 1),
          animated: false,
          viewPosition: 0.5,
        });
      }
    }, 200);
  };

  return (
    <View style={styles.monthSelectorContainer}>
      <FlatList
        ref={scrollRef}
        data={months}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.monthItem, item.key === selectedMonth && styles.monthItemSelected]}
            onPress={() => onSelectMonth(item.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.monthItemText, item.key === selectedMonth && styles.monthItemTextSelected]} numberOfLines={1}>
              {item.display}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.monthsList}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        initialScrollIndex={validIndex}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate width of each item
          offset: 120 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  monthSelectorContainer: {
    marginBottom: responsiveMargin(16),
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: responsivePadding(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  monthsList: {
    paddingHorizontal: responsivePadding(4),
  },
  monthItem: {
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(16),
    marginHorizontal: responsiveMargin(4),
    borderRadius: 16,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  monthItemSelected: {
    backgroundColor: "rgba(96, 91, 255, 0.08)",
  },
  monthItemText: {
    fontSize: scaleFontSize(14),
    fontWeight: "500",
    color: "#777",
  },
  monthItemTextSelected: {
    fontWeight: "600",
    color: BudgetColors.wants,
  },
});

export default MonthSelector;
