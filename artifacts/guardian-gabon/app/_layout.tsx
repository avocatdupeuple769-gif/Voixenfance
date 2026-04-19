import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="report"
        options={{
          title: "Signaler un abus",
          headerBackTitle: "Retour",
          headerStyle: { backgroundColor: "#1a3a6b" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" as const },
        }}
      />
      <Stack.Screen
        name="resources"
        options={{
          title: "Ressources & Aide",
          headerBackTitle: "Retour",
          headerStyle: { backgroundColor: "#1a3a6b" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" as const },
        }}
      />
      <Stack.Screen
        name="penal-code"
        options={{
          title: "Code Pénal",
          headerBackTitle: "Retour",
          headerStyle: { backgroundColor: "#1a3a6b" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" as const },
        }}
      />
      <Stack.Screen
        name="admin-login"
        options={{
          title: "Administrateur",
          headerBackTitle: "Retour",
          headerStyle: { backgroundColor: "#1a3a6b" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" as const },
        }}
      />
      <Stack.Screen
        name="privacy-policy"
        options={{
          title: "Confidentialité",
          headerBackTitle: "Retour",
          headerStyle: { backgroundColor: "#1a3a6b" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" as const },
        }}
      />
      <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
