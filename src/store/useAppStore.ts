import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  userName: string;
  userPhone: string;
  isLoggedIn: boolean;
  isPhoneSetup: boolean;
  isUnlocked: boolean;
  setLogin: (rut: string, name: string) => void;
  setPhone: (phone: string) => void;
  setUnlocked: (unlocked: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userName: '',
      userPhone: '',
      isLoggedIn: false,
      isPhoneSetup: false,
      isUnlocked: false,
      setLogin: (rut, name) => set({ userName: name, isLoggedIn: true }),
      setPhone: (phone) => set({ userPhone: phone, isPhoneSetup: true }),
      setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
      logout: () => set({ userName: '', userPhone: '', isLoggedIn: false, isPhoneSetup: false, isUnlocked: false }),
    }),
    {
      name: 'sos-responder-session',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['isUnlocked'].includes(key))
        ) as AppState,
    }
  )
);
