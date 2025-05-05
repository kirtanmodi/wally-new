import { StyleSheet } from "react-native";
import { BudgetColors } from "../../app/constants/Colors";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../../app/utils/responsive";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: responsivePadding(16),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveMargin(16),
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.5,
  },
  monthButton: {
    paddingVertical: responsivePadding(8),
    paddingHorizontal: responsivePadding(12),
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  currentMonthContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  currentMonthText: {
    fontSize: scaleFontSize(16),
    fontWeight: "500",
    color: "#333",
  },
  calendarIcon: {
    fontSize: scaleFontSize(16),
    marginLeft: responsiveMargin(8),
    color: BudgetColors.wants,
  },
  categoriesContainer: {
    marginBottom: responsiveMargin(20),
  },
  categoryCirclesWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingVertical: responsivePadding(10),
  },
  tabsContainer: {
    marginBottom: responsiveMargin(16),
  },
  searchContainer: {
    marginBottom: responsiveMargin(16),
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
    fontSize: scaleFontSize(16),
    color: "#333",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  expensesList: {
    paddingBottom: responsiveMargin(80),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: responsiveMargin(50),
  },
  emptyText: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#888",
    marginBottom: responsiveMargin(8),
  },
  emptySubText: {
    fontSize: scaleFontSize(14),
    color: "#AAA",
    textAlign: "center",
    paddingHorizontal: responsivePadding(32),
  },
  addButton: {
    position: "absolute",
    bottom: responsiveMargin(24),
    right: responsiveMargin(24),
    elevation: 5,
    shadowColor: BudgetColors.needs,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 28,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonIcon: {
    fontSize: scaleFontSize(32),
    color: "#FFFFFF",
    lineHeight: 50,
  },
  datePickerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerHeader: {
    backgroundColor: "#FFFFFF",
    padding: responsivePadding(16),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  datePickerButton: {
    padding: responsivePadding(8),
    borderRadius: 8,
  },
  datePickerCancel: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#333",
  },
  datePickerDone: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: BudgetColors.wants,
  },
});

export default styles;
