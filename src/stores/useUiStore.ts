import { create } from 'zustand';
import type { View } from '../types';
import { loadUserPreferences, updateTheme } from '../lib/userPreferences';

type Theme = 'light' | 'dark';
type ActivePopover = 'font' | 'settings' | null;

interface UiState {
  view: View;
  theme: Theme;
  isSidebarOpen: boolean;
  activePopover: ActivePopover;
}

interface UiActions {
  setView: (view: View) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePopover: (popover: ActivePopover) => void;
  closeAllPopovers: () => void;
}

type UiStore = UiState & UiActions;

// Load initial state from user preferences
const userPrefs = loadUserPreferences();

export const useUiStore = create<UiStore>((set) => ({
  // Initial state
  view: 'reading',
  theme: userPrefs.profile.theme,
  isSidebarOpen: false,
  activePopover: null,

  // Actions
  setView: (view) => set(() => {
    // Close sidebar when changing views
    return {
      view,
      isSidebarOpen: false
    };
  }),

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    
    // Persist theme to user preferences
    updateTheme(newTheme);
    
    return { theme: newTheme };
  }),

  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  setActivePopover: (popover) => set((state) => ({
    // Toggle behavior: if same popover is clicked, close it. Otherwise, open the new one.
    activePopover: state.activePopover === popover ? null : popover
  })),

  closeAllPopovers: () => set({ activePopover: null }),
}));
