import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/context/AuthContextProvider';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  type Goal,
} from '@/api/goals';

export type Todo = {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
};

export type CompletionHistory = {
  [dateString: string]: boolean;
};

type TodosContextType = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  streak: number;
  completionHistory: CompletionHistory;
  isLoading: boolean;
  refresh: () => Promise<void>;
  addTodo: (title: string, description: string) => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<void>;
  editTodo: (
    id: string,
    patch: { title?: string; description?: string }
  ) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
};

const TodosContext = createContext<TodosContextType | undefined>(undefined);

const fromGoal = (g: Goal): Todo => ({
  id: g._id,
  title: g.title,
  description: g.description,
  completed: !!g.completed,
});

const toCache = (todos: Todo[]) =>
  AsyncStorage.setItem('todos', JSON.stringify(todos));
const fromCache = async (): Promise<Todo[]> => {
  const s = await AsyncStorage.getItem('todos');
  return s ? JSON.parse(s) : [];
};

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completionHistory, setCompletionHistory] = useState<CompletionHistory>(
    {}
  );
  const { isLogin } = useAuth();

  const refresh = React.useCallback(async () => {
    if (!isLogin) return;
    setIsLoading(true);
    try {
      const serverGoals = await listGoals();
      const mapped = serverGoals.map(fromGoal);
      setTodos(mapped);
      await toCache(mapped);
    } catch (err) {
      console.error('[Todos] refresh failed, falling back to cache:', err);
      const cached = await fromCache();
      setTodos(cached);
    } finally {
      setIsLoading(false);
    }
  }, [isLogin]);

  const addTodo = React.useCallback(
    async (title: string, description: string) => {
      const created = await createGoal({ title, description });
      const mapped = fromGoal(created);
      setTodos(prev => [mapped, ...prev]);
      await toCache([mapped, ...todos]);
    },
    [todos]
  );

  const toggleComplete = React.useCallback(
    async (id: string, completed: boolean) => {
      const updated = await updateGoal(id, { completed });
      const mapped = fromGoal(updated);
      setTodos(prev => prev.map(t => (t.id === id ? mapped : t)));
      await toCache(todos.map(t => (t.id === id ? mapped : t)));
    },
    [todos]
  );

  const editTodo = React.useCallback(
    async (id: string, patch: { title?: string; description?: string }) => {
      const updated = await updateGoal(id, patch);
      const mapped = fromGoal(updated);
      setTodos(prev => prev.map(t => (t.id === id ? mapped : t)));
      await toCache(todos.map(t => (t.id === id ? mapped : t)));
    },
    [todos]
  );

  const removeTodo = React.useCallback(
    async (id: string) => {
      await deleteGoal(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      await toCache(todos.filter(t => t.id !== id));
    },
    [todos]
  );

  React.useEffect(() => {
    if (!isLogin) {
      setTodos([]);
      setStreak(0);
      setCompletionHistory({});
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        const cached = await fromCache();
        if (cached.length) setTodos(cached);
      } catch {}
      await refresh();
    })();
  }, [isLogin, refresh]);

  React.useEffect(() => {
    if (!isLogin) return;

    const initializeAndCheckDailyReset = async () => {
      const today = new Date().toDateString();

      const storedStreak = await AsyncStorage.getItem('streak');
      if (storedStreak) setStreak(parseInt(storedStreak, 10));

      const storedHistory = await AsyncStorage.getItem('completionHistory');
      if (storedHistory) setCompletionHistory(JSON.parse(storedHistory));

      const lastCheckDate = await AsyncStorage.getItem('lastDailyCheckDate');

      if (lastCheckDate && lastCheckDate !== today && todos.length > 0) {
        const allWereCompleted = todos.every(t => !!t.completed);

        const newHistory = {
          ...(storedHistory ? JSON.parse(storedHistory) : {}),
          [lastCheckDate]: allWereCompleted,
        };
        setCompletionHistory(newHistory);
        await AsyncStorage.setItem(
          'completionHistory',
          JSON.stringify(newHistory)
        );

        if (!allWereCompleted) {
          setStreak(0);
          await AsyncStorage.setItem('streak', '0');
          Toast.show({
            type: 'error',
            text1: 'Oh no! Your streak was lost!',
            text2: "You didn't complete all tasks yesterday. Try again today!",
            position: 'bottom',
          });
        }

        const resetTodos = todos.map(t => ({ ...t, completed: false }));
        setTodos(resetTodos);
        await toCache(resetTodos);
        await AsyncStorage.setItem('lastDailyCheckDate', today);

        Promise.all(
          resetTodos.map(t =>
            updateGoal(t.id, { completed: false }).catch(() => null)
          )
        ).catch(() => null);
      } else if (!lastCheckDate) {
        await AsyncStorage.setItem('lastDailyCheckDate', today);
      }
    };

    initializeAndCheckDailyReset();
  }, [isLogin, todos]);

  React.useEffect(() => {
    if (!isLogin) return;
    toCache(todos).catch(err =>
      console.error('Error saving todos cache:', err)
    );
  }, [todos, isLogin]);

  React.useEffect(() => {
    if (!isLogin || todos.length === 0) return;
    const allCompleted = todos.every(todo => todo.completed);
    if (!allCompleted) return;

    const checkAndIncreaseStreak = async () => {
      const today = new Date().toDateString();
      const streakIncreasedDate = await AsyncStorage.getItem(
        'streakIncreasedForDate'
      );
      if (streakIncreasedDate !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        await AsyncStorage.setItem('streak', newStreak.toString());
        await AsyncStorage.setItem('streakIncreasedForDate', today);
        Toast.show({
          type: 'success',
          text1: 'Streak Increased!',
          text2: `You're now on a ${newStreak} day streak! 🎉`,
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'All Goals Completed!',
          text2: 'Come back tomorrow to keep raising your streak!',
          position: 'bottom',
        });
      }
    };
    checkAndIncreaseStreak();
  }, [todos, streak, isLogin]);

  return (
    <TodosContext.Provider
      value={{
        todos,
        setTodos,
        streak,
        completionHistory,
        isLoading,
        refresh,
        addTodo,
        toggleComplete,
        editTodo,
        removeTodo,
      }}
    >
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodosContext);
  if (!context) throw new Error('useTodos must be used within a TodosProvider');
  return context;
};

export default TodosProvider;
