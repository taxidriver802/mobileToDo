import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Todo } from '../(tabs)/index';
import TodoMaker from './TodoMaker';

interface TodoEditorProps {
  setIsEditOpen: (isOpen: boolean) => void;
  setIsTodoOpen: (isOpen: boolean) => void;
  isTodoOpen: boolean;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  todos: Todo[];
}

const TodoEditor = ({
  setIsTodoOpen,
  setIsEditOpen,
  isTodoOpen,
  setTodos,
  todos,
}: TodoEditorProps) => {
  const { colors } = useTheme();
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);

  const handleDelete = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteClick = (id: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => handleDelete(id) },
      ],
      { cancelable: true }
    );
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsTodoOpen(true);
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.modalOverlay}>
        {/* Inner container */}
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.title,
              { color: colors.text, alignSelf: 'center', marginBottom: 5 },
            ]}
          >
            Delete a todo
          </Text>

          <TouchableOpacity
            style={[styles.close, { backgroundColor: colors.primary }]}
            onPress={() => setIsEditOpen(false)}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              X
            </Text>
          </TouchableOpacity>

          {todos.map(todo => (
            <TouchableOpacity
              key={todo.id}
              style={styles.todoDelContainer}
              onPress={() => handleEdit(todo)}
              activeOpacity={0.7}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                {todo.title}
              </Text>

              <TouchableOpacity
                onPress={() => handleDeleteClick(todo.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={colors.text}
                  opacity={0.25}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Open the TodoMaker if a todo is selected */}
      {isTodoOpen && selectedTodo && (
        <TodoMaker
          setIsTodoOpen={setIsTodoOpen}
          setTodos={setTodos}
          todoToEdit={selectedTodo}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    padding: 20,
    borderRadius: 8,
    margin: 10,
    marginBottom: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 3.84,
    height: 475,
    width: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
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
    borderColor: 'rgba(131, 131, 131, 0.4)',
    borderRadius: 10,
    padding: 5,
  },
});

export default TodoEditor;
