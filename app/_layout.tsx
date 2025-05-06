import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { selectIsFirstTimeUser } from "../redux/slices/expenseSlice";
import { selectIsAuthenticated } from "../redux/slices/userSlice";
import { persistor, store } from "../redux/store";
import { ThemeProvider } from "./components/ThemeProvider";
import { Colors } from "./constants/Colors";

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const isFirstTimeUser = useSelector(selectIsFirstTimeUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    const prepareAuth = setTimeout(() => {
      setIsReady(true);

      if (!isAuthenticated && !inAuthGroup) {
        router.replace("/(auth)/login");
      } else if (isAuthenticated && inAuthGroup) {
        if (isFirstTimeUser) {
          router.replace("/welcome");
        } else {
          router.replace("/(tabs)");
        }
      }
    }, 100);

    return () => clearTimeout(prepareAuth);
  }, [isAuthenticated, segments, router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.light.main} />
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
            <ActivityIndicator size="large" color={Colors.light.main} />
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
