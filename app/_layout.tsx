import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { Stack, router, useNavigation } from 'expo-router';

export default function Layout() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = (event) => {
      try {
        const { url } = event;
        if (url) {
          const parsedUrl = new URL(url);
          const { protocol, hostname } = parsedUrl;
          if (protocol === 'spinexapp:') {
            if (hostname === 'callback') {
              router.push('rentmap'); // Navigate to 'rentmap' screen
            } else if (hostname === 'home') {
              router.push('(menu)'); // Navigate to '(menu)' screen
            }
          }
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    const setupDeepLinking = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink({ url: initialUrl });
        }
        Linking.addEventListener('url', handleDeepLink);
      } catch (error) {
        console.error('Error setting up deep linking:', error);
      }
    };

    setupDeepLinking();

    return () => {
      Linking.removeAllListeners('url');
    };
  }, [navigation]);

  return (
    <Stack>
      {/* Define your screens here */}
      <Stack.Screen name="(menu)" options={{ headerShown: false }} />
      <Stack.Screen name="LocationDetails" options={{ headerShown: true, title: 'Детали местности' }} />
      <Stack.Screen name="PaymentWebView" options={{ headerShown: true, title: 'Оплата' }} />
      <Stack.Screen name="rentmap" options={{ animation: 'none', headerShown: false }} />
    </Stack>
  );
}