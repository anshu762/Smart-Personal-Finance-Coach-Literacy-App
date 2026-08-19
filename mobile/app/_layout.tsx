import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { Toast } from "@/components/ui/Toast";

import "../global.css";

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#0F172A" },
            headerTintColor: "#FFFFFF",
            contentStyle: { backgroundColor: "#0F172A" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="goal/[id]" options={{ title: "Goal" }} />
          <Stack.Screen name="article/[id]" options={{ title: "Article" }} />
        </Stack>
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}