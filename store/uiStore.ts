import { create } from 'zustand';

type UIStore = {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  isFriendsOpen: boolean;
  setIsFriendsOpen: (open: boolean) => void;

  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;

  useUserName: boolean;
  setUseUserName: (value: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  isSettingsOpen: false,
  setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),

  isFriendsOpen: false,
  setIsFriendsOpen: (open) => set({ isFriendsOpen: open }),

  isLoginOpen: false,
  setIsLoginOpen: (open) => set({ isLoginOpen: open }),

  useUserName: false,
  setUseUserName: (value) => set({ useUserName: value }),
}));
