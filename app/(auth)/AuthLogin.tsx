import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import useTheme from '@/hooks/useTheme';
import Loading from '../components/loading';
import { useAuth } from '@/context/AuthContextProvider';
import { loginAndHydrate } from '../../api/auth';
import { showError, showSuccess } from '@/app/utils/toast';

export default function AuthLogin() {
  const { colors } = useTheme();
  const { setIsLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    try {
      setBusy(true);

      const res = await loginAndHydrate(username, password);

      if (res.ok) {
        setIsLogin(true);
        showSuccess('Login successful', '');
      } else {
        showError('Login failed', 'Check your credentials.', {
          position: 'top',
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginTop: 24 }}>
      {busy && <Loading />}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border },
        ]}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border },
        ]}
        placeholderTextColor={colors.textMuted}
      />
      <TouchableOpacity
        onPress={handleLogin}
        style={[styles.btn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.btnText, { color: colors.surface }]}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 12 },
  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  btnText: { fontWeight: '700' },
});
