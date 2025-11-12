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
import FireFlickerGradient from '@/hooks/FireFlickerGradient';
import FriendsTab from '../components/FriendsTab';

export default function Profile() {
  const { colors } = useTheme();
  const { isLoading } = useThemeContext();
  const { streak, displayStreak } = useTodos();

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
          if (!isSettingsOpen) return;
          setIsUpdaterOpen(prev => !prev);
          return;
        }
      }
    },
    [isFriendsOpen, isSettingsOpen]
  );

  const currentHighStreak = user?.highestStreak;

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

            <View style={{ flexDirection: 'column' }}>
              <WeekTracker />

              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    paddingTop: 15,
                    textAlign: 'left',
                    maxWidth: 153,
                    overflow: 'hidden',
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {isLogin
                  ? useUserName
                    ? user?.fullName
                    : user?.username
                  : null}
              </Text>
            </View>
          </View>

          {streak >= 1 && (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  alignSelf: 'center',
                  marginRight: 10,
                  position: 'absolute',
                  right: 0,
                  top: 65,
                  width: 80,
                  height: 35,
                  borderRadius: 18,
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <FireFlickerGradient variant="streak" />

                <Ionicons
                  name="flame-outline"
                  size={22}
                  color={colors.surface}
                  style={{ position: 'absolute', left: 10 }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: colors.surface,
                    position: 'absolute',
                    right: 12,
                  }}
                >
                  {displayStreak}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View>
        <Text style={[styles.title, { color: colors.text }]}>
          Longest Streak: {currentHighStreak}
        </Text>
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

      {/* Friends Sheet test */}

      <SlideUpSheet
        open={!isSettingsOpen && isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        heightPct={0.9}
        sheetStyle={{ backgroundColor: colors.surface }}
      >
        <FriendsTab
          isFriendsOpen={isFriendsOpen}
          setIsFriendsOpen={setIsFriendsOpen}
          handleNavButtons={handleNavButtons}
        />
      </SlideUpSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
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
  todayTitle: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
  },
});
