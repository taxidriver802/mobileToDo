// app/(auth)/TEMPauthLogin.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
/* import { login } from '../../api/auth'; */
import useTheme from '@/hooks/useTheme';
import Loading from '../components/loading';
import { useAuth } from '@/context/AuthContextProvider';
import { useUser } from '@/context/UserContextProvider';
import { loginAndHydrate } from '../../api/auth';
import { showError, showSuccess } from '@/app/utils/toast';

type Props = {
  onSwitchMode?: () => void;
};

export default function AuthLogin({ onSwitchMode }: Props) {
  const { colors } = useTheme();
  const { setIsLogin } = useAuth();
  const { fetchUser } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    try {
      setBusy(true);

      const res = await loginAndHydrate(username, password);

      if (res.ok) {
        setIsLogin(true);
        showSuccess('Login successful', {
          onPress: () => console.log('pressed toast!'),
        });
      } else {
        showError('Login failed, check your credentials');
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
