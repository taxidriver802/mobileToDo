import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAuth } from '@/context/AuthContextProvider';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  type Goal,
} from '@/api/goals';

import { fetchWithAutoBase, getToken } from '@/api/auth';

import useTheme from '@/hooks/useTheme';
import { Freq } from '@/app/(tabs)';
import { showCustom, showError, showSuccess } from '@/app/utils/toast';

function toYyyyMmDd(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function authFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  return fetchWithAutoBase(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...(init.headers || {}),
    },
  });
}

// === context setup ===
export type Todo = {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
  frequency: Freq;
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
  addTodo: (
    title: string,
    description: string,
    frequency: Freq
  ) => Promise<void>;
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
  frequency: g.frequency,
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
  const { colors } = useTheme();
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
    async (title: string, description: string, frequency: Freq) => {
      const created = await createGoal({ title, description, frequency });
      const mapped = fromGoal(created);
      setTodos(prev => [mapped, ...prev]);
      await toCache([mapped, ...todos]);
    },
    [todos]
  );

  const toggleComplete = React.useCallback(
    async (id: string, completed: boolean) => {
      let rollback: Todo[] | null = null;
      setTodos(prev => {
        rollback = prev;
        const next = prev.map(t => (t.id === id ? { ...t, completed } : t));
        toCache(next);
        return next;
      });

      try {
        const updated = await updateGoal(id, { completed });
        const mapped = fromGoal(updated);
        setTodos(prev => {
          const next = prev.map(t => (t.id === id ? mapped : t));
          toCache(next);
          return next;
        });
      } catch (e) {
        if (rollback) {
          setTodos(rollback);
          toCache(rollback);
        }
        throw e;
      }
    },
    []
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

  // === Sync streak on load ===
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

      // pull streak info from backend
      try {
        const res = await authFetch('/api/user/me/streak');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.streak === 'number') setStreak(data.streak);
          if (data.completionHistory)
            setCompletionHistory(data.completionHistory);
          if (data.lastDailyCheckDate)
            await AsyncStorage.setItem(
              'lastDailyCheckDate',
              data.lastDailyCheckDate
            );
          if (data.streakIncreasedForDate)
            await AsyncStorage.setItem(
              'streakIncreasedForDate',
              data.streakIncreasedForDate
            );
        }
      } catch (err) {
        console.warn('[streak.sync] failed to fetch streak:');
      }

      await refresh();
    })();
  }, [isLogin, refresh]);

  // === Daily reset ===
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

          showError(
            'Oh no! Your streak was lost',
            `You didn't complete all tasks yesterday. Try again today!`,
            { position: 'top' }
          );
        }

        const resetTodos = todos.map(t => ({ ...t, completed: false }));
        setTodos(resetTodos);
        await toCache(resetTodos);
        await AsyncStorage.setItem('lastDailyCheckDate', today);

        // update backend
        try {
          const lastDay = toYyyyMmDd(new Date(lastCheckDate));
          const dayNow = toYyyyMmDd(new Date());
          await authFetch('/api/user/me/streak/rollover', {
            method: 'POST',
            body: JSON.stringify({
              lastDay,
              completedAll: allWereCompleted,
              today: dayNow,
            }),
          });
          await authFetch('/api/user/me/streak/mark-check', {
            method: 'POST',
            body: JSON.stringify({ today: dayNow }),
          });
        } catch (err) {
          console.warn('[streak.rollover sync failed]');
        }

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

  // === When all todos completed ===
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

        // sync with backend
        try {
          const res = await authFetch('/api/user/me/streak/increment', {
            method: 'POST',
            body: JSON.stringify({ onDate: toYyyyMmDd(new Date()) }),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.warn('[streak.increment] non-2xx', res.status, text);
          } else {
            // (optional) trust server as source of truth
            const data = await res.json();
            if (typeof data.streak === 'number') {
              setStreak(data.streak);
              await AsyncStorage.setItem('streak', String(data.streak));
            }
          }
        } catch (err) {
          console.warn('[streak.increment sync failed]', err);
        }

        showSuccess(
          'Streak Increased!',
          `You're now on a ${newStreak} day streak! 🎉`,
          { position: 'top' }
        );
      } else {
        showCustom(
          'All Goals Completed!',
          `Come back tomorrow to keep raising your streak!`,
          {
            position: 'top',
            visibilityTime: 5000,
          },
          { accentColor: colors.primary }
        );
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
