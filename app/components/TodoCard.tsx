import useTheme from '@/hooks/useTheme';
import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useTodos } from '../context/TodoContextProvider';

import type { Todo } from '../(tabs)/index';

interface TodoCardProps {
  todo: Todo;
}

export default function TodoCard({ todo }: TodoCardProps) {
  const { colors } = useTheme();
  const { setTodos } = useTodos();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const toggleComplete = (todo: { id: string; completed?: boolean }) => {
    // fade out before marking completed
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTodos(prev =>
        prev.map(t =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        )
      );
      // reset animation for when it re-renders as active again tomorrow

      setTimeout(() => {
        fadeAnim.setValue(1);
      }, 300);
    });
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        backgroundColor: colors.surface,
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
      }}
    >
      <View>
        <Text
          style={{
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 4,
            width: 225,
          }}
        >
          {todo.title}
        </Text>
        {todo.description && (
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
        onPress={() => toggleComplete(todo)}
        style={{
          alignSelf: 'flex-start',
          marginTop: 10,
          borderColor: todo.completed ? 'green' : colors.text,
          backgroundColor: todo.completed ? 'green' : 'transparent',
        }}
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
    </Animated.View>
  );
}
