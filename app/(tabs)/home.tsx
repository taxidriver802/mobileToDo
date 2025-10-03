import useTheme from '@/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useTodos } from '../../context/TodoContextProvider';

import TodoCard from '../components/TodoCard';
import { motivationalMessages } from '@/utils/utils';

export default function Home() {
  const { colors } = useTheme();
  const { todos, toggleComplete } = useTodos();

  // Derived todo metrics (kept above the conditional so hooks order is stable)
  const completedTodos = todos.filter(t => t.completed).length;
  const totalTodos = todos.length;
  const isAllCompleted = totalTodos > 0 && completedTodos === totalTodos;
  const targetProgress = totalTodos > 0 ? completedTodos / totalTodos : 0;

  // UI state hooks (always declared so hook order doesn't change)
  const [progress, setProgress] = useState(targetProgress);
  const [showCelebration, setShowCelebration] = useState(isAllCompleted);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const currentMotivation = (() => {
    const passedThresholds = motivationalMessages.filter(
      m => targetProgress >= m.threshold
    );
    const currentThreshold = passedThresholds.slice(-1)[0];

    if (!currentThreshold) return "Let's get started!";
    const { messages } = currentThreshold;
    return messages[Math.floor(Math.random() * messages.length)];
  })();

  useFocusEffect(
    useCallback(() => {
      // Animate the progress bar
      setProgress(targetProgress);

      // Decide whether to show the celebration
      if (isAllCompleted) {
        setShowCelebration(true);
        setCelebrationKey(prevKey => prevKey + 1);
      } else {
        setShowCelebration(false);
      }
    }, [targetProgress, isAllCompleted])
  );

  const activeTodos = todos.filter(todo => !todo.completed);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {totalTodos === 0 && (
        <>
          <Text
            style={[
              styles.title,
              styles.todayTitle,
              { color: colors.text, marginBottom: 0, marginTop: 45 },
            ]}
          >
            Set goals for today
          </Text>
        </>
      )}
      {totalTodos > 0 ? (
        <>
          <Text
            style={[
              styles.title,
              styles.todayTitle,
              { color: colors.text, marginBottom: 0, marginTop: 45 },
            ]}
          >
            Today's goals
          </Text>

          {activeTodos.length > 0 ? (
            <View style={[styles.todosWrapper, { marginTop: 50 }]}>
              <ScrollView
                style={styles.todosScrollView}
                showsVerticalScrollIndicator={false}
              >
                {activeTodos.map(todo => (
                  <TodoCard key={todo.id} todo={todo} onToggleComplete={() => toggleComplete(todo.id, !todo.completed)}/>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={{ marginVertical: 150 }}>
              <Text style={[styles.description, { color: colors.text }]}>
                You've completed all of your goals today!
              </Text>
              <Text
                style={[
                  styles.description,
                  { color: colors.text, marginVertical: 75 },
                ]}
              >
                Come back tomorrow to keep your streak strong!
              </Text>
            </View>
          )}

          <View style={{ marginTop: 'auto' }}>
            <ProgressBar
              progress={progress}
              color={colors.primary}
              style={{
                width: 300,
                height: 10,
                borderRadius: 5,
              }}
            />
          </View>
          <Text style={[styles.motivation, { color: colors.primary }]}>
            {currentMotivation}
          </Text>

          {Platform.OS !== 'web' && showCelebration && (
            <LottieView
              key={celebrationKey}
              source={require('../../assets/Success.json')}
              autoPlay
              loop={false}
              style={{
                width: 200,
                height: 300,
                position: 'absolute',
                top: 430,
                zIndex: 1,
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
          Press <Text style={{ fontStyle: 'italic' }}>Goals</Text> to create
          {'\n'}
          your first daily goal
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
    fontSize: 20,
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
  todosWrapper: {
    height: 500,
    width: 300,
  },
  todosScrollView: {
    flex: 1,
  },
});
