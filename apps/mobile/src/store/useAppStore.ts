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
  trustScore?: number;
  avatar?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  userCountry: string;
  viewingCountry: string;
  country: string;
  isAuthenticated: boolean;
  isDarkMode: boolean;

  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  secureWipe: () => void;
  setViewingCountry: (country: string) => void;
  setCountry: (country: string) => void;
  toggleDarkMode: () => void;
  initDarkMode: () => void;
}

// Lazy getter to avoid top-level import crash
const getStorage = () => require('@react-native-async-storage/async-storage').default;

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  userCountry: 'NG',
  viewingCountry: 'NG',
  country: 'NG',
  isAuthenticated: false,
  isDarkMode: false,

  setAuth: (user, token, refreshToken) => {
    setAuthToken(token);
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true, userCountry: user.country, viewingCountry: user.country, country: user.country });
    try {
      getStorage().setItem('ra_token', token);
      getStorage().setItem('ra_user', JSON.stringify(user));
      if (refreshToken) getStorage().setItem('ra_refresh', refreshToken);
    } catch {}
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    try {
      getStorage().removeItem('ra_token');
      getStorage().removeItem('ra_user');
      getStorage().removeItem('ra_refresh');
    } catch {}
  },

  secureWipe: () => {
    setAuthToken(null);
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isDarkMode: false });
    try {
      getStorage().clear();
    } catch {}
  },

  setViewingCountry: (country) => set({ viewingCountry: country, country }),
  setCountry: (country) => set({ viewingCountry: country, country }),

  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      try { getStorage().setItem('ra_dark_mode', JSON.stringify(newMode)); } catch {}
      return { isDarkMode: newMode };
    });
  },

  initDarkMode: () => {
    try {
      getStorage().getItem('ra_dark_mode').then((val: string | null) => {
        if (val === 'true') set({ isDarkMode: true });
      }).catch(() => {});
    } catch {}
  },
}));
