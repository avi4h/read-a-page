import { create } from 'zustand';
import { type BookPage } from '../types';
import { 
  loadBookshelf, 
  addBookToLocalShelf, 
  removeBookFromLocalShelf
} from '../lib/userPreferences';

interface BookshelfState {
  books: BookPage[];
  bookIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface BookshelfActions {
  // Basic actions
  fetchBookshelf: () => Promise<void>;
  addBookToShelf: (book: BookPage) => Promise<void>;
  removeBookFromShelf: (bookId: string) => Promise<void>;
  
  // Optimistic update actions
  addBookToShelfOptimistic: (book: BookPage) => Promise<void>;
  removeBookFromShelfOptimistic: (bookId: string) => Promise<void>;
  
  // Utility actions
  initializeFromLocalStorage: () => void;
}

type BookshelfStore = BookshelfState & BookshelfActions;

export const useBookshelfStore = create<BookshelfStore>((set, get) => ({
  // Initial state
  books: [],
  bookIds: [],
  status: 'idle',
  error: null,

  // Basic async actions
  fetchBookshelf: async () => {
    set({ status: 'loading', error: null });
    
    try {
      const localBookshelfEntries = loadBookshelf(); // Returns BookshelfEntry[]
      
      // For now, we only have IDs from localStorage
      // Full book data would need to be fetched from your book service
      const bookIds = localBookshelfEntries.map(entry => entry.id);
      
      set({
        status: 'succeeded',
        books: [], // We don't have full book data without a proper book service
        bookIds,
        error: null
      });
    } catch (error) {
      set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to fetch bookshelf'
      });
    }
  },

  addBookToShelf: async (book) => {
    try {
      // Save to localStorage
      addBookToLocalShelf(book);
      
      const state = get();
      if (!state.bookIds.includes(book.id)) {
        set({
          books: [...state.books, book],
          bookIds: [...state.bookIds, book.id],
          error: null
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save book.'
      });
      throw error;
    }
  },

  removeBookFromShelf: async (bookId) => {
    try {
      // Remove from localStorage
      removeBookFromLocalShelf(bookId);
      
      const state = get();
      set({
        books: state.books.filter(b => b.id !== bookId),
        bookIds: state.bookIds.filter(id => id !== bookId),
        error: null
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove book.'
      });
      throw error;
    }
  },

  // Optimistic update actions for better UX
  addBookToShelfOptimistic: async (book) => {
    // Optimistic update first
    const state = get();
    if (!state.bookIds.includes(book.id)) {
      set({
        books: [...state.books, book],
        bookIds: [...state.bookIds, book.id],
        error: null
      });
    }
    
    try {
      // Save to localStorage
      addBookToLocalShelf(book);
    } catch (error) {
      // Revert on error
      const currentState = get();
      set({
        books: currentState.books.filter(b => b.id !== book.id),
        bookIds: currentState.bookIds.filter(id => id !== book.id),
        error: error instanceof Error ? error.message : 'Failed to save book.'
      });
      throw error;
    }
  },

  removeBookFromShelfOptimistic: async (bookId) => {
    const state = get();
    const book = state.books.find(b => b.id === bookId);
    
    // Optimistic update first
    set({
      books: state.books.filter(b => b.id !== bookId),
      bookIds: state.bookIds.filter(id => id !== bookId),
      error: null
    });
    
    try {
      // Remove from localStorage
      removeBookFromLocalShelf(bookId);
    } catch (error) {
      // Revert on error
      if (book) {
        const currentState = get();
        set({
          books: [...currentState.books, book],
          bookIds: [...currentState.bookIds, bookId],
          error: error instanceof Error ? error.message : 'Failed to remove book.'
        });
      }
      throw error;
    }
  },

  // Utility action to initialize bookshelf from localStorage on app start
  initializeFromLocalStorage: () => {
    try {
      const localBookshelfEntries = loadBookshelf(); // Now returns BookshelfEntry[]
      if (localBookshelfEntries.length > 0) {
        const bookIds = localBookshelfEntries.map(entry => entry.id);
        set({
          books: [], // We don't have full book data from localStorage anymore
          bookIds,
          status: 'idle', // Will need to fetch full data later
          error: null
        });
      }
    } catch (error) {
      console.warn('Failed to initialize bookshelf from localStorage:', error);
    }
  },
}));
