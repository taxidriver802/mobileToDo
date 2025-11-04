import useTheme from '@/hooks/useTheme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTodos } from '../../context/TodoContextProvider';

import Loading from '../components/loading';
import TodoEditor from '../components/TodoEditor';
import TodoMaker from '../components/TodoMaker';
import TodoCard from '../components/TodoCard';
import SlideUpSheet from '../components/slideUpSheet';

export type Freq = 'daily' | 'weekly' | 'monthly';
type Filter = 'active' | 'completed' | Freq;

export interface Todo {
  title: string;
  description: string;
  completed?: boolean;
  id: string;
  frequency: Freq;
}

const isFilter = (v: unknown): v is Filter =>
  v === 'active' ||
  v === 'daily' ||
  v === 'weekly' ||
  v === 'monthly' ||
  v === 'completed';

export default function Index() {
  const { colors } = useTheme();
  const [isTodoOpen, setIsTodoOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);
  const [redirecting, setRedirecting] = React.useState(true);
  const [intialRedirectDone, setInitialRedirectDone] = React.useState(false);

  const { todos, toggleComplete } = useTodos();

  const router = useRouter();

  const { filter: filterParam } = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = React.useState<Filter>(() =>
    isFilter(filterParam) ? (filterParam as Filter) : 'active'
  );

  const filtersInPriority = [
    'active',
    'completed',
    'daily',
    'weekly',
    'monthly',
  ] as const;

  React.useEffect(() => {
    // only run on mount (or when todos update)
    if (todos.length === 0) return;

    // find the first filter that returns a non-empty result
    for (const f of filtersInPriority) {
      const hasData = todos.some(todo => {
        if (f === 'completed') return !!todo.completed;
        if (f === 'active') return !todo.completed;
        return todo.frequency === f && !todo.completed;
      });
      if (hasData) {
        setFilter(f);
        return;
      }
    }

    // edge case: no todos match any filters
    setFilter('active');
  }, [todos]);

  React.useEffect(() => {
    if (isFilter(filterParam) && filterParam !== filter) {
      setFilter(filterParam);
    }
  }, [filterParam]);

  const filteredGoals = React.useMemo(() => {
    switch (filter) {
      case 'completed':
        return todos.filter(t => !!t.completed);

      case 'active':
        return todos.filter(t => !t.completed);

      case 'daily':
      case 'weekly':
      case 'monthly':
        return todos.filter(t => t.frequency === filter && !t.completed);

      default:
        return todos;
    }
  }, [todos, filter]);

  React.useEffect(() => {
    if (intialRedirectDone) return;
    setInitialRedirectDone(true);
    const timer = setTimeout(() => {
      router.replace('/home');
      setRedirecting(false);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const handleButtonPress = (button: string) => {
    if (button === 'add') {
      setSelectedTodo(null);
      setIsTodoOpen(true);
    }
    if (button === 'edit') {
      setIsEditOpen(true);
    }
  };

  const handleClose = () => {
    setIsEditOpen(false);
    setIsTodoOpen(false);
    setSelectedTodo(null);
  };

  if (redirecting) {
    return <Loading />;
  }

  return (
    <View
      style={[styles.container, styles.main, { backgroundColor: colors.bg }]}
    >
      <View style={{ width: '100%' }}>
        <Text
          style={[
            styles.content,
            styles.todayTitle,
            { color: colors.text },
            { marginTop: 41, fontSize: 27 },
          ]}
        >
          Your Goals
        </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View
          style={[
            styles.segment,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          {(['active', 'daily', 'weekly', 'monthly', 'completed'] as const).map(
            opt => {
              const active = filter === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setFilter(opt)}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: active ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.surface : colors.text,
                      fontWeight: active ? ('700' as const) : ('500' as const),
                      textTransform: 'capitalize',
                    }}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      </View>

      <View style={[styles.todosWrapper]}>
        <ScrollView
          style={styles.todosScrollView}
          showsVerticalScrollIndicator={false}
        >
          {filteredGoals.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onToggleComplete={() => toggleComplete(todo.id, !todo.completed)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.todoButtons]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => handleButtonPress('add')}
        >
          <Text style={[styles.buttonText, { color: colors.surface }]}>
            + Add Goal
          </Text>
        </TouchableOpacity>
        {todos.length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => handleButtonPress('edit')}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              Edit Goal
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <SlideUpSheet
        open={isTodoOpen}
        onClose={() => setIsTodoOpen(false)}
        heightPct={0.9}
        withBackdrop
        backdropOpacity={0.35}
        sheetStyle={{ backgroundColor: colors.surface }}
      >
        <TodoMaker
          setIsTodoOpen={setIsTodoOpen}
          todoToEdit={selectedTodo}
          setSelectedTodo={setSelectedTodo}
          isOpen={isTodoOpen}
          handleClose={handleClose}
        />
      </SlideUpSheet>

      <SlideUpSheet
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        heightPct={0.9}
        withBackdrop
        backdropOpacity={0.35}
        sheetStyle={{ backgroundColor: colors.surface }}
      >
        <TodoEditor
          setIsTodoOpen={setIsTodoOpen}
          setIsEditOpen={setIsEditOpen}
          setSelectedTodo={setSelectedTodo}
          isOpen={isEditOpen}
          handleClose={handleClose}
          filteredGoals={filteredGoals}
          filter={filter}
        />
      </SlideUpSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    justifyContent: 'space-around',
  },
  todosWrapper: {
    height: 500,
    width: 300,
  },
  todosScrollView: {
    flex: 1,
  },
  todoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  content: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // optional dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  todoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayTitle: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
  },
  text: { fontSize: 16, fontWeight: '500' },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  segmentBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 1,
  },
});
