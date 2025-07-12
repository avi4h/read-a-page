/**
 * Comprehensive user preferences management
 * Stores all user data in a single JSON structure including:
 * - User profile (username, etc.)
 * - UI preferences (theme, sidebar state)
 * - Reading settings (font size, font family, etc.)
 * - Book history (last 10 books)
 * - Bookshelf (user's saved books)
 */

import { type BookPage } from '../types';

const USER_DATA_KEY = 'userData';

export interface BookHistoryEntry {
  id: string;
  revealed: boolean; // Whether the user has revealed this book's details
  timestamp: string; // ISO 8601 timestamp with timezone
}

export interface BookshelfEntry {
  id: string;
  timestamp: string; // ISO 8601 timestamp with timezone
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
  bookShelf: BookshelfEntry[];
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
  bookShelf: [],
};

/**
 * Load user preferences from localStorage
 * Creates default preferences if none exist
 */
export const loadUserPreferences = (): UserPreferences => {
  try {
    // First, try to migrate from old format if needed
    migrateFromOldFormat();
    
    const stored = localStorage.getItem(USER_DATA_KEY);
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
          .sort((a: BookHistoryEntry, b: BookHistoryEntry) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ), // Ensure newest first
        // Ensure bookShelf is an array
        bookShelf: Array.isArray(parsed.bookShelf) ? parsed.bookShelf : [],
      };
      
      // Clean up any old properties that shouldn't be in the new structure
      const cleanedMerged = {
        profile: merged.profile,
        reading: merged.reading,
        bookHistory: merged.bookHistory,
        bookShelf: merged.bookShelf,
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
      // Ensure bookShelf is properly formatted
      bookShelf: Array.isArray(preferences.bookShelf) ? preferences.bookShelf : [],
    };
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(toSave));
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
export const addBookToHistory = (bookId: string, revealed: boolean = false): UserPreferences => {
  const current = loadUserPreferences();
  
  // Check if book already exists in history
  const existingIndex = current.bookHistory.findIndex(h => h.id === bookId);
  
  let updatedHistory = [...current.bookHistory];
  
  if (existingIndex !== -1) {
    // Book exists - remove the old entry and we'll add updated one at top
    const existingEntry = updatedHistory[existingIndex];
    updatedHistory.splice(existingIndex, 1);
    
    // Create updated entry with new timestamp and revealed status
    // If already revealed, keep it revealed (don't downgrade)
    const newEntry: BookHistoryEntry = {
      id: bookId,
      timestamp: new Date().toISOString(),
      revealed: revealed || existingEntry.revealed, // Keep revealed if already true
    };
    
    // Add to top
    updatedHistory.unshift(newEntry);
  } else {
    // New book - create new entry
    const newEntry: BookHistoryEntry = {
      id: bookId,
      timestamp: new Date().toISOString(),
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
      bookShelf: Array.isArray(imported.bookShelf) ? imported.bookShelf : [],
    };
    
    saveUserPreferences(validated);
    return validated;
  } catch (error) {
    console.error('Failed to import user preferences:', error);
    throw new Error('Invalid preferences format');
  }
};


/**
 * Load bookshelf from userData
 */
export const loadBookshelf = (): BookshelfEntry[] => {
  try {
    const preferences = loadUserPreferences();
    return preferences.bookShelf || [];
  } catch (error) {
    console.warn('Failed to load bookshelf from userData:', error);
    return [];
  }
};

/**
 * Save bookshelf to userData
 */
export const saveBookshelf = (books: BookshelfEntry[]): void => {
  try {
    const currentPreferences = loadUserPreferences();
    const updatedPreferences = {
      ...currentPreferences,
      bookShelf: books,
    };
    saveUserPreferences(updatedPreferences);
  } catch (error) {
    console.error('Failed to save bookshelf to userData:', error);
  }
};

/**
 * Add a book to the bookshelf in localStorage
 */
export const addBookToLocalShelf = (book: BookPage): BookshelfEntry[] => {
  const currentBooks = loadBookshelf();
  
  // Check if book already exists
  const exists = currentBooks.some(b => b.id === book.id);
  
  if (!exists) {
    const newEntry: BookshelfEntry = {
      id: book.id,
      timestamp: new Date().toISOString(),
    };
    const updatedBooks = [...currentBooks, newEntry];
    saveBookshelf(updatedBooks);
    return updatedBooks;
  }
  
  return currentBooks;
};

/**
 * Remove a book from the bookshelf in localStorage
 */
export const removeBookFromLocalShelf = (bookId: string): BookshelfEntry[] => {
  const currentBooks = loadBookshelf();
  const updatedBooks = currentBooks.filter(b => b.id !== bookId);
  saveBookshelf(updatedBooks);
  return updatedBooks;
};

/**
 * Get book IDs from local bookshelf (updated to work with new format)
 */
export const getLocalBookshelfIds = (): string[] => {
  const books = loadBookshelf();
  return books.map(b => b.id);
};

/**
 * Check if a book exists in the local bookshelf (updated to work with new format)
 */
export const isBookInLocalShelf = (bookId: string): boolean => {
  const books = loadBookshelf();
  return books.some(b => b.id === bookId);
};



/**
 * Clear all books from bookshelf in userData
 */
export const clearLocalBookshelf = (): void => {
  try {
    const currentPreferences = loadUserPreferences();
    const updatedPreferences = {
      ...currentPreferences,
      bookShelf: [],
    };
    saveUserPreferences(updatedPreferences);
  } catch (error) {
    console.error('Failed to clear bookshelf in userData:', error);
  }
};

/**
 * Migration function to handle transition from old userPreferences to new userData format
 * This function should be called once when the app starts to migrate existing data
 */
export const migrateFromOldFormat = (): void => {
  try {
    // Check if old format exists
    const oldData = localStorage.getItem('userPreferences');
    const newData = localStorage.getItem(USER_DATA_KEY);
    
    // If new format already exists, no migration needed
    if (newData) {
      return;
    }
    
    if (oldData) {
      const parsed = JSON.parse(oldData);
      console.log('Migrating from old userPreferences format to new userData format');
      
      // Migrate book history to new format
      const migratedHistory: BookHistoryEntry[] = (parsed.bookHistory || []).map((entry: any) => ({
        id: entry.bookId || entry.id,
        revealed: entry.revealed || false,
        timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString(),
      }));
      
      // Migrate bookshelf to new format
      const migratedBookshelf: BookshelfEntry[] = (parsed.bookShelf || []).map((book: any) => ({
        id: book.id,
        timestamp: new Date().toISOString(), // Set current timestamp for existing bookshelf items
      }));
      
      // Create new format
      const newPreferences: UserPreferences = {
        profile: parsed.profile || DEFAULT_PREFERENCES.profile,
        reading: parsed.reading || DEFAULT_PREFERENCES.reading,
        bookHistory: migratedHistory,
        bookShelf: migratedBookshelf,
      };
      
      // Save in new format
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(newPreferences));
      
      // Remove old format
      localStorage.removeItem('userPreferences');
      
      console.log('Successfully migrated to new userData format');
    }
  } catch (error) {
    console.error('Failed to migrate from old format:', error);
  }
};
