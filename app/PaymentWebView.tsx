import React from 'react';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

export default function PaymentWebView() {
  const { url } = useLocalSearchParams();

  return <WebView source={{ uri: url }} />;
}