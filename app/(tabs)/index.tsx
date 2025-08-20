import useTheme from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTodos } from '../context/TodoContextProvider';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Loading from '../components/loading';
import TodoEditor from '../components/TodoEditor';
import TodoMaker from '../components/TodoMaker';

export interface Todo {
  title: string;
  description: string;
  completed?: boolean;
  id: string;
}

export default function Index() {
  const { colors } = useTheme();
  const [isTodoOpen, setIsTodoOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedTodo, setSelectedTodo] = React.useState<Todo | null>(null);
  const [redirecting, setRedirecting] = React.useState(true);

  const { todos, setTodos } = useTodos();

  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
      setRedirecting(false);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    loadTodos();
  }, []);

  React.useEffect(() => {
    saveTodos();
  }, [todos]);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem('todos');
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const handleTodoClick = () => {
    setIsTodoOpen(true);
  };

  const handleTodoEdit = () => {
    setIsEditOpen(true);
  };

  const handleClose = () => {
    setIsEditOpen(false);
    setIsTodoOpen(false);
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
            { marginTop: 30, fontSize: 27 },
          ]}
        >
          Your Goals
        </Text>
      </View>

      <View style={styles.todosWrapper}>
        <ScrollView
          style={styles.todosScrollView}
          showsVerticalScrollIndicator={false}
        >
          {todos.length === 0 && (
            <Text style={[styles.content, { color: colors.text }]}>
              Click "+ Add Goal" below
            </Text>
          )}
          {todos.length > 0 &&
            todos.map((todo, idx) => (
              <View
                key={idx}
                style={[
                  styles.todoContainer,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 16,
                    marginVertical: 6,
                    width: 300,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  },
                ]}
              >
                <View style={{ justifyContent: 'center' }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 4,
                      width: 235,
                    }}
                  >
                    {todo.title}
                  </Text>
                  {todo.description ? (
                    <Text
                      style={{
                        color: colors.text,
                        opacity: 0.7,
                        fontSize: 15,
                        width: 235,
                      }}
                    >
                      {todo.description}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setTodos(prev =>
                      prev.map((t, i) =>
                        i === idx ? { ...t, completed: !t.completed } : t
                      )
                    );
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: todo.completed ? 'green' : colors.text,
                    backgroundColor: todo.completed ? 'green' : 'transparent',
                    alignItems: 'center', // To center the inner checkmark
                    justifyContent: 'center', // To center the inner checkmark
                    marginTop: 10,
                  }}
                >
                  {todo.completed && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#fff',
                      }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
      </View>
      <View style={[styles.todoButtons]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleTodoClick}
        >
          <Text style={[styles.buttonText, { color: colors.surface }]}>
            + Add Goal
          </Text>
        </TouchableOpacity>
        {todos.length > 0 && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleTodoEdit}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              Edit Todo
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {isTodoOpen || isEditOpen ? (
        isTodoOpen ? (
          <TodoMaker
            setIsTodoOpen={setIsTodoOpen}
            setTodos={setTodos}
            setIsEditOpen={setIsEditOpen}
            isOpen={isTodoOpen}
            handleClose={handleClose}
          />
        ) : (
          <TodoEditor
            setIsTodoOpen={setIsTodoOpen}
            setIsEditOpen={setIsEditOpen}
            isTodoOpen={isTodoOpen}
            setTodos={setTodos}
            todos={todos}
            setSelectedTodo={setSelectedTodo}
            isOpen={isTodoOpen}
            handleClose={handleClose}
          />
        )
      ) : null}
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
});
