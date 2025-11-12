// utils/createToastConfig.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import Ionicons from '@expo/vector-icons/Ionicons';

type Colors = {
  bg: string;
  text: string;
  surface: string;
  primary: string;
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

    // --- custom interactive toast ---
    customToast: ({ text1, text2, props }) => {
      const {
        icon,
        accentColor,
        avatarUrl,
        backgroundColorOpt = colors.surface,

        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm,
        onCancel,
      } = props || {};

      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: backgroundColorOpt,
            borderRadius: 14,
            padding: 12,
            borderLeftWidth: 6,
            borderLeftColor: accentColor ?? colors.text,
            minHeight: 64,
          }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                marginRight: 8,
              }}
            />
          ) : icon ? (
            <Ionicons
              name={icon}
              size={24}
              color={accentColor ?? colors.text}
              style={{ marginRight: 8 }}
            />
          ) : null}

          <View style={{ flex: 1 }}>
            {!!text1 && (
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {text1}
              </Text>
            )}
            {!!text2 && (
              <Text style={{ color: colors.text, marginTop: 2 }}>{text2}</Text>
            )}

            {/* Actions */}
            {(onConfirm || onCancel) && (
              <View
                style={{
                  marginTop: 10,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  gap: 16,
                }}
              >
                {!!onCancel && (
                  <TouchableOpacity
                    onPress={onCancel}
                    hitSlop={8}
                    accessibilityRole="button"
                    style={{ paddingRight: 135 }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 100,

                        backgroundColor: colors.surface,
                      }}
                    >
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                )}
                {!!onConfirm && (
                  <TouchableOpacity
                    onPress={onConfirm}
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Text
                      style={{
                        color: accentColor ?? colors.text,
                        fontWeight: '700',
                        paddingVertical: 6,
                        paddingRight: 40,
                      }}
                    >
                      {confirmText}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      );
    },
  };
}
