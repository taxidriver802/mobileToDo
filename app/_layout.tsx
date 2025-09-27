// app/_layout.tsx
import React, { useEffect } from 'react';
import { Href, Slot, useRouter, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from '../hooks/useTheme';
import { AuthProvider, useAuth } from '@/context/AuthContextProvider';
import { UserProvider } from '@/context/UserContextProvider';
import { View, ActivityIndicator } from 'react-native';
import { useRootNavigationState } from 'expo-router';


function Splash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}

function AuthGate() {
  const { isLogin, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const navState = useRootNavigationState();

  const AUTH_LOGIN: Href = '/(auth)/authIndex';
  const APP_ROOT: Href = '/(tabs)';

  useEffect(() => {
    if (!navState?.key || isLoading) return; // wait for router + auth
    const inAuthGroup = segments[0] === '(auth)';
    if (!isLogin && !inAuthGroup) router.replace(AUTH_LOGIN);
    else if (isLogin && inAuthGroup) router.replace(APP_ROOT);
  }, [navState?.key, isLogin, isLoading, segments]);

  if (isLoading) return <Splash />;

  // Always render current route; the effect above redirects if needed
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <ThemeProvider>
          <AuthGate />
          <Toast />
        </ThemeProvider>
      </UserProvider>
    </AuthProvider>
  );
}
