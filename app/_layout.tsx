// app/_layout.tsx
import React, { useEffect, useMemo } from 'react';
import {
  Href,
  Slot,
  useRouter,
  useSegments,
  useRootNavigationState,
} from 'expo-router';
import Toast from 'react-native-toast-message';
import { View, ActivityIndicator } from 'react-native';

import { ThemeProvider } from '@/hooks/useTheme';
import useTheme from '@/hooks/useTheme';
import { AuthProvider, useAuth } from '@/context/AuthContextProvider';
import { UserProvider } from '@/context/UserContextProvider';

import { createToastConfig } from '../utils/createToastConfig';

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
    if (!navState?.key || isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isLogin && !inAuthGroup) router.replace(AUTH_LOGIN);
    else if (isLogin && inAuthGroup) router.replace(APP_ROOT);
  }, [navState?.key, isLogin, isLoading, segments]);

  if (isLoading) return <Splash />;
  return <Slot />;
}

/** Child under ThemeProvider so it can read theme safely */
function ThemedToastMount() {
  const { colors } = useTheme();
  const toastConfig = useMemo(() => createToastConfig(colors), [colors]);
  return <Toast config={toastConfig} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <AuthGate />
          <ThemedToastMount />
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
