import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { login } from '../../api/auth';
import useTheme from '@/hooks/useTheme';
import { Modal } from 'react-native';
import Loading from './loading';
import { useAuth } from '@/context/AuthContextProvider';

interface AuthLoginProps {
  setIsFriendsOpen: (open: boolean) => void;
  dismissKeyboard: () => void;
  setIsLogin: (login: boolean) => void;
  setIsLoginOpen: (open: boolean) => void;
}

export default function AuthLogin({
  setIsFriendsOpen,
  dismissKeyboard,
  setIsLogin,
  setIsLoginOpen,
}: AuthLoginProps) {
  const { colors } = useTheme();
  const { isLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const validateLoginInput = () => {
    if (!username.trim()) return 'Username is required';
    if (!password.trim()) return 'Password is required';
    if (username.trim().length < 3)
      return 'Username must be at least 3 characters';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleLogin = async () => {
    setMessage('');

    // Basic validation
    const validationError = validateLoginInput();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(username.trim(), password);
      setMessage('Login successful!');

      // Close modal after successful login
      setTimeout(() => {
        setUsername('');
        setPassword('');
        setMessage('');
        setIsFriendsOpen(false);
        setIsLogin(true);

        // You might want to trigger a navigation or state update here
        // For example: navigation.navigate('Dashboard') or updateUserState(res.user)
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setMessage(errorMessage);

      // Show specific alerts for certain errors
      if (errorMessage.includes('Invalid username or password')) {
        Alert.alert(
          'Login Failed',
          'Please check your username and password and try again.',
          [{ text: 'OK' }]
        );
      } else if (errorMessage.includes('not found')) {
        Alert.alert(
          'Account Not Found',
          'No account found with this username. Would you like to create an account?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Register',
              onPress: () => {
                setIsLogin(false); // Switch to register modal
              },
            },
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isInputInvalid = !username.trim() || !password.trim() || isLoading;
  const hasValidationError = validateLoginInput() !== null;

  /* if (isLoading) {
    return (
      <Modal transparent>
        <View style={[styles.modalOverlay, { width: '100%' }]}>
          <Loading />
        </View>
      </Modal>
    );
  } */

  return (
    <Modal transparent>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.container,
              {
                backgroundColor: colors.surface,
                margin: 20,
              },
            ]}
          >
            <View style={{ padding: 3 }}>
              {isLogin ? (
                <TouchableOpacity
                  style={[styles.close, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setIsFriendsOpen(false);
                    setIsLoginOpen(false);
                    // Clear form on close
                    setUsername('');
                    setPassword('');
                    setMessage('');
                  }}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Text style={[styles.buttonText, { color: colors.surface }]}>
                    X
                  </Text>
                </TouchableOpacity>
              ) : null}

              <Text
                style={[
                  styles.title,
                  { color: colors.text, marginTop: 20, marginBottom: 20 },
                ]}
              >
                Welcome Back
              </Text>

              <TextInput
                placeholder="Username"
                placeholderTextColor={colors.text + '80'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                style={[
                  styles.input,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: colors.text,
                    borderColor: colors.primary,
                  },
                ]}
              />

              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.text + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                style={[
                  styles.input,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: colors.text,
                    borderColor: colors.primary,
                  },
                ]}
              />

              {/* Optional: Remember Me Toggle */}
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: colors.primary,
                      backgroundColor: rememberMe
                        ? colors.primary
                        : 'transparent',
                    },
                  ]}
                >
                  {rememberMe && (
                    <Text style={{ color: colors.surface, fontSize: 12 }}>
                      ✓
                    </Text>
                  )}
                </View>
                <Text style={[styles.rememberMeText, { color: colors.text }]}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                    marginTop: 25,
                    opacity: isInputInvalid || hasValidationError ? 0.25 : 1,
                  },
                ]}
                onPress={handleLogin}
                disabled={isInputInvalid || hasValidationError}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  {isLoading ? 'Signing In...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.primary,
                    marginVertical: 10,
                  },
                ]}
                onPress={() => {
                  setIsLoginOpen(false);
                  setIsFriendsOpen(true);
                  // Clear form when switching
                  setUsername('');
                  setPassword('');
                  setMessage('');
                }}
              >
                <Text style={[styles.buttonText, { color: colors.primary }]}>
                  New user? Register
                </Text>
              </TouchableOpacity>

              {message ? (
                <Text
                  style={{
                    color: message.includes('successful') ? 'green' : 'red',
                    textAlign: 'center',
                    marginTop: 10,
                    fontSize: 14,
                  }}
                >
                  {message}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

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
  input: {
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 10,
    marginHorizontal: 5,
    padding: 20,
    width: 300,
    fontSize: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  close: {
    width: 25,
    position: 'absolute',
    top: -10,
    right: -10,
    borderRadius: 7,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
