// app/(auth)/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import useTheme from '@/hooks/useTheme';
import LoginScreen from './TEMPauthLogin';
import RegisterScreen from './TEMPauthRegister';

type Mode = 'login' | 'register';

export default function AuthIndex() {
  const [mode, setMode] = useState<Mode>('login');
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 16,
        paddingTop: 100,
        backgroundColor: colors.surface,
      }}
    >
      <View style={{ width: '100%' }}>
        <Text
          style={{
            fontSize: 58,
            fontWeight: '800',
            textAlign: 'center',
            color: colors.primary,
            marginBottom: 24,
          }}
        >
          Goaly
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '800',
            textAlign: 'center',
            color: colors.text,
            marginBottom: 124,
          }}
        >
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </Text>

        {/* Render the chosen form. Pass a switcher so each can flip modes */}
        {mode === 'login' ? (
          <LoginScreen onSwitchMode={() => setMode('register')} />
        ) : (
          <RegisterScreen onSwitchMode={() => setMode('login')} />
        )}

        {/* Optional footer toggle */}
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
