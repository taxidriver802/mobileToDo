import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../context/ThemeContextProvider';
import { useTodos } from '../../context/TodoContextProvider';
import Loading from '../components/loading';
import Settings from '../components/Settings';
import WeekTracker from '../components/tracker';

const profilePic = require('../../assets/images/profilePhoto.jpg');

export default function Profile() {
  const { colors } = useTheme();
  const { isLoading } = useThemeContext();
  const { streak } = useTodos();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [useUserName, setUseUserName] = React.useState(false);

  if (isLoading) {
    return <Loading />;
  }

  const userName = 'JAcox12';
  const firstName = 'Jason';
  const lastName = 'Cox';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, justifyContent: 'space-between' },
      ]}
    >
      <View style={{ width: '100%' }}>
        <Text
          style={[
            styles.title,
            styles.todayTitle,
            { color: colors.text, marginTop: 45 },
          ]}
        >
          Profile
        </Text>
        <View style={{ marginTop: 50 }}>
          <Image
            source={profilePic}
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              alignSelf: 'center',
            }}
          />
          <Text style={[styles.title, { color: colors.text }]}>
            {useUserName ? userName : `${firstName} ${lastName}`}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            position: 'absolute',
            top: 60,
            right: 25,
          },
        ]}
        onPress={() => setIsSettingsOpen(true)}
      >
        <Text>
          <Ionicons name="options" size={15} color={colors.surface} />
        </Text>
      </TouchableOpacity>

      <View>
        <Text style={[styles.content, { color: colors.text }]}>
          Your Streak: {streak}
        </Text>
        <WeekTracker />
      </View>

      {isSettingsOpen && (
        <Settings
          setIsSettingsOpen={setIsSettingsOpen}
          useUserName={useUserName}
          setUseUserName={setUseUserName}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    justifyContent: 'space-around',
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
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
