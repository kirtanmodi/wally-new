import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scaleFontSize } from "../app/utils/responsive";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const { width } = Dimensions.get("window");

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Main content animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setActiveSlide(currentIndex);
  };

  const goToSlide = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };

  const carouselSlides = [
    {
      title: "Track Your Expenses",
      description: "Easily record and categorize your daily spending to understand where your money goes.",
      image: require("../assets/images/wally_logo.png"),
    },
    {
      title: "Set Your Income",
      description: "Enter your monthly income and let Wally help you allocate funds following the 50-30-20 rule.",
      image: require("../assets/images/wally_logo.png"),
    },
    {
      title: "Achieve Savings Goals",
      description: "Create and track your savings goals for important purchases or future security.",
      image: require("../assets/images/wally_logo.png"),
    },
  ];

  const renderDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {carouselSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.paginationDot, activeSlide === index && styles.paginationDotActive]}
            onPress={() => goToSlide(index)}
          />
        ))}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#7FAFF5", "#7FAFF5"]} style={styles.container}>
      {/* <View style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Image source={require("../assets/images/wally_logo.png")} style={styles.logoImage} />
        </Animated.View>
      </View> */}

      <Animated.View
        style={[
          styles.carouselContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {carouselSlides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <View style={styles.slideImageContainer}>
                <Image source={slide.image} style={styles.slideImage} />
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          ))}
        </ScrollView>
        {renderDots()}
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: scaleFontSize(32),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  slideImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  slideImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  slideTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  slideDescription: {
    fontSize: scaleFontSize(16),
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 6,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  getStartedButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  getStartedText: {
    color: "#5B6EF5",
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;
