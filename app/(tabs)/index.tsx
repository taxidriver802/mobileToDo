import useTheme from '@/hooks/useTheme';
import React from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [todos, setTodos] = React.useState<Todo[]>([]);
  const [selectedTodoId, setSelectedTodoId] = React.useState<number | null>(
    null
  );

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

  const removeTodo = (idx: number) => {
    setTodos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTodoClick = () => {
    setIsTodoOpen(true);
  };

  const handleTodoEdit = () => {
    setIsEditOpen(true);
  };

  return (
    <View
      style={[styles.container, styles.main, { backgroundColor: colors.bg }]}
    >
      <View>
        <Text style={[styles.content, { color: colors.text }]}>
          This is the Todo Screen
        </Text>
        <Text style={[styles.content, { color: colors.text }]}>
          Your added content will appear here.
        </Text>
      </View>

      <View style={styles.todosWrapper}>
        <ScrollView
          style={styles.todosScrollView}
          showsVerticalScrollIndicator={true}
        >
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
                <View>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 4,
                    }}
                  >
                    {todo.title}
                  </Text>
                  {todo.description ? (
                    <Text style={{ color: colors.text, fontSize: 15 }}>
                      {todo.description}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    // Toggle completion for this todo
                    setTodos(prev =>
                      prev.map((t, i) =>
                        i === idx ? { ...t, completed: !t.completed } : t
                      )
                    );
                  }}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 10,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: todo.completed ? 'green' : colors.text,
                      backgroundColor: todo.completed ? 'green' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                  </View>
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
            + Add Todo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleTodoEdit}
        >
          <Text style={[styles.buttonText, { color: colors.surface }]}>
            Edit Todo
          </Text>
        </TouchableOpacity>
      </View>
      {isTodoOpen && (
        <TodoMaker setIsTodoOpen={setIsTodoOpen} setTodos={setTodos} />
      )}
      {isEditOpen && (
        <TodoEditor
          setIsEditOpen={setIsEditOpen}
          setTodos={setTodos}
          todos={todos}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    justifyContent: 'space-around',
  },
  todosWrapper: {
    height: 400,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
});
