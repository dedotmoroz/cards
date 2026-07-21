import { create } from 'zustand';
import {
  applyThemeToDocument,
  isThemeMode,
  readStoredThemeMode,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/shared/theme/theme-mode';

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  hydrated: false,

  hydrate: () => {
    const mode = readStoredThemeMode();
    applyThemeToDocument(mode);
    set({ mode, hydrated: true });
  },

  setMode: (mode) => {
    if (!isThemeMode(mode)) return;
    applyThemeToDocument(mode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // ignore storage access errors
    }
    set({ mode });
  },
}));
