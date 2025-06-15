import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import OnboardingStep from "../../components/OnboardingStep";
import { scaleFontSize, responsivePadding } from "../utils/responsive";
import {
  AVAILABLE_CURRENCIES,
  CurrencyInfo,
  selectCurrency,
  selectMonthlyIncome,
  setCurrency,
  setMonthlyIncome,
} from "../../redux/slices/budgetSlice";

export default function OnboardingStep2() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const currentIncome = useSelector(selectMonthlyIncome);
  const currentCurrency = useSelector(selectCurrency);
  
  const [income, setIncome] = useState(currentIncome.toString());
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo>(currentCurrency);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [inputError, setInputError] = useState("");

  const validateInput = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setInputError("Please enter a valid income amount");
      return false;
    }
    if (numValue > 10000000) {
      setInputError("Income amount seems too high");
      return false;
    }
    setInputError("");
    return true;
  };

  const handleIncomeChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      return;
    }
    
    setIncome(cleanValue);
    
    if (cleanValue) {
      validateInput(cleanValue);
    } else {
      setInputError("");
    }
  };

  const handleNext = () => {
    const numValue = parseFloat(income);
    if (validateInput(income)) {
      dispatch(setMonthlyIncome(numValue));
      dispatch(setCurrency(selectedCurrency));
      router.push("/(onboarding)/step3");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCurrencySelect = (currency: CurrencyInfo) => {
    setSelectedCurrency(currency);
    setShowCurrencyPicker(false);
  };

  const isValidInput = income.trim() !== "" && !inputError;

  const renderCurrencyPicker = () => (
    <View style={styles.currencyPickerContainer}>
      <Text style={styles.currencyPickerTitle}>Select Currency</Text>
      <ScrollView style={styles.currencyList} nestedScrollEnabled={true}>
        {AVAILABLE_CURRENCIES.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyItem,
              selectedCurrency.code === currency.code && styles.currencyItemSelected,
            ]}
            onPress={() => handleCurrencySelect(currency)}
            activeOpacity={0.7}
          >
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{currency.code}</Text>
              <Text style={styles.currencyName}>{currency.name}</Text>
            </View>
            {selectedCurrency.code === currency.code && (
              <Text style={styles.checkMark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <OnboardingStep
      title="Set Your Monthly Income"
      subtitle="This helps us calculate your budget allocation"
      currentStep={2}
      totalSteps={5}
      onNext={handleNext}
      onBack={handleBack}
      nextButtonText="Continue"
      nextButtonDisabled={!isValidInput}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.incomeSection}>
          <Text style={styles.incomeLabel}>Monthly Income</Text>
          <Text style={styles.incomeHint}>
            Enter your total monthly income after taxes
          </Text>

          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.currencyButton}
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              activeOpacity={0.7}
            >
              <Text style={styles.currencyButtonText}>
                {selectedCurrency.symbol} {selectedCurrency.code}
              </Text>
              <Text style={styles.currencyDropdownIcon}>
                {showCurrencyPicker ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.incomeInput, inputError && styles.incomeInputError]}
              value={income}
              onChangeText={handleIncomeChange}
              placeholder="0"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="numeric"
              returnKeyType="done"
              autoFocus={true}
            />
          </View>

          {inputError ? (
            <Text style={styles.errorText}>{inputError}</Text>
          ) : null}

          {showCurrencyPicker && renderCurrencyPicker()}
        </View>

        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Why we need this:</Text>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleIcon}>🎯</Text>
            <Text style={styles.exampleText}>
              Calculate optimal budget allocation using the 50/30/20 rule
            </Text>
          </View>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleIcon}>📊</Text>
            <Text style={styles.exampleText}>
              Track your spending against your income to prevent overspending
            </Text>
          </View>
          <View style={styles.exampleItem}>
            <Text style={styles.exampleIcon}>💡</Text>
            <Text style={styles.exampleText}>
              Get personalized insights and recommendations for your financial goals
            </Text>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 Your financial information is stored securely on your device and never shared
          </Text>
        </View>
      </ScrollView>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  incomeSection: {
    marginBottom: responsivePadding(30),
  },
  incomeLabel: {
    fontSize: scaleFontSize(20),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  incomeHint: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.3)",
  },
  currencyButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
  currencyDropdownIcon: {
    fontSize: scaleFontSize(12),
    color: "#FFFFFF",
    opacity: 0.7,
  },
  incomeInput: {
    flex: 1,
    fontSize: scaleFontSize(24),
    fontWeight: "600",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 20,
    textAlign: "right",
  },
  incomeInputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    fontSize: scaleFontSize(14),
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 10,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  currencyPickerContainer: {
    marginTop: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    maxHeight: 200,
  },
  currencyPickerTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  currencyList: {
    maxHeight: 150,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  currencyItemSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  currencySymbol: {
    fontSize: scaleFontSize(18),
    fontWeight: "600",
    color: "#FFFFFF",
    width: 30,
    textAlign: "center",
  },
  currencyInfo: {
    flex: 1,
    marginLeft: 10,
  },
  currencyCode: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  currencyName: {
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.8,
  },
  checkMark: {
    fontSize: scaleFontSize(16),
    color: "#4ECDC4",
    fontWeight: "bold",
  },
  examplesSection: {
    marginBottom: responsivePadding(20),
  },
  examplesTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 15,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  exampleIcon: {
    fontSize: scaleFontSize(18),
    marginRight: 12,
    marginTop: 2,
  },
  exampleText: {
    flex: 1,
    fontSize: scaleFontSize(14),
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
  },
  privacyNote: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  privacyText: {
    fontSize: scaleFontSize(12),
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 18,
  },
});