import useTheme from '@/hooks/useTheme';
import React from 'react';
import {
  Alert,
  Animated,
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
import { useTodos } from '../../context/TodoContextProvider';

import { createGoal, updateGoalResetCompletion } from '@/api/goals';

interface TodoMakerProps {
  setIsTodoOpen: (isOpen: boolean) => void;
  todoToEdit?: Todo | null;
  setSelectedTodo?: React.Dispatch<React.SetStateAction<Todo | null>>;
  isOpen: boolean;
  handleClose?: () => void;
}

const FloatingLabelInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
}) => {
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  return (
    <View style={[styles.input, { marginVertical: 12 }]}>
      {value.length > 0 && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={{ color: colors.text, fontSize: 16 }}>{label}</Text>
        </Animated.View>
      )}
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.text,
          borderRadius: 6,
          backgroundColor: colors.bg,
          paddingHorizontal: 10,
          paddingVertical: 6,
          marginVertical: multiline ? 12 : 0,
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.text + '99'}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          style={{
            color: colors.text,
            fontSize: 16,
            minHeight: multiline ? 75 : 32,
          }}
        />
      </View>
    </View>
  );
};

const goalToTodo = (g: {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
}) => ({
  id: g._id,
  title: g.title,
  description: g.description,
  completed: g.completed ?? false,
});

const TodoMaker = ({
  todoToEdit,
  handleClose,
  setSelectedTodo,
}: TodoMakerProps) => {
  const { colors } = useTheme();
  const { todos, setTodos } = useTodos();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (todoToEdit) {
      setTitle(todoToEdit.title);
      setDescription(todoToEdit.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [todoToEdit]);

  const handleSubmit = async () => {
    const hasTitle = !!title.trim();
    const hasDescription = !!description.trim();

    if (!hasTitle && !hasDescription) {
      Alert.alert(
        'Empty Todo',
        'Your todo is empty',
        [{ text: 'Close', style: 'cancel' }],
        {
          cancelable: true,
        }
      );
      return;
    }
    if (!hasTitle) {
      Alert.alert(
        'Empty Title',
        'Your todo needs a title',
        [{ text: 'Close', style: 'cancel' }],
        {
          cancelable: true,
        }
      );
      return;
    }

    try {
      setSubmitting(true);

      if (todoToEdit) {
        // UPDATE on server
        const updatedGoal = await updateGoalResetCompletion(todoToEdit.id, {
          title: title.trim(),
          description: description.trim(),
        });

        const updatedTodo = goalToTodo(updatedGoal);
        // update local state
        setTodos(prev =>
          prev.map(t => (t.id === todoToEdit.id ? updatedTodo : t))
        );
        setSelectedTodo?.(null);
      } else {
        // CREATE on server
        const createdGoal = await createGoal({
          title: title.trim(),
          description: description.trim(),
        });

        const newTodo = goalToTodo(createdGoal);
        setTodos(prev => [...prev, newTodo]); // append to local list
      }

      setTitle('');
      setDescription('');
      handleClose?.();
    } catch (err: any) {
      console.error('[TodoMaker.submit] error ->', err?.message || String(err));
      Alert.alert('Save failed', err?.message || 'Could not save goal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.modalOverlay}>
          <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {todoToEdit ? 'Edit goal' : 'Add a goal'}
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

            <View style={{ height: 395, justifyContent: 'space-between' }}>
              <View>
                <FloatingLabelInput
                  label="Title:"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Title:"
                />
                <FloatingLabelInput
                  label="Description:"
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description:"
                  multiline
                />
              </View>

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
