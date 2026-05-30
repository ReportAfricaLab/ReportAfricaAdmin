import { create } from 'zustand';
import { setAuthToken } from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  country: string;
  role: string;
  trustLevel: string;
  avatar?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  userCountry: string; // Registration country (never changes)
  viewingCountry: string; // Country feed being browsed (can change)
  country: string; // Alias for viewingCountry (backward compat)
  isAuthenticated: boolean;
  isDarkMode: boolean;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setViewingCountry: (country: string) => void;
  setCountry: (country: string) => void; // backward compat
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  userCountry: 'NG',
  viewingCountry: 'NG',
  country: 'NG',
  isAuthenticated: false,
  isDarkMode: false,

  setAuth: (user, token) => {
    setAuthToken(token);
    set({ user, token, isAuthenticated: true, userCountry: user.country, viewingCountry: user.country, country: user.country });
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setViewingCountry: (country) => set({ viewingCountry: country, country }),
  setCountry: (country) => set({ viewingCountry: country, country }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
