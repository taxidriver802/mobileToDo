// context/UserContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe, updateMe } from '../api/auth';

interface User {
  id: string;
  fullName: string;
  username: string;
  profilePic?: string;
  streak: number;
  highestStreak: number;
  friends: string[];
  friendRequests: {
    sent: string[];
    received: string[];
  };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => Promise<void>;
  clearUser: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<User>;
  updateProfilePic: (profilePicUrl: string) => Promise<User>;
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
      await setUser(data);
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 1) Load cached user first (instant UI)
        const cached = await AsyncStorage.getItem('user');
        if (mounted && cached) setUserState(JSON.parse(cached));

        // 2) If token exists, fetch fresh from API
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const data = await getMe();
        if (mounted) await setUser(data);
      } catch (e) {
        console.error('bootstrap fetchUser failed:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setUser = async (newUser: User | null) => {
    if (newUser) {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('user');
    }
    setUserState(newUser);
  };

  // Update user on server and in local state + storage
  const updateUser = async (patch: Partial<User>) => {
    try {
      const updated = await updateMe(patch);
      await setUser(updated);
      return updated;
    } catch (e: any) {
      if (String(e?.message || '').includes('401')) {
        await AsyncStorage.removeItem('token');
        await clearUser();
      }
      console.error('Failed to update user:', e);
      throw e;
    }
  };

  const updateProfilePic = async (profilePicUrl: string) => {
    return updateUser({ profilePic: profilePicUrl });
  };

  const clearUser = async () => {
    await AsyncStorage.removeItem('user');
    setUserState(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        clearUser,
        fetchUser,
        updateUser,
        updateProfilePic,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
