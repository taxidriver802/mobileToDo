import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { TodosProvider } from '../context/TodoContextProvider';

import type { Todo } from './index';

const TabsLayout = () => {
  const { colors } = useTheme();
  const [todos, setTodos] = useState<Todo[]>([]);

  return (
    <TodosProvider>
      <Tabs
        initialRouteName="home"
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
          }}
          initialParams={{ todos }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </TodosProvider>
  );
};

export default TabsLayout;
