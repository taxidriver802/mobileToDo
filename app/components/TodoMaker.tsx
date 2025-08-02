import useTheme from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TodoMaker = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.background, { backgroundColor: colors.bg }]}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Create a todo
        </Text>
        <Text style={[styles.description, { color: colors.text }]}>
          This is where you can add a new todo item.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
  },
  container: {
    padding: 20,
    borderRadius: 8,
    margin: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TodoMaker;
