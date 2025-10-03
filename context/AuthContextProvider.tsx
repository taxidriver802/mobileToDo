// context/AuthContextProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getToken, setApiBaseUrl } from '../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // During development you can point the app to a public tunnel (ngrok)
  // so Expo Tunnel or LAN issues don't block requests. Replace the
  // URL below with your current ngrok forwarding URL.
  useEffect(() => {
    if (__DEV__) {
      setApiBaseUrl('https://unusuriously-interlocutory-dann.ngrok-free.dev');
    }

    checkStorage();
  }, []);

  const logout = async () => {
    try {
      // Clear token from storage
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
