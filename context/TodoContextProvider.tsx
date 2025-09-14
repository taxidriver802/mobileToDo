// app/(tabs)/TodosContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/context/AuthContextProvider';

// Simplified Todo type is better, but keeping yours to match existing data
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
};

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completionHistory, setCompletionHistory] = useState<CompletionHistory>(
    {}
  );
  const { isLogin } = useAuth();

  // Only run effects if logged in
  React.useEffect(() => {
    if (!isLogin) {
      setTodos([]);
      setStreak(0);
      setCompletionHistory({});
      setIsLoading(false);
      return;
    }

    const initializeAndCheckDailyReset = async () => {
      const today = new Date().toDateString();
      const storedTodos = await AsyncStorage.getItem('todos');
      const storedStreak = await AsyncStorage.getItem('streak');
      const lastCheckDate = await AsyncStorage.getItem('lastDailyCheckDate');
      const storedHistory = await AsyncStorage.getItem('completionHistory');
      const initialTodos: Todo[] = storedTodos ? JSON.parse(storedTodos) : [];

      if (storedStreak) setStreak(parseInt(storedStreak, 10));
      if (storedHistory) setCompletionHistory(JSON.parse(storedHistory));

      if (lastCheckDate !== today && initialTodos.length > 0) {
        const allWereCompleted = initialTodos.every(todo => todo.completed);

        const newHistory = {
          ...completionHistory,
          [lastCheckDate!]: allWereCompleted,
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

        const resetTodos = initialTodos.map(todo => ({
          ...todo,
          completed: false,
        }));
        setTodos(resetTodos);
        await AsyncStorage.setItem('lastDailyCheckDate', today);
      } else {
        setTodos(initialTodos);
      }
      setIsLoading(false);
    };

    initializeAndCheckDailyReset();
  }, [isLogin]);

  // Save todos only if logged in
  React.useEffect(() => {
    if (!isLogin || isLoading) return;

    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem('todos', JSON.stringify(todos));
      } catch (error) {
        console.error('Error saving todos:', error);
      }
    };
    saveTodos();
  }, [todos, isLogin, isLoading]);

  // Handle streak only if logged in
  React.useEffect(() => {
    if (!isLogin || isLoading || todos.length === 0) return;
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
  }, [todos, streak, isLogin, isLoading]);

  return (
    <TodosContext.Provider
      value={{ todos, setTodos, streak, completionHistory }}
    >
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodosContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
};

export default TodosProvider;
