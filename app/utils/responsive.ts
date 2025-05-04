import { Dimensions } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Determine if device is a tablet (basic check)
const isTablet = () => {
  const aspectRatio = width / height;
  return width >= 768 && (aspectRatio > 1.0 || aspectRatio < 1.6);
};

// Determine if device is in landscape mode
const isLandscape = () => {
  return width > height;
};

// Font scaling function to ensure consistent text sizing
const scaleFontSize = (size: number) => {
  const scale = width / 375; // Base scale on iPhone 8/SE
  const newSize = size * scale;
  return Math.round(newSize);
};

// Responsive margin based on device type
const responsiveMargin = (value: number) => {
  return isTablet() ? value * 1.5 : value;
};

// Responsive padding based on device type
const responsivePadding = (value: number) => {
  return isTablet() ? value * 1.5 : value;
};

export { hp, isLandscape, isTablet, responsiveMargin, responsivePadding, scaleFontSize, height as screenHeight, width as screenWidth, wp };
