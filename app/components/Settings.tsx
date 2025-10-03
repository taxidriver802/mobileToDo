import useTheme from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContextProvider';
import { useUser } from '@/context/UserContextProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import ProfileUpdater from './ProfileUpdater';

type SettingsProps = {
  setIsSettingsOpen: (open: boolean) => void;
  setUseUserName: (open: boolean) => void;
  useUserName: boolean;
  handleNavButtons: (btn: 'friends' | 'settings' | 'updater') => void;
  isSettingsOpen?: boolean;
  isUpdaterOpen: boolean;
  setIsUpdaterOpen: (open: boolean) => void;
};

const Settings: React.FC<SettingsProps> = ({
  setIsSettingsOpen,
  setUseUserName,
  useUserName,
  handleNavButtons,
  isSettingsOpen,
  isUpdaterOpen,
  setIsUpdaterOpen,
}) => {
  const { toggleDarkMode, colors } = useTheme();
  const { setUser } = useUser();
  const { logout, isLogin } = useAuth();

  const toggleUserName = async () => {
    try {
      const newValue = !useUserName;
      setUseUserName(newValue);
      await AsyncStorage.setItem('useUserName', JSON.stringify(newValue));
    } catch (e) {
      console.error('Failed to save setting:', e);
    }
  };

  const openProfileUpdate = () => {
    // Navigation to Profile Update Screen
    setIsUpdaterOpen(!isUpdaterOpen);
  };

  return (
    <View
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: 0,
        marginHorizontal: 'auto',
        height: '110%',
        width: '110%',
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            height: '90%',
            marginTop: 100,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Options</Text>

        {isLogin ? (
          <>
            <View
              style={{
                marginTop: 125,
                paddingBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: colors.textMuted,
              }}
            >
              <Text style={[styles.text, { color: colors.textMuted }]}>
                Profile:
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary, marginTop: 10 },
                ]}
                onPress={() => openProfileUpdate()}
              >
                <Text style={[styles.buttonText, { color: colors.surface }]}>
                  Update Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary, marginTop: 10 },
                ]}
                onPress={() => toggleUserName()}
              >
                <Text style={[styles.buttonText, { color: colors.surface }]}>
                  {`Display name: ${!useUserName ? 'Username' : 'Name'}`}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  position: 'absolute',
                  bottom: 80,
                  width: '100%',
                  alignSelf: 'center',
                },
              ]}
              onPress={() => {
                logout();
                setUser(null);
                setIsSettingsOpen(false);
              }}
            >
              <Text style={[styles.buttonText, styles.logout]}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                {
                  backgroundColor: colors.primary,
                  position: 'absolute',
                  top: -40,
                  right: 13,
                  width: 34,
                  height: 27,
                  padding: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 7,
                },
              ]}
              onPress={() => handleNavButtons('settings')}
            >
              <Text style={{ padding: 0 }}>
                {!isSettingsOpen ? (
                  <Ionicons
                    name="options"
                    size={15}
                    color={colors.surface}
                    style={{ padding: 0 }}
                  />
                ) : (
                  <Ionicons
                    name="close"
                    size={15}
                    color={colors.surface}
                    style={{ padding: 0 }}
                  />
                )}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}

        <View
          style={{
            marginTop: 25,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.textMuted,
          }}
        >
          <Text
            style={[
              styles.text,
              {
                color: colors.textMuted,
              },
            ]}
          >
            Theme:
          </Text>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary, marginTop: 10 },
            ]}
            onPress={toggleDarkMode}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              Change Theme
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {isUpdaterOpen ? (
        <ProfileUpdater handleNavButtons={handleNavButtons} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    borderRadius: 8,
    margin: 10,
    marginBottom: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 3.84,
    height: 'auto',
  },
  text: { fontSize: 16, fontWeight: '500' },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  todoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  close: { width: 25, position: 'absolute', top: 5, right: 5, borderRadius: 7 },
  logout: {
    color: 'rgba(160, 3, 3, 0.9)',
  },
});

export default Settings;
