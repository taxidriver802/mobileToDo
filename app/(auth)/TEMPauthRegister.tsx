// app/(auth)/TEMPauthRegister.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { register, registerAndHydrate } from '../../api/auth';
import useTheme from '@/hooks/useTheme';
import Loading from '../components/loading';
import { useAuth } from '@/context/AuthContextProvider';

type Props = {
  onSwitchMode?: () => void;
};

export default function TEMPauthRegister({ onSwitchMode }: Props) {
  const { colors } = useTheme();
  const { setIsLogin } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    try {
      setBusy(true);

      const ok = await registerAndHydrate(username, password, fullName);
      if (ok) {
        setIsLogin(true); // AuthGate will route into app
      } else {
        Alert.alert('Registration failed', 'Please try again');
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
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
        style={[
          styles.input,
          { color: colors.text, borderColor: colors.border },
        ]}
        placeholderTextColor={colors.textMuted}
      />
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
        onPress={handleRegister}
        style={[styles.btn, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.btnText, { color: colors.surface }]}>
          Create account
        </Text>
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
