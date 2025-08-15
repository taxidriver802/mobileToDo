import useTheme from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';

import { useTodos } from '../context/TodoContextProvider';

export default function Home() {
  const { colors } = useTheme();
  const { todos } = useTodos();

  const completedTodos = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? completedTodos / todos.length : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Home Screen</Text>
      <Text style={[styles.description, { color: colors.text }]}>
        This is your progress bar!
      </Text>
      <Text style={[styles.description, { color: colors.text }]}>
        ({completedTodos} / {todos.length})
      </Text>
      <ProgressBar
        progress={progress}
        color={colors.primary}
        style={{ width: 300, height: 10, borderRadius: 5 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});
