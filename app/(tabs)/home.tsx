import useTheme from '@/hooks/useTheme';

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import HomeComponent from '../components/HomeComponent';
import { useUser } from '../../context/UserContextProvider';
import { useAuth } from '@/context/AuthContextProvider';
import { useUIStore } from '@/store/uiStore';

export default function Home() {
  const { colors } = useTheme();
  const { user } = useUser();
  const { isLogin } = useAuth();
  const { useUserName } = useUIStore();

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
          Hi, {isLogin ? (useUserName ? user?.fullName : user?.username) : null}
        </Text>
      </View>

      <HomeComponent />
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
