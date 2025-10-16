import useTheme, { ThemeName } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContextProvider';
import { useUser } from '@/context/UserContextProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import ProfileUpdater from './ProfileUpdater';
import SlideUpSheet from './slideUpSheet';

const THEME_OPTIONS: ThemeName[] = [
  'light',
  'dark',
  'forest',
  'amoled',
  'rose',
  'sunset',
  'midnight',
  'arctic',
  'solarizedDark',
  'solarizedLight',
  'cyber',
];

const DARK_NAMES = new Set<ThemeName>([
  'dark',
  'forest',
  'amoled',
  'solarizedDark',
  'midnight',
  'cyber',
]);

const LIGHT_NAMES = new Set<ThemeName>([
  'light',
  'rose',
  'solarizedLight',
  'arctic',
  'sunset',
]);

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
  const { colors, themeName, setTheme } = useTheme();
  const { setUser } = useUser();
  const { logout, isLogin } = useAuth();

  const [updaterBusy, setUpdaterBusy] = React.useState(false);

  const [filter, setFilter] = React.useState<'light' | 'dark'>(() => {
    return DARK_NAMES.has(themeName) ? 'dark' : 'light';
  });

  React.useEffect(() => {
    setFilter(DARK_NAMES.has(themeName) ? 'dark' : 'light');
  }, [themeName]);

  const filtered = React.useMemo(() => {
    return filter === 'light'
      ? THEME_OPTIONS.filter(n => LIGHT_NAMES.has(n))
      : THEME_OPTIONS.filter(n => DARK_NAMES.has(n));
  }, [filter]);

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
    setUpdaterBusy(true);
    setIsUpdaterOpen(!isUpdaterOpen);
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        marginHorizontal: 'auto',
        height: '100%',
        width: '100%',
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.bg,
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
                borderBottomColor: colors.text,
              }}
            >
              <Text style={[styles.text, { color: colors.text }]}>
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
            borderBottomColor: colors.text,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text
              style={[
                styles.text,
                {
                  color: colors.text,
                },
              ]}
            >
              Theme:
            </Text>

            <View
              style={[
                styles.segment,
                {
                  borderColor: colors.border,
                  transform: [{ translateY: -10 }],
                },
              ]}
            >
              {(['light', 'dark'] as const).map(opt => {
                const active = filter === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setFilter(opt)}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? colors.surface : colors.text,
                        fontWeight: active
                          ? ('700' as const)
                          : ('500' as const),
                        textTransform: 'capitalize',
                      }}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.themeGrid}>
            {filtered.map(name => {
              const isActive = themeName === name;
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => setTheme(name)}
                  style={[
                    styles.themeTile,
                    {
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={{
                      marginTop: 8,
                      color: isActive ? colors.primary : colors.text,
                      fontWeight: isActive
                        ? ('700' as const)
                        : ('600' as const),
                      textTransform: 'capitalize',
                      textAlign: 'center',
                    }}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <SlideUpSheet
        open={isUpdaterOpen}
        onClose={() => setIsUpdaterOpen(false)}
        onOpenStart={() => setUpdaterBusy(true)}
        onOpenEnd={() => setUpdaterBusy(false)}
        onCloseStart={() => setUpdaterBusy(true)}
        onCloseEnd={() => setUpdaterBusy(false)}
        backdropStyle={{ backgroundColor: 'transparent' }}
        dismissOnBackdropPress={false}
        heightPct={0.8}
        sheetStyle={{ backgroundColor: `transparent` }}
      >
        <ProfileUpdater
          handleNavButtons={handleNavButtons}
          sheetBusy={updaterBusy}
          isOpen={isUpdaterOpen}
        />
      </SlideUpSheet>
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
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  themePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 2,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeTile: {
    width: '48%',
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 2,
  },
  swatchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
});

export default Settings;
