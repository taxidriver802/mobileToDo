import useTheme from '@/hooks/useTheme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../context/ThemeContextProvider';

type SettingsProps = {
  setIsSettingsOpen: (open: boolean) => void;
  setUseUserName: (open: boolean) => void;
  useUserName: boolean;
};

const Settings: React.FC<SettingsProps> = ({
  setIsSettingsOpen,
  setUseUserName,
  useUserName,
}) => {
  const { toggleDarkMode, colors } = useTheme();
  const { isDarkMode } = useThemeContext();

  return (
    <Modal transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <TouchableOpacity
            style={[styles.close, { backgroundColor: colors.primary }]}
            onPress={() => setIsSettingsOpen(false)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              X
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary, marginTop: 10 },
            ]}
            onPress={toggleDarkMode}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              {isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary, marginTop: 10 },
            ]}
            onPress={() => setUseUserName(!useUserName)}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              Toggle profile name
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
});

export default Settings;
