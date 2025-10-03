import useTheme from '@/hooks/useTheme';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import { useTodos } from '../../context/TodoContextProvider';
import type { Todo } from '../(tabs)/index';

interface TodoCardProps {
  todo: Todo;
  /** Optional override: if provided, we'll call this instead of context.toggleComplete */
  onToggleComplete?: () => Promise<void> | void;
}

export default function TodoCard({ todo, onToggleComplete }: TodoCardProps) {
  const { colors } = useTheme();
  const { toggleComplete } = useTodos(); // <-- use provider, not setTodos
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleToggle = () => {
    // Fade out first for a snappy UI
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      try {
        // Use the prop if provided (e.g., Home passes its own), otherwise call context
        const maybePromise =
          onToggleComplete?.() ??
          toggleComplete(todo.id, !(todo.completed ?? false));
        await Promise.resolve(maybePromise);
      } catch (e: any) {
        // On error, bring it back and notify
        if (mountedRef.current) fadeAnim.setValue(1);
        Alert.alert('Update failed', e?.message ?? 'Could not update goal.');
        return;
      }

      // If this card is still on screen (e.g., on a list that keeps completed items),
      // reset opacity to 1 so it’s visible. If it was removed (active list), this is a no-op.
      if (mountedRef.current) fadeAnim.setValue(1);
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
