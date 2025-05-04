import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Counter from "./components/Counter";
import { hp, responsivePadding, scaleFontSize, wp } from "./utils/responsive";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Wally App</Text>
      <View style={styles.counterWrapper}>
        <Counter />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: responsivePadding(20),
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    marginBottom: hp("5%"),
    color: "#333",
  },
  counterWrapper: {
    width: wp("90%"),
    maxWidth: 400,
  },
});
