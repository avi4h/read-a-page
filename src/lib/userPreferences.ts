/**
 * Comprehensive user preferences management
 * Stores all       // Merge with defaults to handle version upgrades and missing properties
      const merged = {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        profile: { ...DEFAULT_PREFERENCES.profile, ...parsed.profile },
        reading: { 
          ...DEFAULT_PREFERENCES.reading, 
          ...parsed.reading,
          // Migrate from old maxWidth/pageWidth CSS classes to descriptive names
          pageWidth: (() => {
            const oldValue = parsed.reading?.pageWidth || parsed.reading?.maxWidth;
            switch (oldValue) {
              case '2xl':
                return 'narrow';
              case '3xl':
                return 'medium';
              case '4xl':
                return 'wide';
              case 'narrow':
              case 'medium':
              case 'wide':
                return oldValue;
              default:
                return DEFAULT_PREFERENCES.reading.pageWidth;
            }
          })()
        },
        // Ensure bookHistory is limited to 10 items and properly sorted
        bookHistory: (parsed.bookHistory || [])
          .slice(0, 10)
          .sort((a: BookHistoryEntry, b: BookHistoryEntry) => b.timestamp - a.timestamp), // Ensure newest first
      };n a single JSON structure including:
 * - User profile (username, etc.)
 * - UI preferences (theme, sidebar state)
 * - Reading settings (font size, font family, etc.)
 * - Book history (last 10 books)
 */

const USER_PREFERENCES_KEY = 'userPreferences';

export interface BookHistoryEntry {
  bookId: string;
  timestamp: number;
  hashedId: string;
  title?: string; // Optional book title for better UX
  revealed: boolean; // Whether the user has revealed this book's details
}

export interface UserProfile {
  theme: 'light' | 'dark';
}

export interface ReadingPreferences {
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontFamily: 'sans' | 'serif';
  textAlign: 'left' | 'center' | 'justify';
  pageWidth: 'narrow' | 'medium' | 'wide';
}

export interface UserPreferences {
  profile: UserProfile;
  reading: ReadingPreferences;
  bookHistory: BookHistoryEntry[];
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  profile: {
    theme: (() => {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    })(),
  },
  reading: {
    fontSize: 'lg',
    fontFamily: 'sans',
    textAlign: 'justify',
    pageWidth: 'medium',
  },
  bookHistory: [],
};

/**
 * Load user preferences from localStorage
 * Creates default preferences if none exist
 */
export const loadUserPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(USER_PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Merge with defaults to handle version upgrades and missing properties
      const merged = {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        profile: { ...DEFAULT_PREFERENCES.profile, ...parsed.profile },
        reading: { ...DEFAULT_PREFERENCES.reading, ...parsed.reading },
        // Ensure bookHistory is limited to 10 items and properly sorted
        bookHistory: (parsed.bookHistory || [])
          .slice(0, 10)
          .sort((a: BookHistoryEntry, b: BookHistoryEntry) => b.timestamp - a.timestamp), // Ensure newest first
      };
      
      // Clean up any old properties that shouldn't be in the new structure
      const cleanedMerged = {
        profile: merged.profile,
        reading: merged.reading,
        bookHistory: merged.bookHistory,
      };
      
      // If we had to clean up, save the cleaned version
      if (JSON.stringify(cleanedMerged) !== stored) {
        console.log('Preferences cleaned up during load, saving updated version');
        saveUserPreferences(cleanedMerged);
      }
      
      return cleanedMerged;
    }
  } catch (error) {
    console.warn('Failed to load user preferences, using defaults:', error);
  }
  
  // Create and save default preferences
  const defaultPrefs = { ...DEFAULT_PREFERENCES };
  saveUserPreferences(defaultPrefs);
  return defaultPrefs;
};

/**
 * Save user preferences to localStorage
 */
