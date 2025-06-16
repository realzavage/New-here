import { useEffect, useState } from 'react';
import { Stack, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { Auth, onAuthStateChanged } from 'firebase/auth';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  useFrameworkReady();

  useEffect(() => {
    // Ensure Firebase Auth is initialized
    const unsubscribe = onAuthStateChanged(auth as Auth, () => {
      setIsReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D97706" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="buy-sell" options={{ headerShown: false }} />
          <Stack.Screen name="services" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="messages" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Slot />
        <StatusBar style="auto" />
      </View>
    </AuthProvider>
  );
}