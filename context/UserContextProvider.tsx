// context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from '../api/auth';

interface User {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const data = await getMe();

      console.log('Fetched user data:', data);

      await setUser(data);
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  };

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetchUser();
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('user').then(s => {
      if (s) setUserState(JSON.parse(s));
    });
  }, []);

  const setUser = async (newUser: User | null) => {
    if (newUser) {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('user');
    }
    setUserState(newUser);
  };

  const clearUser = async () => {
    await AsyncStorage.removeItem('user');
    setUserState(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
