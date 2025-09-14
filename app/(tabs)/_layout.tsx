import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { ThemeProvider } from '../../context/ThemeContextProvider';
import { TodosProvider } from '../../context/TodoContextProvider';
import { useAuth } from '../../context/AuthContextProvider';

import type { Todo } from './index';

const TabsLayout = () => {
  const { colors } = useTheme();
  const { isLogin } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);

  console.log('isLogin:', isLogin);

  return (
    <ThemeProvider>
      <TodosProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              height: 90,
              paddingBottom: 30,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontSize: 15,
              fontWeight: '600',
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Goals',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="flash-outline" size={size} color={color} />
              ),
              // Hide Goals tab if not logged in
              href: isLogin ? './' : undefined,
            }}
            initialParams={{ todos }}
          />

          <Tabs.Screen
            name="home"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
              // Hide Home tab if not logged in
              href: isLogin ? '/home' : null,
            }}
            initialParams={{ todos }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: isLogin ? 'Profile' : 'Login',
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name={isLogin ? 'person' : 'log-in'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </TodosProvider>
    </ThemeProvider>
  );
};

export default TabsLayout;
