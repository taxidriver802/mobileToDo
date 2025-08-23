import useTheme from '@/hooks/useTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Settings from '../components/Settings';
import { useTodos } from '../context/TodoContextProvider';

export default function Profile() {
  const { colors } = useTheme();
  const { streak } = useTodos();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

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
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            position: 'absolute',
            top: 50,
            right: 25,
          },
        ]}
        onPress={() => setIsSettingsOpen(true)}
      >
        <Text style={styles.buttonText}>
          <Ionicons name="settings" size={15} color={colors.surface} />
        </Text>
      </TouchableOpacity>

      <View>
        <Text style={[styles.content, { color: colors.text }]}>
          Your Streak: {streak}
        </Text>
      </View>

      {isSettingsOpen && <Settings setIsSettingsOpen={setIsSettingsOpen} />}
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
    backgroundColor: 'rgba(0,0,0,0.3)', // optional dark overlay
    justifyContent: 'center',
    alignItems: 'center',
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
