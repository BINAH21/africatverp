import { create } from 'zustand';
import { User, isAuthenticated, getCurrentUser, logout as authLogout } from './auth';

interface AppState {
  language: 'en' | 'am' | 'ar';
  sidebarOpen: boolean;
  currentModule: string;
  user: User | null;
  isAuthenticated: boolean;
  setLanguage: (lang: 'en' | 'am' | 'ar') => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentModule: (module: string) => void;
  setUser: (user: User | null) => void;
  checkAuth: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  sidebarOpen: true,
  currentModule: 'dashboard',
  user: typeof window !== 'undefined' ? getCurrentUser() : null,
  isAuthenticated: typeof window !== 'undefined' ? isAuthenticated() : false,
  setLanguage: (lang) => set({ language: lang }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCurrentModule: (module) => set({ currentModule: module }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  checkAuth: () => {
    const authenticated = isAuthenticated();
    const user = getCurrentUser();
    set({ isAuthenticated: authenticated, user });
  },
  logout: () => {
    authLogout();
    set({ user: null, isAuthenticated: false });
  },
}));

