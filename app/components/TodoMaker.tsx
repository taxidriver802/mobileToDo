import useTheme from '@/hooks/useTheme';
import React from 'react';
import {
  Alert,
  Keyboard,
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

import { Freq } from '../(tabs)/index';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TodoMakerProps {
  setIsTodoOpen: (isOpen: boolean) => void;
  todoToEdit?: Todo | null;
  setSelectedTodo?: React.Dispatch<React.SetStateAction<Todo | null>>;
  isOpen: boolean;
  handleClose?: () => void;
}

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  required = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  maxLength?: number;
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={{ width: '100%', marginVertical: 12 }}>
      <Text style={{ color: colors.text, fontSize: 14, marginBottom: 6 }}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: focused ? colors.primary : colors.text,
          borderRadius: 6,
          backgroundColor: colors.surface,
          paddingHorizontal: 10,
          paddingVertical: multiline ? 8 : 6,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text + '99'}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          style={{
            color: colors.text,
            fontSize: 16,
            height: multiline ? 255 : 35,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
        />
      </View>
      {maxLength && (
        <Text
          style={{
            color: colors.text + '99',
            fontSize: 12,
            alignSelf: 'flex-end',
            marginTop: 4,
          }}
        >
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const goalToTodo = (g: {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  frequency: Freq;
}) => ({
  id: g._id,
  title: g.title,
  description: g.description,
  completed: g.completed ?? false,
  frequency: g.frequency,
});

const TodoMaker = ({
  todoToEdit,
  handleClose,
  setSelectedTodo,
}: TodoMakerProps) => {
  const { colors } = useTheme();
  const { setTodos } = useTodos();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [choice, setChoice] = React.useState<'daily' | 'weekly' | 'monthly'>(
    () => 'daily'
  );

  React.useEffect(() => {
    if (todoToEdit) {
      setTitle(todoToEdit.title);
      setDescription(todoToEdit.description);
      setChoice(todoToEdit.frequency);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [todoToEdit]);

  const handleSubmit = async () => {
    const hasTitle = !!title.trim();
    const hasDescription = !!description.trim();

    if (!hasTitle && !hasDescription) {
      Alert.alert('Empty Todo', 'Your todo is empty');
      return;
    }
    if (!hasTitle) {
      Alert.alert('Empty Title', 'Your todo needs a title');
      return;
    }

    try {
      setSubmitting(true);

      if (todoToEdit) {
        // UPDATE goal
        const updatedGoal = await updateGoalResetCompletion(todoToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          frequency: choice,
        });

        const updatedTodo = goalToTodo(updatedGoal);
        setTodos(prev =>
          prev.map(t => (t.id === todoToEdit.id ? updatedTodo : t))
        );
        setSelectedTodo?.(null);
      } else {
        // CREATE goal

        const createdGoal = await createGoal({
          title: title.trim(),
          description: description.trim(),
          frequency: choice,
        });

        const newTodo = goalToTodo(createdGoal);
        setTodos(prev => [newTodo, ...prev]);
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          marginHorizontal: 'auto',
          height: '100%',
          width: '100%',
        }}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.bg,
              height: '90%',
              marginTop: 100,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {todoToEdit ? 'Edit goal' : 'Add a goal'}
          </Text>

          <TouchableOpacity
            style={[
              {
                backgroundColor: colors.primary,
                position: 'absolute',
                top: -40,
                right: 13,
                width: 34,
                height: 27,
                padding: 0,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 7,
              },
            ]}
            onPress={handleClose}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              <Ionicons
                name="close"
                size={15}
                color={colors.surface}
                style={{ padding: 0 }}
              />
            </Text>
          </TouchableOpacity>

          <View style={{ height: '100%', justifyContent: 'space-between' }}>
            <View>
              <Field
                label="Title"
                value={title}
                onChangeText={setTitle}
                placeholder="E.g., Read 10 pages"
                required
                maxLength={50}
              />
              <Field
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Add more details..."
                multiline
                maxLength={250}
              />
            </View>
            <View>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 5,
                }}
              >
                Goal Frequency
              </Text>

              <View
                style={[
                  styles.segment,
                  {
                    borderColor: colors.textMuted,
                    backgroundColor: colors.surface,
                    marginBottom: 25,
                  },
                ]}
              >
                {(['daily', 'weekly', 'monthly'] as const).map(opt => {
                  const active = choice === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setChoice(opt)}
                      style={[
                        styles.segmentBtn,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: active ? colors.surface : colors.text,
                          fontWeight: active
                            ? ('700' as const)
                            : ('500' as const),
                          textTransform: 'capitalize',
                        }}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                    marginBottom: 50,
                    marginTop: 10,
                  },
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={[styles.buttonText, { color: colors.surface }]}>
                  {submitting ? 'Saving…' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    borderRadius: 8,
    margin: 10,
    marginBottom: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 3.84,
    height: 'auto',
  },
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
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 1,
    justifyContent: 'space-around',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 2,
  },
});

export default TodoMaker;
