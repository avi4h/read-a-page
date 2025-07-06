import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { View } from '../types';

type Theme = 'light' | 'dark';
type ActivePopover = 'font' | 'settings' | null;

interface UiState {
  view: View;
  theme: Theme;
  isSidebarOpen: boolean;
  activePopover: ActivePopover;
}

const initialState: UiState = {
  view: 'reading',
  theme: (() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme') as Theme | null;
        if (storedTheme) return storedTheme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
  })(),
  isSidebarOpen: false,
  activePopover: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setView(state, action: PayloadAction<View>) {
      state.view = action.payload;
      state.isSidebarOpen = false;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    setActivePopover(state, action: PayloadAction<ActivePopover>) {
      // Toggle behavior: if same popover is clicked, close it. Otherwise, open the new one.
      state.activePopover = state.activePopover === action.payload ? null : action.payload;
    },
    closeAllPopovers(state) {
      state.activePopover = null;
    }
  },
});

export const { setView, toggleTheme, setSidebarOpen, setActivePopover, closeAllPopovers } = uiSlice.actions;
export default uiSlice.reducer;