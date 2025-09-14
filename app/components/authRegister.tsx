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
import { register } from '../../api/auth';
import useTheme from '@/hooks/useTheme';
import { Modal } from 'react-native';
import Loading from './loading';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useAuth } from '@/context/AuthContextProvider';

interface AuthScreenProps {
  setIsFriendsOpen: (open: boolean) => void;
  setIsLogin: (login: boolean) => void;
  dismissKeyboard: () => void;
  setIsLoginOpen: (open: boolean) => void;
}

export default function AuthRegister({
  setIsFriendsOpen,
  setIsLogin,
  dismissKeyboard,
  setIsLoginOpen,
}: AuthScreenProps) {
  const { colors } = useTheme();

  const { isLogin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (username: string) => {
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ) => {
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 50) return 'Password must be less than 50 characters';
    return null;
  };

  const getValidationErrors = () => {
    const errors = [];
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword
    );

    if (usernameError) errors.push(usernameError);
    if (passwordError) errors.push(passwordError);
    if (confirmPasswordError) errors.push(confirmPasswordError);

    return errors;
  };

  const handleRegister = async () => {
    setMessage('');

    // Validate inputs
    const errors = getValidationErrors();
    if (errors.length > 0) {
      setMessage(errors[0]); // Show first error
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(username, password);
      setMessage('Account created successfully!');
      console.log('successful registration');

      // Auto-switch to login after successful registration
      setTimeout(() => {
        setUsername(''); // Clear form
        setPassword('');
        setConfirmPassword('');
        setMessage('');
      }, 1500);
    } catch (err: any) {
      // Handle specific error messages from API
      const errorMessage =
        err.message || 'Something went wrong, Please try again.';
      setMessage(errorMessage);

      // Show alert for critical errors
      if (
        errorMessage.includes('already exists') ||
        errorMessage.includes('taken')
      ) {
        console.log(errorMessage);

        Alert.alert(
          'Registration Failed',
          'This username is already taken. Please choose a different one.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
      setIsFriendsOpen(false);
      setIsLogin(true);
    }
  };

  const isInputInvalid =
    !username.trim() ||
    !password.trim() ||
    !confirmPassword.trim() ||
    isLoading;
  const validationErrors = getValidationErrors();
  const hasValidationErrors = validationErrors.length > 0;

  if (isLoading) {
    return (
      <Modal transparent>
        <View style={styles.modalOverlay}>
          <Loading />
        </View>
      </Modal>
    );
  }

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
                    // Clear form on close
                    setUsername('');
                    setPassword('');
                    setConfirmPassword('');
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
                Create Account
              </Text>

              <TextInput
                placeholder="Full Name"
                placeholderTextColor={colors.text + '80'}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="none"
                autoCorrect={false}
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
                placeholder="Username"
                placeholderTextColor={colors.text + '80'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: colors.text,
                    borderColor:
                      validateUsername(username) && username
                        ? 'red'
                        : colors.primary,
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
                style={[
                  styles.input,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: colors.text,
                    borderColor:
                      validatePassword(password) && password
                        ? 'red'
                        : colors.primary,
                  },
                ]}
              />

              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor={colors.text + '80'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: colors.text,
                    borderColor:
                      validateConfirmPassword(password, confirmPassword) &&
                      confirmPassword
                        ? 'red'
                        : colors.primary,
                  },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                    marginTop: 25,
                    opacity: isInputInvalid || hasValidationErrors ? 0.25 : 1,
                  },
                ]}
                onPress={handleRegister}
                disabled={isInputInvalid || hasValidationErrors}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  {isLoading ? 'Creating Account...' : 'Register'}
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
                  setIsFriendsOpen(false);
                  setIsLoginOpen(true);

                  // Clear form when switching
                  setUsername('');
                  setPassword('');
                  setConfirmPassword('');
                  setMessage('');
                }}
              >
                <Text style={[styles.buttonText, { color: colors.primary }]}>
                  Existing user? Login
                </Text>
              </TouchableOpacity>

              {message ? (
                <Text
                  style={{
                    color: message.includes('successfully') ? 'green' : 'red',
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
});
