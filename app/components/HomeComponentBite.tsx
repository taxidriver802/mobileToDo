import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useTheme from '@/hooks/useTheme';
import { useTodos } from '@/context/TodoContextProvider';

type HomeComponentProps = {
  title?: string; // optional prop
  icon?: keyof typeof Ionicons.glyphMap;
  goals?: number;
  onPress?: () => void;
};

export default function HomeComponentBite({
  title = 'Total goals', // default value
  icon = 'help-circle-outline', // default value
  goals,
  onPress,
}: HomeComponentProps) {
  const { colors } = useTheme();
  const { todos } = useTodos();

  const { total, allDone } = React.useMemo(() => {
    const total = todos.length;
    const done = todos.reduce((n, t) => n + (t.completed ? 1 : 0), 0);
    return { total, done, allDone: total > 0 && done === total };
  }, [todos]);

  const isCompletedCard = title?.toLowerCase() === 'completed';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 10,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        padding: 10,
        backgroundColor: colors.surface,
        width: '100%',

        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* Title and count */}
      <Text style={{ color: colors.text, fontWeight: '600' }}>
        {title} - {goals}
        {isCompletedCard &&
          total > 0 &&
          (allDone ? ` / ${total} ✅` : ` / ${total} ⏳`)}
      </Text>

      {/* Dynamic Ionicon */}
      <Ionicons
        name={icon as any}
        size={22}
        color={colors.primary}
        style={{
          marginTop: 5,
          paddingBottom: 25,
        }}
      />
    </TouchableOpacity>
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
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 1,
    alignSelf: 'center',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 2,
  },
});
