import React, { useCallback } from 'react';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import useTheme from '@/hooks/useTheme';
import { ProgressBar } from 'react-native-paper';
import { useTodos } from '@/context/TodoContextProvider';
import { motivationalMessages } from '../../utils/utils';
import { useFocusEffect } from 'expo-router';
import HomeComponentBite from './HomeComponentBite';
import Ionicons from '@expo/vector-icons/Ionicons';

type Filter = 'all' | 'daily' | 'weekly' | 'monthly' | 'upcoming' | 'completed';

type CompInfo = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  goalAmount?: number;
  filter: Filter;
};

export default function HomeComponent() {
  const { colors } = useTheme();
  const { todos } = useTodos();

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const targetProgress = totalTodos > 0 ? completedTodos / totalTodos : 0;

  const isAllCompleted = totalTodos > 0 && completedTodos === totalTodos;

  const [progress, setProgress] = React.useState(targetProgress);

  useFocusEffect(
    useCallback(() => {
      setProgress(targetProgress);
    }, [targetProgress, isAllCompleted])
  );

  const currentMotivation = (() => {
    const passedThresholds = motivationalMessages.filter(
      m => targetProgress >= m.threshold
    );
    const currentThreshold = passedThresholds.slice(-1)[0];

    if (!currentThreshold) return "Let's get started!";
    const { messages } = currentThreshold;
    return messages[Math.floor(Math.random() * messages.length)];
  })();

  function groupGoalsByFrequency<T extends { frequency: string }>(goals: T[]) {
    const dailyGoals = goals.filter(g => g.frequency === 'daily');
    const weeklyGoals = goals.filter(g => g.frequency === 'weekly');
    const monthlyGoals = goals.filter(g => g.frequency === 'monthly');

    return { dailyGoals, weeklyGoals, monthlyGoals };
  }

  const { dailyGoals, weeklyGoals, monthlyGoals } =
    groupGoalsByFrequency(todos);

  const compInfo: CompInfo[] = [
    {
      title: 'Total goals',
      icon: 'trophy',
      goalAmount: totalTodos,
      filter: 'all',
    },
    {
      title: 'Daily',
      icon: 'repeat',
      goalAmount: dailyGoals.length,
      filter: 'daily',
    },
    {
      title: 'Weekly',
      icon: 'stats-chart',
      goalAmount: weeklyGoals.length,
      filter: 'weekly',
    },
    {
      title: 'Monthly',
      icon: 'calendar',
      goalAmount: monthlyGoals.length,
      filter: 'monthly',
    },
    {
      title: 'Completed',
      icon: 'checkmark-done-circle',
      goalAmount: completedTodos,
      filter: 'completed',
    },
  ];

  return (
    <View
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        height: '85%',
        marginTop: 120,
      }}
    >
      <View
        style={{
          flexDirection: 'column',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: 20,
          marginBottom: 20,
        }}
      >
        {compInfo.map((item, index) => (
          <HomeComponentBite
            key={index}
            title={item.title}
            icon={item.icon}
            goals={item.goalAmount}
            onPress={() => {
              const href: Href = {
                pathname: '/(tabs)',
                params: { filter: item.filter },
              };
              router.push(href);
            }}
          />
        ))}
      </View>
      <View style={{ marginTop: 'auto' }}>
        <ProgressBar
          progress={progress}
          color={colors.primary}
          style={{
            width: 300,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.border,
            alignSelf: 'center',
          }}
        />
      </View>
      <Text style={[styles.motivation, { color: colors.primary }]}>
        {currentMotivation}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 1,
    alignSelf: 'center',
  },
});
