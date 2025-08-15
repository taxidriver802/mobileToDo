// app/(tabs)/TodosContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

export type Todo = {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
};

type TodosContextType = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export const TodosProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <TodosContext.Provider value={{ todos, setTodos }}>
      {children}
    </TodosContext.Provider>
  );
};

// Custom hook for easier access
export const useTodos = () => {
  const context = useContext(TodosContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodosProvider');
  }
  return context;
};
