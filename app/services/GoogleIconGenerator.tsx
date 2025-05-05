import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface GoogleIconProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * A programmatically generated Google G logo.
 * This serves as a replacement for an image asset.
 */
export const GoogleIcon: React.FC<GoogleIconProps> = ({ size = 24, style }) => {
  const circleSize = size;
  const innerCircleSize = size * 0.68;

  return (
    <View style={[styles.container, { width: circleSize, height: circleSize }, style]}>
      {/* Outer white circle */}
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: "white",
          },
        ]}
      >
        {/* Blue section */}
        <View
          style={[
            styles.colorSection,
            {
              width: circleSize * 0.55,
              height: circleSize * 0.27,
              top: 0,
              right: 0,
              borderTopRightRadius: circleSize / 2,
              backgroundColor: "#4285F4",
            },
          ]}
        />

        {/* Green section */}
        <View
          style={[
            styles.colorSection,
            {
              width: circleSize * 0.37,
              height: circleSize * 0.5,
              bottom: 0,
              right: 0,
              borderBottomRightRadius: circleSize / 2,
              backgroundColor: "#34A853",
            },
          ]}
        />

        {/* Yellow section */}
        <View
          style={[
            styles.colorSection,
            {
              width: circleSize * 0.4,
              height: circleSize * 0.37,
              bottom: 0,
              left: circleSize * 0.27,
              borderBottomLeftRadius: circleSize / 2,
              backgroundColor: "#FBBC05",
            },
          ]}
        />

        {/* Red section */}
        <View
          style={[
            styles.colorSection,
            {
              width: circleSize * 0.45,
              height: circleSize * 0.5,
              top: 0,
              left: 0,
              borderTopLeftRadius: circleSize / 2,
              backgroundColor: "#EA4335",
            },
          ]}
        />

        {/* Inner white circle */}
        <View
          style={[
            styles.innerCircle,
            {
              width: innerCircleSize,
              height: innerCircleSize,
              borderRadius: innerCircleSize / 2,
              top: (circleSize - innerCircleSize) / 2,
              left: (circleSize - innerCircleSize) / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    position: "relative",
    overflow: "hidden",
  },
  colorSection: {
    position: "absolute",
  },
  innerCircle: {
    position: "absolute",
    backgroundColor: "white",
  },
});

export default GoogleIcon;
