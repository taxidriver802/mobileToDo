import useTheme from '@/hooks/useTheme';
import { nanoid } from 'nanoid/non-secure';
import React from 'react';
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import type { Todo } from '../(tabs)/index';

interface TodoMakerProps {
  setIsTodoOpen: (isOpen: boolean) => void;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  todoToEdit?: Todo;
}

const TodoMaker = ({ setIsTodoOpen, setTodos, todoToEdit }: TodoMakerProps) => {
  const { colors } = useTheme();
  const [title, setTitle] = React.useState(todoToEdit?.title || '');
  const [description, setDescription] = React.useState(
    todoToEdit?.description || ''
  );

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (todoToEdit) {
      setTodos(prev =>
        prev.map(t =>
          t.id === todoToEdit.id
            ? { ...t, title: title.trim(), description: description.trim() }
            : t
        )
      );
    } else {
      const newTodo: Todo = {
        title: title.trim(),
        description: description.trim(),
        id: nanoid(),
      };
      setTodos(prev => [...prev, newTodo]);
    }
    setTitle('');
    setDescription('');
    setIsTodoOpen(false);
  };

  return (
    <Modal transparent animationType="fade">
      {/* Outer overlay only dismisses keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.modalOverlay}>
          <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Add a todo
            </Text>

            <TouchableOpacity
              style={[styles.close, { backgroundColor: colors.primary }]}
              onPress={() => setIsTodoOpen(false)}
            >
              <Text style={[styles.buttonText, { color: colors.surface }]}>
                X
              </Text>
            </TouchableOpacity>

            {/* Title input */}
            <View style={[styles.input, { marginVertical: 12 }]}>
              {title.length > 0 && (
                <Text
                  style={{ color: colors.text, fontSize: 16, marginBottom: 6 }}
                >
                  Title:
                </Text>
              )}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.text,
                  borderRadius: 6,
                  backgroundColor: colors.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <TextInput
                  placeholder="Title:"
                  placeholderTextColor={colors.text + '99'}
                  value={title}
                  onChangeText={setTitle}
                  style={{ color: colors.text, fontSize: 16, minHeight: 32 }}
                />
              </View>
            </View>

            {/* Description input */}
            <View style={[styles.input, { marginVertical: 12 }]}>
              {description.length > 0 && (
                <Text style={{ color: colors.text, fontSize: 16 }}>
                  Description:
                </Text>
              )}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.text,
                  borderRadius: 6,
                  backgroundColor: colors.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginVertical: 12,
                }}
              >
                <TextInput
                  placeholder="Description:"
                  placeholderTextColor={colors.text + '99'}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  style={{ color: colors.text, fontSize: 16, minHeight: 75 }}
                />
              </View>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={[styles.buttonText, { color: colors.surface }]}>
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  input: { width: 250 },
  container: {
    padding: 25,
    borderRadius: 8,
    margin: 10,
    marginBottom: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 3.84,
    height: 475,
  },
  inputDesc: { maxHeight: 400 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  close: { width: 25, position: 'absolute', top: 5, right: 5, borderRadius: 7 },
});

export default TodoMaker;
