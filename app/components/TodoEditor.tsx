import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Todo } from '../(tabs)/index';
import { useTodos } from '../../context/TodoContextProvider';

interface TodoEditorProps {
  isOpen: boolean;
  setIsEditOpen: (isOpen: boolean) => void;
  setIsTodoOpen: (isOpen: boolean) => void;
  setSelectedTodo: (todo: Todo | null) => void;
  handleClose?: () => void;
  filteredGoals: Todo[];
  filter: string;
}

const TodoEditor = ({
  setIsTodoOpen,
  setIsEditOpen,
  setSelectedTodo,
  handleClose,
  filteredGoals,
  filter,
}: TodoEditorProps) => {
  const { colors } = useTheme();
  const { removeTodo } = useTodos();

  const handleDeleteClick = (id: string) => {
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            await removeTodo(id);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditOpen(false);
    setIsTodoOpen(true);
  };

  const filterTitle =
    filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase();

  return (
    <Modal transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text
            style={[
              styles.title,
              { color: colors.text, alignSelf: 'center', marginBottom: 5 },
            ]}
          >
            {filterTitle} goals
          </Text>

          <TouchableOpacity
            style={[styles.close, { backgroundColor: colors.primary }]}
            onPress={handleClose}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              X
            </Text>
          </TouchableOpacity>

          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredGoals.map(todo => (
              <TouchableOpacity
                key={todo.id}
                style={styles.todoDelContainer}
                onPress={() => handleEdit(todo)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.title, { color: colors.text, maxWidth: 200 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
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
                    color={colors.primary}
                    style={{ color: colors.textMuted }}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
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
