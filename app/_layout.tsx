import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../hooks/useTheme';
import { AuthProvider } from '@/context/AuthContextProvider';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TabsWrapper" />
        </Stack>
        <Toast />
      </ThemeProvider>
    </AuthProvider>
  );
}
