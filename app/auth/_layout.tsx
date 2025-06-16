import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Slot } from 'expo-router';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
      </Stack>
      <Slot />
    </View>
  );
}