import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
  userName: string;
  userPhone: string;
  userRut: string;
  isLoggedIn: boolean;
  isPhoneSetup: boolean;
  isUnlocked: boolean;
  hasAppPin: boolean;
  setLogin: (rut: string, name: string) => void;
  setPhone: (phone: string) => void;
  setUnlocked: (unlocked: boolean) => void;
  setHasAppPin: (hasPin: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userName: '',
      userPhone: '',
      userRut: '',
      isLoggedIn: false,
      isPhoneSetup: false,
      isUnlocked: false,
      hasAppPin: false,
      setLogin: (rut, name) => set({ userName: name, userRut: rut, isLoggedIn: true }),
      setPhone: (phone) => set({ userPhone: phone, isPhoneSetup: true }),
      setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
      setHasAppPin: (hasPin) => set({ hasAppPin: hasPin }),
      logout: () => set({ userName: '', userPhone: '', userRut: '', isLoggedIn: false, isPhoneSetup: false, isUnlocked: false, hasAppPin: false }),
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
