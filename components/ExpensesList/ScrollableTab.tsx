import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../../app/constants/Colors";
import { responsivePadding, scaleFontSize } from "../../app/utils/responsive";

interface ScrollableTabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ScrollableTab: React.FC<ScrollableTabProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.scrollableTabs}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => onTabChange(tab)} activeOpacity={0.7}>
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollableTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: responsivePadding(4),
  },
  tab: {
    flex: 1,
    paddingVertical: responsivePadding(10),
    alignItems: "center",
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: "#F0F5FF",
  },
  tabText: {
    fontSize: scaleFontSize(14),
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: BudgetColors.wants,
    fontWeight: "600",
  },
});

export default ScrollableTab;
