import useTheme from '@/hooks/useTheme';

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import HomeComponent from '../components/HomeComponent';
import { useUser } from '../../context/UserContextProvider';
import { useAuth } from '@/context/AuthContextProvider';
import { useTodos } from '@/context/TodoContextProvider';
import { useUIStore } from '@/store/uiStore';

export default function Home() {
  const { colors } = useTheme();
  const { user } = useUser();
  const { todos } = useTodos();
  const { isLogin } = useAuth();
  const { useUserName } = useUIStore();

  function getGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return 'Good Morning';
    }
    if (currentHour >= 12 && currentHour < 18) {
      return 'Good Afternoon';
    }
    if (currentHour >= 18) {
      return 'Good Evening';
    }
  }

  const greeting = getGreeting();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View
        style={{
          borderBottomColor: colors.border,
          borderBottomWidth: 2,

          alignSelf: 'flex-start',
          position: 'absolute',
          top: 75,
          left: 25,
        }}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {greeting}
          {isLogin
            ? useUserName
              ? `, ${user?.fullName}`
              : `, ${user?.username}`
            : null}
        </Text>
      </View>

      {todos.length >= 1 && (
        <View style={{ height: 600 }}>
          <HomeComponent />
        </View>
      )}
      {todos.length === 0 && (
        <View>
          <Text style={[styles.content, { color: colors.text }]}>
            You have no goals yet.{'\n'}
            Start by adding a new goal!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
});
