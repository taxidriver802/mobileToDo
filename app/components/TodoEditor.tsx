import useTheme from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Todo } from '../(tabs)/index';

interface TodoEditorProps {
  setIsEditOpen: (isOpen: boolean) => void;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  todos: Todo[];
}

const TodoEditor = ({ setIsEditOpen, setTodos, todos }: TodoEditorProps) => {
  const { colors } = useTheme();

  const handleDelete = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <View style={[styles.background, { backgroundColor: colors.bg }]}>
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <Text
          style={[
            styles.title,
            { color: colors.text },
            { alignSelf: 'center' },
            { marginBottom: 5 },
          ]}
        >
          Delete a todo
        </Text>

        <TouchableOpacity
          style={[styles.close, { backgroundColor: colors.primary }]}
          onPress={() => setIsEditOpen(false)}
        >
          <Text style={[styles.buttonText, { color: colors.surface }]}>X</Text>
        </TouchableOpacity>
        {todos.map(todo => (
          <View key={todo.id} style={[styles.todoDelContainer]}>
            <Text style={[styles.title]}>{todo.title}</Text>
            <TouchableOpacity onPress={() => handleDelete(todo.id)}>
              <Text style={{ color: 'red' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    color: 'white',
  },
  description: {
    fontSize: 16,
    marginVertical: 10,
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  close: {
    width: 25,
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 7,
  },
  todoDelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    padding: 5,
  },
});

export default TodoEditor;