export const saveUserPreferences = (preferences: UserPreferences): void => {
  try {
    const toSave = {
      ...preferences,
      // Ensure bookHistory is limited to 10 items
      bookHistory: preferences.bookHistory.slice(0, 10),
    };
    
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
};

/**
 * Update specific user preferences
 */
export const updateUserPreferences = (updates: Partial<UserPreferences>): UserPreferences => {
  const current = loadUserPreferences();
  const updated = {
    ...current,
    ...updates,
  };
  
  saveUserPreferences(updated);
  return updated;
};

/**
 * Update theme preference only
 */
export const updateTheme = (theme: 'light' | 'dark'): UserPreferences => {
  const current = loadUserPreferences();
  const updated = {
    ...current,
    profile: { ...current.profile, theme },
  };
  
  saveUserPreferences(updated);
  return updated;
};

/**
 * Update reading preferences only
 */
export const updateReadingPreferences = (readingUpdates: Partial<ReadingPreferences>): UserPreferences => {
  const current = loadUserPreferences();
  const updated = {
    ...current,
    reading: { ...current.reading, ...readingUpdates },
  };
  
  saveUserPreferences(updated);
  return updated;
};

/**
 * Update user profile only
 */
export const updateUserProfile = (profileUpdates: Partial<UserProfile>): UserPreferences => {
  const current = loadUserPreferences();
  const updated = {
    ...current,
    profile: { ...current.profile, ...profileUpdates },
  };
  
  saveUserPreferences(updated);
  return updated;
};

/**
 * Add a book to the reading history (max 10 books)
 * Implements FIFO with newest books at the top
 * If book already exists, moves it to top and updates revealed status
 */
export const addBookToHistory = (bookId: string, hashedId: string, title?: string, revealed: boolean = false): UserPreferences => {
  const current = loadUserPreferences();
  
  // Check if book already exists in history
  const existingIndex = current.bookHistory.findIndex(h => h.bookId === bookId);
  
  let updatedHistory = [...current.bookHistory];
  
  if (existingIndex !== -1) {
    // Book exists - remove the old entry and we'll add updated one at top
    const existingEntry = updatedHistory[existingIndex];
    updatedHistory.splice(existingIndex, 1);
    
    // Create updated entry with new timestamp and revealed status
    // If already revealed, keep it revealed (don't downgrade)
    const newEntry: BookHistoryEntry = {
      bookId,
      hashedId,
      title: title || existingEntry.title,
      timestamp: Date.now(),
      revealed: revealed || existingEntry.revealed, // Keep revealed if already true
    };
    
    // Add to top
    updatedHistory.unshift(newEntry);
  } else {
    // New book - create new entry
    const newEntry: BookHistoryEntry = {
      bookId,
      hashedId,
      title,
      timestamp: Date.now(),
      revealed,
    };
    
    // Add new entry at the beginning (newest first)
    updatedHistory.unshift(newEntry);
  }
  
  // Keep only the last 10 entries
  updatedHistory = updatedHistory.slice(0, 10);
  
  const updated = {
    ...current,
    bookHistory: updatedHistory,
  };
  
  // Debug log to help troubleshoot
  console.log('Book added to history:', {
    bookId,
    title,
    revealed,
    historyLength: updatedHistory.length,
    isExistingBook: existingIndex !== -1,
    movedToTop: existingIndex !== -1
  });
  
  saveUserPreferences(updated);
  return updated;
};

/**
 * Get the last opened book
 */
export const getLastOpenedBook = (): BookHistoryEntry | null => {
  const preferences = loadUserPreferences();
  return preferences.bookHistory.length > 0 ? preferences.bookHistory[0] : null;
};

/**
 * Get the full book reading history
 */
export const getBookHistory = (): BookHistoryEntry[] => {
  const preferences = loadUserPreferences();
  return preferences.bookHistory;
};

/**
 * Check if there's any book history
 */
export const hasBookHistory = (): boolean => {
  const preferences = loadUserPreferences();
  return preferences.bookHistory.length > 0;
};

/**
 * Export preferences for backup
 */
export const exportUserPreferences = (): string => {
  const preferences = loadUserPreferences();
  return JSON.stringify(preferences, null, 2);
};

/**
 * Import preferences from backup
 */
export const importUserPreferences = (jsonString: string): UserPreferences => {
  try {
    const imported = JSON.parse(jsonString) as UserPreferences;
    
    // Validate and merge with defaults
    const validated = {
      ...DEFAULT_PREFERENCES,
      ...imported,
      profile: { ...DEFAULT_PREFERENCES.profile, ...imported.profile },
      reading: { ...DEFAULT_PREFERENCES.reading, ...imported.reading },
      bookHistory: (imported.bookHistory || []).slice(0, 10),
    };
    
    saveUserPreferences(validated);
    return validated;
  } catch (error) {
    console.error('Failed to import user preferences:', error);
    throw new Error('Invalid preferences format');
  }
};
