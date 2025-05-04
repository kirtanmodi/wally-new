import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { decrementCounter, incrementCounter, resetCounter, selectCounter } from "../redux/slices/appSlice";
import { responsiveMargin, responsivePadding, scaleFontSize, wp } from "../utils/responsive";

const Counter = () => {
  const count = useSelector(selectCounter) || 0;
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redux Persist Test</Text>
      <Text style={styles.counter}>{count}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.decrementButton]} onPress={() => dispatch(decrementCounter())}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={() => dispatch(resetCounter())}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.incrementButton]} onPress={() => dispatch(incrementCounter())}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Restart the app to test if the counter value persists!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: responsivePadding(15),
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: wp("2.5%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    marginBottom: responsiveMargin(20),
    color: "#333",
  },
  counter: {
    fontSize: scaleFontSize(48),
    fontWeight: "bold",
    marginBottom: responsiveMargin(20),
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: responsiveMargin(20),
  },
  button: {
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(20),
    borderRadius: wp("2%"),
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: responsiveMargin(8),
  },
  incrementButton: {
    backgroundColor: "#4CAF50",
  },
  decrementButton: {
    backgroundColor: "#F44336",
  },
  resetButton: {
    backgroundColor: "#9E9E9E",
  },
  buttonText: {
    color: "white",
    fontSize: scaleFontSize(18),
    fontWeight: "bold",
  },
  hint: {
    fontSize: scaleFontSize(14),
    color: "#757575",
    textAlign: "center",
    marginTop: responsiveMargin(10),
  },
});

export default Counter;
