// context/AuthContextProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { clearApiBaseUrl, getToken, setApiBaseUrl } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { USE_NGROK } from '@/api/env';

interface AuthContextType {
  isLogin: boolean;
  isLoading: boolean;
  setIsLogin: (login: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getToken();
        setIsLogin(!!token);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLogin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const checkStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const result = await AsyncStorage.multiGet(keys);
  };

  useEffect(() => {
    if (USE_NGROK) {
      setApiBaseUrl('https://unusuriously-interlocutory-dann.ngrok-free.dev');
    } else {
      clearApiBaseUrl();
    }

    checkStorage();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setIsLogin(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLogin,
        isLoading,
        setIsLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
