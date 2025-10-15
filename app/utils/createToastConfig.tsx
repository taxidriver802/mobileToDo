// utils/createToastConfig.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Ionicons from '@expo/vector-icons/Ionicons';

type Colors = {
  bg: string;
  text: string;
  // add any others you use: primary, success, danger, etc.
};

export function createToastConfig(colors: Colors): ToastConfig {
  return {
    success: props => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: 'green', backgroundColor: colors.bg }}
        text1Style={{ fontSize: 16, fontWeight: '600', color: colors.text }}
        text2Style={{ fontSize: 14, color: colors.text }}
      />
    ),
    error: props => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: 'red', backgroundColor: colors.bg }}
        text1Style={{ fontSize: 14, fontWeight: '600', color: colors.text }}
        text2Style={{ fontSize: 10, color: colors.text }}
      />
    ),
    // --- upgraded custom toast ---
    customToast: ({ text1, text2, props }) => {
      // grab extras passed in showCustom
      const { icon, accentColor, avatarUrl } = props || {};

      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bg,
            borderRadius: 14,
            padding: 10,
            borderLeftWidth: 6,
            borderLeftColor: accentColor ?? colors.text,
            minHeight: 60,
          }}
        >
          {avatarUrl && (
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 8,
              }}
            />
          )}
          {icon && (
            <Ionicons
              name={icon}
              size={24}
              color={accentColor ?? colors.text}
              style={{ marginRight: 8 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              {text1}
            </Text>
            {text2 && (
              <Text style={{ color: colors.text, marginTop: 2 }}>{text2}</Text>
            )}
          </View>
        </View>
      );
    },
  };
}
