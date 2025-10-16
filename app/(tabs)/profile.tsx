import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../context/ThemeContextProvider';
import { useTodos } from '../../context/TodoContextProvider';
import Loading from '../components/loading';
import Settings from '../components/Settings';
import WeekTracker from '../components/tracker';

import { useAuth } from '@/context/AuthContextProvider';
import { useUser } from '@/context/UserContextProvider';
import { useUIStore } from '@/store/uiStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SlideUpSheet from '../components/slideUpSheet';

export default function Profile() {
  const { colors } = useTheme();
  const { isLoading } = useThemeContext();
  const { streak } = useTodos();

  const { isLogin } = useAuth();
  const { user } = useUser();

  const [isUpdaterOpen, setIsUpdaterOpen] = React.useState(false);

  const {
    isSettingsOpen,
    setIsSettingsOpen,
    setIsFriendsOpen,
    isFriendsOpen,
    useUserName,
    setUseUserName,
  } = useUIStore();

  if (isLoading && isLogin === false) {
    return <Loading />;
  }

  React.useEffect(() => {
    const loadPreference = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('useUserName');
        if (storedValue !== null) {
          setUseUserName(JSON.parse(storedValue));
        }
      } catch (e) {
        console.error('Failed to load setting:', e);
      }
    };

    loadPreference();
  }, []);

  const handleNavButtons = React.useCallback(
    (btn: 'friends' | 'settings' | 'updater'): void => {
      switch (btn) {
        case 'settings': {
          if (isFriendsOpen) return;
          setIsSettingsOpen(!isSettingsOpen);
          return;
        }
        case 'friends': {
          if (isSettingsOpen) return;
          setIsFriendsOpen(!isFriendsOpen);
          return;
        }
        case 'updater': {
          if (!isSettingsOpen) return; // only when settings is open
          setIsUpdaterOpen(prev => !prev);
          return;
        }
      }
    },
    [isFriendsOpen, isSettingsOpen]
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bg, justifyContent: 'space-between' },
      ]}
    >
      <View
        style={{
          width: '100%',
          borderColor: colors.textMuted,
          borderBottomWidth: 2,
          flexDirection: 'column',
        }}
      >
        <Text
          style={[
            styles.title,
            styles.todayTitle,
            { color: colors.text, marginTop: 45 },
          ]}
        >
          {/* Profile */}
          Profile
        </Text>

        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: colors.surface,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            shadowOpacity: 0.75,
            shadowRadius: 3.84,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {user?.profilePic !== 'default.jpg' ? (
              <Image
                source={
                  user?.profilePic
                    ? { uri: user.profilePic }
                    : require('../../assets/images/profilePhoto.jpg') // fallback
                }
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 100,
                  margin: 10,
                }}
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={100}
                color={colors.textMuted}
              />
            )}

            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  paddingTop: 75,
                  textAlign: 'left',
                  maxWidth: 200,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {isLogin ? (useUserName ? user?.fullName : user?.username) : null}
            </Text>
          </View>
          {streak >= 1 && (
            <View
              style={{
                alignSelf: 'center',

                marginRight: 10,
              }}
            >
              <Ionicons name="star-outline" size={70} color={colors.primary} />
              <Text
                style={{
                  fontSize: 20,
                  color: colors.text,
                  position: 'absolute',
                  right: 32,
                  top: 26,
                }}
              >
                {streak}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            position: 'absolute',
            top: 60,
            left: 25,
          },
        ]}
        onPress={() => handleNavButtons('friends')}
      >
        <Text>
          <Ionicons name="people" size={15} color={colors.surface} />
        </Text>
      </TouchableOpacity>

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
        onPress={() => handleNavButtons('settings')}
      >
        <Text>
          <Ionicons name="options" size={15} color={colors.surface} />
        </Text>
      </TouchableOpacity>

      {isLogin && (
        <View>
          <Text style={[styles.content, { color: colors.text }]}>
            Your Streak: {streak}
          </Text>
          <WeekTracker />
        </View>
      )}

      <SlideUpSheet
        open={isSettingsOpen && !isFriendsOpen}
        onClose={() => setIsSettingsOpen(false)}
        heightPct={0.9}
        sheetStyle={{ backgroundColor: colors.surface }}
      >
        <Settings
          setIsSettingsOpen={setIsSettingsOpen}
          isSettingsOpen={isSettingsOpen}
          useUserName={useUserName}
          setUseUserName={setUseUserName}
          handleNavButtons={handleNavButtons}
          isUpdaterOpen={isUpdaterOpen}
          setIsUpdaterOpen={setIsUpdaterOpen}
        />
      </SlideUpSheet>
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
