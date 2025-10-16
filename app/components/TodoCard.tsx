import useTheme from '@/hooks/useTheme';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useTodos } from '../../context/TodoContextProvider';
import type { Todo } from '../(tabs)/index';

interface TodoCardProps {
  todo: Todo;
  onToggleComplete?: () => Promise<void> | void;
}

export default function TodoCard({ todo, onToggleComplete }: TodoCardProps) {
  const { colors } = useTheme();
  const { toggleComplete, todos } = useTodos();

  const handleToggle = async () => {
    try {
      const maybePromise =
        onToggleComplete?.() ??
        toggleComplete(todo.id, !(todo.completed ?? false));
      await Promise.resolve(maybePromise);
    } catch (e: any) {
      Alert.alert('Update failed', e?.message ?? 'Could not update goal.');
    }
  };

  const areGoalsCompleted = todos.every(todo => todo.completed);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        opacity: areGoalsCompleted ? 0.75 : 1,
        borderRadius: 8,
        padding: 16,
        marginVertical: 6,
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ justifyContent: 'center' }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 4,
            paddingBottom: 4,
            borderBottomWidth: 2,
            borderColor: colors.border,
            width: 235,
          }}
        >
          {todo.title}
        </Text>
        {!!todo.description && (
          <Text
            style={{
              color: colors.text,
              opacity: 0.7,
              fontSize: 15,
              width: 235,
            }}
          >
            {todo.description}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleToggle}
        style={{
          alignSelf: 'flex-start',
          justifyContent: 'flex-end',
          marginTop: 10,
        }}
        disabled={areGoalsCompleted}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: todo.completed ? 'green' : colors.text,
            backgroundColor: todo.completed ? 'green' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {todo.completed && (
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#fff',
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}
