import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { selectIsAuthenticated } from "../redux/slices/userSlice";
import { persistor, store } from "../redux/store";
import { ThemeProvider } from "./components/ThemeProvider";

// Auth context to handle authentication flow
function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Check if user is authenticated from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Handle auth state changes
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    // Set a small delay to ensure the store is hydrated
    const prepareAuth = setTimeout(() => {
      setIsReady(true);

      if (!isAuthenticated && !inAuthGroup) {
        // Redirect to the login page if not authenticated and not already in auth group
        router.replace("/(auth)/login");
      } else if (isAuthenticated && inAuthGroup) {
        // Redirect to main app if authenticated but still in auth group
        router.replace("/(tabs)");
      }
    }, 100);

    return () => clearTimeout(prepareAuth);
  }, [isAuthenticated, segments, router]);

  // Show loading indicator while determining auth state
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#32936F" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#32936F" />
          </View>
        }
        persistor={persistor}
      >
        <ThemeProvider>
          <AuthContextProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
