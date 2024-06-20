import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { Stack, useNavigation } from 'expo-router';

import { UserInactivityProvider } from '../context/UserInactivity';

export default function Layout() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const { url } = event;

      if (url && url.startsWith('spinexapp://callback')) {
        navigation.navigate('rentmap'); // Navigate to 'rentmap' screen
      }
    };

    const setupDeepLinking = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl && initialUrl.startsWith('spinexapp://callback')) {
          handleDeepLink({ url: initialUrl });
        }

        Linking.addEventListener('url', handleDeepLink);
      } catch (error) {
        console.error('Error setting up deep linking:', error);
      }
    };

    setupDeepLinking();

    return () => {
      Linking.removeEventListener('url', handleDeepLink); // Cleanup by removing event listener
    };
  }, [navigation]);

  return (
    <UserInactivityProvider>
      <Stack>
        {/* Define your screens here */}
        <Stack.Screen name="(menu)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)/white" options={{ animation: 'none' }} />
        <Stack.Screen name="(modals)/setlock" options={{ animation: 'none' }} />
        <Stack.Screen name="(modals)/lock" options={{ animation: 'none' }} />
        <Stack.Screen name="LocationDetails" options={{ headerShown: true, title: 'Детали местности' }} />
        <Stack.Screen name="PaymentWebView" options={{ headerShown: true, title: 'Оплата' }} />
        <Stack.Screen name="rentmap" options={{ animation: 'none', headerShown: false }} />
      </Stack>
    </UserInactivityProvider>
  );
}