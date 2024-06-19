import { Stack } from "expo-router";
import React from "react";
import { UserInactivityProvider } from "../context/UserInactivity";

export default function Layout() {
  return (
    <UserInactivityProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(menu)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)/white" options={{ animation: 'none' }} />
        <Stack.Screen name="(modals)/setlock" options={{ animation: 'none' }} />
        <Stack.Screen name="(modals)/lock" options={{ animation: 'none' }} />
        <Stack.Screen name="LocationDetails" options={{ headerShown: true, title: 'Детали местности' }} />
        <Stack.Screen name="PaymentWebView" options={{ headerShown: true, title: 'Оплата' }} />
      </Stack>
    </UserInactivityProvider>
  );
}