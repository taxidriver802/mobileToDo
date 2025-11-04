import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';

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

const isLiveForDate = (t: Todo, _date = new Date()) => t.frequency === 'daily';

/* React.useEffect(() => {
  (async () => {
    await AsyncStorage.clear();
    console.log('All AsyncStorage cleared.');
  })();
}, []); */

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
  const [hydrated, setHydrated] = useState(false);
  const [serverStreakLoaded, setServerStreakLoaded] = useState(false);

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
      setTodos(prev => {
        const next = [mapped, ...prev];
        toCache(next);
        return next;
      });
    },
    []
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
      setTodos(prev => {
        const next = prev.map(t => (t.id === id ? mapped : t));
        toCache(next);
        return next;
      });
    },
    []
  );

  const removeTodo = React.useCallback(async (id: string) => {
    await deleteGoal(id);
    setTodos(prev => {
      const next = prev.filter(t => t.id !== id);
      toCache(next);
      return next;
    });
  }, []);

  // === Sync streak on load ===
  React.useEffect(() => {
    if (!isLogin) {
      setTodos([]);
      setStreak(0);
      setCompletionHistory({});
      setIsLoading(false);
      setHydrated(false);
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
          const data = await res.json().catch(() => ({}));

          const toISO = (v: any): string | null => {
            if (!v) return null;
            if (typeof v === 'string') {
              if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
              const d = new Date(v);
              if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
              return null;
            }
            if (v instanceof Date) return v.toISOString().slice(0, 10);
            return null;
          };

          // 1) streak
          if (typeof data.streak === 'number') {
            console.log(data.streak);

            setStreak(data.streak);
            // keep local cache in sync (optional)
            await AsyncStorage.setItem('streak', String(data.streak));
          }

          // 2) completion history
          if (
            data.completionHistory &&
            typeof data.completionHistory === 'object'
          ) {
            setCompletionHistory(data.completionHistory);
            await AsyncStorage.setItem(
              'completionHistory',
              JSON.stringify(data.completionHistory)
            );
          } else {
            // if server has none, clear local to avoid stale reads
            await AsyncStorage.removeItem('completionHistory');
          }

          // 3) dates (normalize and only write if changed)
          const serverLast = toISO(data.lastDailyCheckDate);
          const serverInc = toISO(data.streakIncreasedForDate);

          const [localLast, localInc] = await AsyncStorage.multiGet([
            'lastDailyCheckDate',
            'streakIncreasedForDate',
          ]).then(entries => entries.map(([, v]) => v));

          if (serverLast) {
            if (localLast !== serverLast) {
              await AsyncStorage.setItem('lastDailyCheckDate', serverLast);
            }
          } else if (localLast != null) {
            await AsyncStorage.removeItem('lastDailyCheckDate');
          }

          if (serverInc) {
            let valueToWrite = serverInc;

            // === DEV OVERRIDE (optional, helpful for testing) ===
            // If you want to be able to re-increment today during testing,
            // uncomment this block: it clears the "increased today" marker locally.

            // if (__DEV__) {
            // const todayISO = new Date().toISOString().slice(0, 10);
            // if (serverInc === todayISO) {
            //   valueToWrite = '';
            //  }
            //  }

            if (localInc !== valueToWrite) {
              if (valueToWrite) {
                await AsyncStorage.setItem(
                  'streakIncreasedForDate',
                  valueToWrite
                );
              } else {
                await AsyncStorage.removeItem('streakIncreasedForDate');
              }
            }
          } else if (localInc != null) {
            await AsyncStorage.removeItem('streakIncreasedForDate');
          }

          setServerStreakLoaded(true);
        }
      } catch (err) {
        console.warn('[streak.sync] failed to fetch streak:', err);
      }

      await refresh();
      setHydrated(true);
      setIsLoading(false);
    })();
  }, [isLogin, refresh]);

  // === Daily reset ===
  React.useEffect(() => {
    if (!isLogin || !hydrated) return;

    const initializeAndCheckDailyReset = async () => {
      const today = toYyyyMmDd(new Date());

      if (streak === 0 && !serverStreakLoaded) {
        const storedStreak = await AsyncStorage.getItem('streak');
        if (storedStreak) setStreak(parseInt(storedStreak, 10));
      }

      const storedHistory = await AsyncStorage.getItem('completionHistory');
      if (storedHistory) setCompletionHistory(JSON.parse(storedHistory));

      const lastCheckDate = await AsyncStorage.getItem('lastDailyCheckDate');

      if (lastCheckDate && lastCheckDate !== today && todos.length > 0) {
        const liveYesterday = todos.filter(t =>
          isLiveForDate(t /*, yesterday*/)
        );
        const allWereCompleted =
          liveYesterday.length > 0
            ? liveYesterday.every(t => !!t.completed)
            : null;

        const newHistoryObj = storedHistory ? JSON.parse(storedHistory) : {};
        if (allWereCompleted !== null) {
          newHistoryObj[lastCheckDate] = allWereCompleted;
        }

        const newHistory = newHistoryObj;

        setCompletionHistory(newHistory);
        await AsyncStorage.setItem(
          'completionHistory',
          JSON.stringify(newHistory)
        );

        if (allWereCompleted === false) {
          setStreak(0);
          await AsyncStorage.setItem('streak', '0');

          showError(
            'Oh no! Your streak was lost',
            `You didn't complete all tasks yesterday. Try again today!`,
            { position: 'top', visibilityTime: 5000 }
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
  }, [isLogin, hydrated, todos]);

  React.useEffect(() => {
    if (!isLogin) return;
    toCache(todos).catch(err =>
      console.error('Error saving todos cache:', err)
    );
  }, [todos, isLogin]);

  // === When all todos completed ===
  const prevAllCompletedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isLogin || todos.length === 0) return;
    const liveToday = todos.filter(t => isLiveForDate(t /*, today*/));
    const allCompleted =
      liveToday.length > 0 && liveToday.every(t => t.completed);

    const wasCompleted = prevAllCompletedRef.current;
    prevAllCompletedRef.current = allCompleted;
    if (!allCompleted || wasCompleted) return;

    const checkAndIncreaseStreak = async () => {
      const today = toYyyyMmDd(new Date());
      const already = await AsyncStorage.getItem('streakIncreasedForDate');
      if (already === today) {
        return showCustom(
          'All Goals Completed!',
          `Come back tomorrow to keep raising your streak!`,
          { position: 'top', visibilityTime: 5000 },
          { accentColor: colors.primary }
        );
      }

      const optimistic = streak + 1;
      setStreak(optimistic);

      try {
        const res = await authFetch('/api/user/me/streak/increment', {
          method: 'POST',
          body: JSON.stringify({ onDate: today }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.warn('[streak.increment] non-2xx', res.status, text);
          // rollback local state and guard if server rejected
          setStreak(streak);
          return showCustom(
            'All Goals Completed!',
            `Couldn’t update your streak right now. Try again in a few seconds.`,
            { position: 'top' }
          );
        }
        const data = await res.json().catch(() => ({}));

        if (typeof data.streak === 'number') {
          setStreak(data.streak);
          await AsyncStorage.setItem('streak', String(data.streak));
        } else {
          await AsyncStorage.setItem('streak', String(optimistic));
        }
        await AsyncStorage.setItem('streakIncreasedForDate', today);

        const todayISO = today;
        if (
          data.completionHistory &&
          typeof data.completionHistory === 'object'
        ) {
          const merged = { ...data.completionHistory, [todayISO]: true };
          setCompletionHistory(merged);
          await AsyncStorage.setItem(
            'completionHistory',
            JSON.stringify(merged)
          );
        } else {
          setCompletionHistory(prev => {
            const next = { ...(prev || {}), [todayISO]: true };
            AsyncStorage.setItem(
              'completionHistory',
              JSON.stringify(next)
            ).catch(() => {});
            return next;
          });
        }

        showSuccess(
          'Streak Increased!',
          `You're now on a ${typeof data.streak === 'number' ? data.streak : optimistic} day streak! 🎉`,
          { position: 'top' }
        );
      } catch (err) {
        console.warn('[streak.increment sync failed]', err);
        // rollback if you want strict correctness
        setStreak(streak);
        showCustom(
          'All Goals Completed!',
          `Couldn’t update your streak right now. Try again in a few seconds.`,
          { position: 'top' }
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
