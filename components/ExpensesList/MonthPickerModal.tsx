import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BudgetColors } from "../../app/constants/Colors";
import { responsiveMargin, responsivePadding, scaleFontSize } from "../../app/utils/responsive";

interface MonthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onMonthSelect: (monthKey: string) => void;
  temporarySelectedDate: Date;
  setTemporarySelectedDate: (date: Date) => void;
  monthModalAnim: Animated.Value;
}

const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  visible,
  onClose,
  onMonthSelect,
  temporarySelectedDate,
  setTemporarySelectedDate,
  monthModalAnim,
}) => {
  if (!visible) return null;

  const handleDone = () => {
    // Apply the selected date
    const year = temporarySelectedDate.getFullYear();
    const month = temporarySelectedDate.getMonth() + 1;
    const newMonthKey = `${year}-${month}`;
    onMonthSelect(newMonthKey);
  };

  return (
    <Animated.View
      style={[
        styles.monthModalOverlay,
        {
          opacity: monthModalAnim,
        },
      ]}
    >
      <TouchableOpacity style={styles.monthModalBackdrop} onPress={onClose} activeOpacity={1}>
        <Animated.View
          style={[
            styles.monthModalContainer,
            {
              transform: [
                {
                  translateY: monthModalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.monthModalHeader}>
            <Text style={styles.monthModalTitle}>Select Month</Text>
            <TouchableOpacity onPress={onClose} style={styles.monthModalCloseButton}>
              <Text style={styles.monthModalCloseIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === "ios" ? (
            <View style={styles.monthPickerContainer}>
              <View style={styles.datePickerWrapper}>
                <DateTimePicker
                  testID="monthYearPicker"
                  value={temporarySelectedDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) {
                      // For iOS, we need to preserve the day while only changing month/year
                      const newDate = new Date(temporarySelectedDate);
                      newDate.setFullYear(date.getFullYear());
                      newDate.setMonth(date.getMonth());
                      setTemporarySelectedDate(newDate);
                    }
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(2020, 0, 1)}
                  textColor="#333"
                  themeVariant="light"
                  style={{ height: 180, width: 320 }}
                />
              </View>

              <TouchableOpacity style={styles.monthModalDoneButton} onPress={handleDone}>
                <Text style={styles.monthModalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Android implementation - create a simple month/year picker
            <View style={styles.androidMonthYearPickerContainer}>
              <View style={styles.androidPickerRow}>
                <TouchableOpacity
                  style={styles.androidPickerArrow}
                  onPress={() => {
                    const newDate = new Date(temporarySelectedDate);
                    newDate.setFullYear(temporarySelectedDate.getFullYear() - 1);
                    setTemporarySelectedDate(newDate);
                  }}
                >
                  <Text style={styles.androidPickerArrowText}>◀</Text>
                </TouchableOpacity>

                <Text style={styles.androidPickerYearText}>{temporarySelectedDate.getFullYear()}</Text>

                <TouchableOpacity
                  style={styles.androidPickerArrow}
                  onPress={() => {
                    const newDate = new Date(temporarySelectedDate);
                    newDate.setFullYear(temporarySelectedDate.getFullYear() + 1);
                    setTemporarySelectedDate(newDate);
                  }}
                >
                  <Text style={styles.androidPickerArrowText}>▶</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.androidMonthsGrid}>
                {Array.from({ length: 12 }, (_, i) => {
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const isSelected = temporarySelectedDate.getMonth() === i;

                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.androidMonthButton, isSelected && styles.androidMonthButtonSelected]}
                      onPress={() => {
                        const newDate = new Date(temporarySelectedDate);
                        newDate.setMonth(i);
                        setTemporarySelectedDate(newDate);
                      }}
                    >
                      <Text style={[styles.androidMonthButtonText, isSelected && styles.androidMonthButtonTextSelected]}>{monthNames[i]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.monthModalDoneButton} onPress={handleDone}>
                <Text style={styles.monthModalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  monthModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    justifyContent: "flex-end",
  },
  monthModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  monthModalContainer: {
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
  monthModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: responsivePadding(20),
    paddingBottom: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  monthModalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#333",
  },
  monthModalCloseButton: {
    padding: responsivePadding(8),
  },
  monthModalCloseIcon: {
    fontSize: scaleFontSize(18),
    color: "#999",
  },
  monthPickerContainer: {
    padding: responsivePadding(20),
    alignItems: "center",
    maxHeight: Platform.OS === "ios" ? 380 : "auto",
  },
  datePickerWrapper: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: Platform.OS === "ios" ? responsivePadding(8) : 0,
    overflow: "hidden",
  },
  monthModalDoneButton: {
    marginTop: responsivePadding(20),
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(30),
    backgroundColor: BudgetColors.wants,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthModalDoneButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  androidMonthYearPickerContainer: {
    padding: responsivePadding(20),
    alignItems: "center",
    width: "100%",
  },
  androidPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: responsiveMargin(20),
    width: "100%",
  },
  androidPickerArrow: {
    padding: responsivePadding(12),
  },
  androidPickerArrowText: {
    fontSize: scaleFontSize(18),
    color: BudgetColors.wants,
    fontWeight: "600",
  },
  androidPickerYearText: {
    fontSize: scaleFontSize(22),
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: responsivePadding(24),
  },
  androidMonthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
  },
  androidMonthButton: {
    width: "25%",
    padding: responsivePadding(12),
    margin: responsiveMargin(4),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  androidMonthButtonSelected: {
    backgroundColor: BudgetColors.wants,
  },
  androidMonthButtonText: {
    fontSize: scaleFontSize(16),
    color: "#333",
  },
  androidMonthButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default MonthPickerModal;
