import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { selectIsAuthenticated } from "../redux/slices/userSlice";
import { persistor, store } from "../redux/store";

// Auth context to handle authentication flow
function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();

  // Check if user is authenticated from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Handle auth state changes
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated and not already in auth group
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated but still in auth group
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
      </PersistGate>
    </Provider>
  );
}
