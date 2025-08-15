import useTheme from '@/hooks/useTheme';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from 'react-native-paper';

import { useTodos } from '../context/TodoContextProvider';

export default function Home() {
  const { colors } = useTheme();
  const { todos } = useTodos();

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

  // Animate progress when screen is focused
  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => setProgress(targetProgress), 300);

      if (targetProgress === 1) {
        setShowCelebration(true);
      } else {
        setShowCelebration(false);
      }

      return () => {
        clearTimeout(timeout);
        setProgress(0);
        setShowCelebration(false);
      };
    }, [targetProgress])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text, marginTop: 45 }]}>
        Home Screen
      </Text>
      <Text style={[styles.description, { color: colors.text }]}>
        This is your progress bar!
      </Text>
      <Text style={[styles.description, { color: colors.text }]}>
        ({completedTodos} / {todos.length})
      </Text>
      <ProgressBar
        progress={progress}
        color={colors.primary}
        style={{ width: 300, height: 10, borderRadius: 5 }}
      />
      <Text style={[styles.motivation, { color: colors.primary }]}>
        {currentMotivation}
      </Text>
      {Platform.OS !== 'web' && showCelebration && (
        <LottieView
          source={require('../../assets/Success.json')}
          autoPlay
          loop={false}
          style={{ width: 200, height: 300, position: 'absolute', top: 430 }}
        />
      )}
      {todos.length === 0 && (
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
});
