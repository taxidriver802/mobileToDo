import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContextProvider';
import useTheme from '@/hooks/useTheme';
import { showError, showSuccess } from '@/utils/toast';
import { loginAndHydrate } from '../../api/auth';
import Loading from '../components/loading';

type Props = {
  onSwitchMode?: () => void;
};

export default function AuthLogin({ onSwitchMode }: Props) {
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
