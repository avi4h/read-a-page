import { create } from 'zustand';
import { type BookPage } from '../types';
import * as db from '../lib/db';
import { 
  loadBookshelf, 
  addBookToLocalShelf, 
  removeBookFromLocalShelf,
  syncLocalBookshelf 
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
  
  // Internal optimistic update helpers
  addBookOptimistically: (book: BookPage) => void;
  removeBookOptimistically: (bookId: string) => void;
  revertOptimisticAdd: (book: BookPage) => void;
  revertOptimisticRemove: (book: BookPage, bookId: string) => void;
  
  // Utility actions
  clearError: () => void;
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
      await db.initDB();
      const dbBooks = await db.getBooks();
      const localBookshelfEntries = loadBookshelf(); // Now returns BookshelfEntry[]
      
      // Get the IDs from localStorage
      const localBookIds = localBookshelfEntries.map(entry => entry.id);
      
      // Filter dbBooks to only include those in the bookshelf
      const bookshelfBooks = dbBooks.filter(book => localBookIds.includes(book.id));
      
      // Use a Map to avoid duplicates based on book ID
      const bookMap = new Map<string, BookPage>();
      
      // Add books from the filtered database results
      bookshelfBooks.forEach(book => bookMap.set(book.id, book));
      
      const books = Array.from(bookMap.values());
      const bookIds = books.map(b => b.id);
      
      // Keep localStorage bookshelf in sync with what we actually found
      const foundBookIds = books.map(b => b.id);
      syncLocalBookshelf(foundBookIds);
      
      set({
        status: 'succeeded',
        books,
        bookIds,
        error: null
      });
    } catch (error) {
      // If IndexedDB fails, we can't get full book data, so show empty bookshelf
      // but we can still show the IDs for debugging
      try {
        const localBookshelfEntries = loadBookshelf();
        const bookIds = localBookshelfEntries.map(entry => entry.id);
        
        set({
          status: 'succeeded',
          books: [], // No full book data available without IndexedDB
          bookIds,
          error: null
        });
      } catch (localError) {
        set({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Failed to fetch bookshelf'
        });
      }
    }
  },

  addBookToShelf: async (book) => {
    try {
      // Save to both IndexedDB and localStorage
      await db.addBook(book);
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
      // If IndexedDB fails, try to save to localStorage only
      try {
        addBookToLocalShelf(book);
        
        const state = get();
        if (!state.bookIds.includes(book.id)) {
          set({
            books: [...state.books, book],
            bookIds: [...state.bookIds, book.id],
            error: null
          });
        }
      } catch (localError) {
        set({
          error: error instanceof Error ? error.message : 'Failed to save book.'
        });
        throw error;
      }
    }
  },

  removeBookFromShelf: async (bookId) => {
    try {
      // Remove from both IndexedDB and localStorage
      await db.deleteBook(bookId);
      removeBookFromLocalShelf(bookId);
      
      const state = get();
      set({
        books: state.books.filter(b => b.id !== bookId),
        bookIds: state.bookIds.filter(id => id !== bookId),
        error: null
      });
    } catch (error) {
      // If IndexedDB fails, try to remove from localStorage only
      try {
        removeBookFromLocalShelf(bookId);
        
        const state = get();
        set({
          books: state.books.filter(b => b.id !== bookId),
          bookIds: state.bookIds.filter(id => id !== bookId),
          error: null
        });
      } catch (localError) {
        set({
          error: error instanceof Error ? error.message : 'Failed to remove book.'
        });
        throw error;
      }
    }
  },

  // Optimistic update actions for better UX
  addBookToShelfOptimistic: async (book) => {
    const { addBookOptimistically, revertOptimisticAdd } = get();
    
    // Optimistic update first
    addBookOptimistically(book);
    
    try {
      // Save to both IndexedDB and localStorage
      await db.addBook(book);
      addBookToLocalShelf(book);
      // Success - optimistic update stays
      set({ error: null });
    } catch (error) {
      // Try localStorage only if IndexedDB fails
      try {
        addBookToLocalShelf(book);
        set({ error: null });
      } catch (localError) {
        // Revert optimistic update on error
        revertOptimisticAdd(book);
        set({
          error: error instanceof Error ? error.message : 'Failed to save book.'
        });
        throw error;
      }
    }
  },

  removeBookFromShelfOptimistic: async (bookId) => {
    const state = get();
    const book = state.books.find(b => b.id === bookId);
    const { removeBookOptimistically, revertOptimisticRemove } = get();
    
    // Optimistic update first
    removeBookOptimistically(bookId);
    
    try {
      // Remove from both IndexedDB and localStorage
      await db.deleteBook(bookId);
      removeBookFromLocalShelf(bookId);
      // Success - optimistic update stays
      set({ error: null });
    } catch (error) {
      // Try localStorage only if IndexedDB fails
      try {
        removeBookFromLocalShelf(bookId);
        set({ error: null });
      } catch (localError) {
        // Revert optimistic update on error
        if (book) {
          revertOptimisticRemove(book, bookId);
        }
        set({
          error: error instanceof Error ? error.message : 'Failed to remove book.'
        });
        throw error;
      }
    }
  },

  // Internal optimistic update helpers
  addBookOptimistically: (book) => set((state) => {
    if (!state.bookIds.includes(book.id)) {
      const newBooks = [...state.books, book];
      const newBookIds = [...state.bookIds, book.id];
      // Sync with localStorage using just the IDs
      syncLocalBookshelf(newBookIds);
      return {
        books: newBooks,
        bookIds: newBookIds
      };
    }
    return state;
  }),

  removeBookOptimistically: (bookId) => set((state) => {
    const newBooks = state.books.filter(b => b.id !== bookId);
    const newBookIds = state.bookIds.filter(id => id !== bookId);
    // Sync with localStorage using just the IDs
    syncLocalBookshelf(newBookIds);
    return {
      books: newBooks,
      bookIds: newBookIds
    };
  }),

  revertOptimisticAdd: (book) => set((state) => {
    const newBooks = state.books.filter(b => b.id !== book.id);
    const newBookIds = state.bookIds.filter(id => id !== book.id);
    // Sync with localStorage using just the IDs
    syncLocalBookshelf(newBookIds);
    return {
      books: newBooks,
      bookIds: newBookIds
    };
  }),

  revertOptimisticRemove: (book, bookId) => set((state) => {
    const newBooks = [...state.books, book];
    const newBookIds = [...state.bookIds, bookId];
    // Sync with localStorage using just the IDs
    syncLocalBookshelf(newBookIds);
    return {
      books: newBooks,
      bookIds: newBookIds
    };
  }),

  // Utility actions
  clearError: () => set({ error: null }),
  
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
