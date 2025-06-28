import { ClerkProvider, useClerk } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { selectIsFirstTimeUser, selectOnboarded } from "../redux/slices/expenseSlice";
import { selectIsAuthenticated } from "../redux/slices/userSlice";
import { selectMonthlyIncome } from "../redux/slices/budgetSlice";
import { persistor, store } from "../redux/store";
import { ThemeProvider } from "./components/ThemeProvider";
import { Colors } from "./constants/Colors";
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { signOut } = useClerk();
  signOut();

  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const onboarded = useSelector(selectOnboarded);
  const monthlyIncome = useSelector(selectMonthlyIncome);

  useEffect(() => {
    const prepareAuth = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/(auth)/login");
      } else if (isAuthenticated && isFirstTimeUser && !onboarded) {
        // New user who hasn't completed onboarding
        router.replace("/(onboarding)/step1");
      } else if (isAuthenticated && onboarded && monthlyIncome === 0) {
        // User completed onboarding but no income set, go to settings
        router.replace("/(tabs)/settings");
      } else if (isAuthenticated && !isFirstTimeUser) {
        // Returning user, go to main app
        router.replace("/(tabs)");
      }
    }, 100);

    return () => clearTimeout(prepareAuth);
  }, [isAuthenticated, router, isFirstTimeUser, onboarded, monthlyIncome]);

  return <>{children}</>;
}

export default function RootLayout() {
  useFrameworkReady();
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <PersistGate
          loading={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.light.main} />
            </View>
          }
          persistor={persistor}
        >
          <ThemeProvider>
            <ClerkProvider tokenCache={tokenCache}>
              <AuthContextProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(modals)/add-expense"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/edit-expense"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/notifications"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                    }}
                  />
                  <Stack.Screen
                    name="(modals)/privacy"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                    }}
                  />
                  <Stack.Screen
                    name="(details)"
                    options={{
                      headerShown: false,
                      animation: "slide_from_right",
                    }}
                  />
                  <Stack.Screen name="welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </AuthContextProvider>
            </ClerkProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});