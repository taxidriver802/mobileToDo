import useTheme from '@/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useCallback, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ProgressBar } from 'react-native-paper';
import { useTodos } from '../context/TodoContextProvider';

export default function Home() {
  const { colors } = useTheme();
  const { todos, setTodos } = useTodos();

  const [progress, setProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const completedTodos = todos.filter(t => t.completed).length;
  const targetProgress = todos.length > 0 ? completedTodos / todos.length : 0;

  const motivationalMessages = [
    { threshold: 0.25, message: 'Great start! Keep going!' },
    { threshold: 0.5, message: "You're halfway there! Awesome!" },
    { threshold: 0.75, message: 'Almost done! Push through!' },
    { threshold: 1, message: 'You did it! Fantastic work!' },
  ];

  const currentMotivation =
    motivationalMessages.filter(m => targetProgress >= m.threshold).slice(-1)[0]
      ?.message || "Let's get started!";

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => setProgress(targetProgress), 300);

      setShowCelebration(targetProgress === 1);

      return () => {
        clearTimeout(timeout);
        setProgress(0);
        setShowCelebration(false);
      };
    }, [targetProgress])
  );

  const activeTodos = todos.filter(todo => !todo.completed);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text, marginTop: 45 }]}>
        Home Screen
      </Text>

      {todos.length > 0 ? (
        <>
          <Text
            style={[
              styles.description,
              styles.todayTitle,
              { color: colors.text },
            ]}
          >
            Today's Todos!
          </Text>

          {activeTodos.length > 0 ? (
            activeTodos.map(todo => (
              <View
                key={todo.id}
                style={[
                  styles.todoContainer,
                  {
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
                  },
                ]}
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
                  onPress={() =>
                    setTodos(prev =>
                      prev.map(t =>
                        t.id === todo.id ? { ...t, completed: !t.completed } : t
                      )
                    )
                  }
                  style={{
                    alignSelf: 'flex-start',
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
              </View>
            ))
          ) : (
            <View style={{ marginVertical: 20 }}>
              <Text style={[styles.description, { color: colors.text }]}>
                You've completed all of your todos today!
              </Text>
              <Text style={[styles.description, { color: colors.text }]}>
                Come back tomorrow to keep your streak strong!
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.description,
              { color: colors.text, marginTop: 'auto' },
            ]}
          >
            ({completedTodos} / {todos.length})
          </Text>

          <ProgressBar
            progress={progress}
            color={colors.primary}
            style={{
              width: 300,
              height: 10,
              borderRadius: 5,
              marginTop: 'auto',
            }}
          />

          <Text style={[styles.motivation, { color: colors.primary }]}>
            {currentMotivation}
          </Text>

          {Platform.OS !== 'web' && showCelebration && (
            <LottieView
              source={require('../../assets/Success.json')}
              autoPlay
              loop={false}
              style={{
                width: 200,
                height: 300,
                position: 'absolute',
                top: 300,
              }}
            />
          )}
        </>
      ) : (
        <Text
          style={[
            styles.content,
            { color: colors.text, opacity: 0.5, marginTop: 'auto' },
          ]}
        >
          Click <Text style={{ fontStyle: 'italic' }}>Todos</Text> to create
          your first todo
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  motivation: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  content: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  todayTitle: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
  },
  todoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
