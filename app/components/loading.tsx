import useTheme from '@/hooks/useTheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Loading() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ActivityIndicator size="large" color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
