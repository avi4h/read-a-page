import { create } from 'zustand';
import { ReadingSettings } from '../types';
import { loadUserPreferences, updateReadingPreferences } from '../lib/userPreferences';

interface SettingsState {
  reading: ReadingSettings;
}

interface SettingsActions {
  updateReadingSettings: (settings: Partial<ReadingSettings>) => void;
}

type SettingsStore = SettingsState & SettingsActions;

// Load initial state from user preferences
const userPrefs = loadUserPreferences();

export const useSettingsStore = create<SettingsStore>((set) => ({
  // Initial state
  reading: {
    fontSize: userPrefs.reading.fontSize,
    fontFamily: userPrefs.reading.fontFamily,
    textAlign: userPrefs.reading.textAlign,
    pageWidth: userPrefs.reading.pageWidth,
  },

  // Actions
  updateReadingSettings: (newSettings) => set((state) => {
    const updatedReading = { ...state.reading, ...newSettings };
    
    // Persist to user preferences
    updateReadingPreferences(newSettings);
    
    return {
      reading: updatedReading
    };
  }),
}));
