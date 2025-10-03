import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { ThemeProvider } from '../../context/ThemeContextProvider';
import { TodosProvider } from '../../context/TodoContextProvider';
import { useUser } from '../../context/UserContextProvider';
import { useAuth } from '../../context/AuthContextProvider';

import type { Todo } from './index';
import { bootstrapSession } from '@/api/auth';

const TabsLayout = () => {
  const { colors } = useTheme();
  const { isLogin, setIsLogin } = useAuth();
  const { setUser } = useUser();
  const [todos] = useState<Todo[]>([]);

  React.useEffect(() => {
    (async () => {
      const res = await bootstrapSession();
      if (res.ok) {
        setUser(res.user);
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    })();
  }, []);

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
