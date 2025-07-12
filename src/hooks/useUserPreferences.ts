/**
 * Hook for managing user preferences initialization and state
 */

import { useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { loadUserPreferences } from '../lib/userPreferences';

/**
 * Hook to load and apply user preferences on app startup
 * This ensures all stored preferences are applied to Zustand state
 */
export const useUserPreferences = () => {
  const updateReadingSettings = useSettingsStore((state) => state.updateReadingSettings);

  useEffect(() => {
    // Load user preferences from localStorage
    const preferences = loadUserPreferences();

    // Apply reading preferences to Zustand state
    updateReadingSettings({
      fontSize: preferences.reading.fontSize,
      fontFamily: preferences.reading.fontFamily,
      textAlign: preferences.reading.textAlign,
      pageWidth: preferences.reading.pageWidth,
    });

    // Theme is already handled in Zustand state initialization
    // UI state (view, sidebar, popover) no longer persists
    
    console.log('User preferences loaded:', {
      profile: preferences.profile,
      historyCount: preferences.bookHistory.length,
    });
  }, [updateReadingSettings]);
};

/**
 * Hook to get current user preferences
 */
export const useCurrentPreferences = () => {
  return loadUserPreferences();
};
