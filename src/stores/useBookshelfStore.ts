import { create } from 'zustand';
import { type BookPage } from '../types';
import * as db from '../lib/db';

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
      const books = await db.getBooks();
      const bookIds = books.map(b => b.id);
      
      set({
        status: 'succeeded',
        books,
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
      await db.addBook(book);
      
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
      await db.deleteBook(bookId);
      
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
    const { addBookOptimistically, revertOptimisticAdd } = get();
    
    // Optimistic update first
    addBookOptimistically(book);
    
    try {
      await db.addBook(book);
      // Success - optimistic update stays
      set({ error: null });
    } catch (error) {
      // Revert optimistic update on error
      revertOptimisticAdd(book);
      set({
        error: error instanceof Error ? error.message : 'Failed to save book.'
      });
      throw error;
    }
  },

  removeBookFromShelfOptimistic: async (bookId) => {
    const state = get();
    const book = state.books.find(b => b.id === bookId);
    const { removeBookOptimistically, revertOptimisticRemove } = get();
    
    // Optimistic update first
    removeBookOptimistically(bookId);
    
    try {
      await db.deleteBook(bookId);
      // Success - optimistic update stays
      set({ error: null });
    } catch (error) {
      // Revert optimistic update on error
      if (book) {
        revertOptimisticRemove(book, bookId);
      }
      set({
        error: error instanceof Error ? error.message : 'Failed to remove book.'
      });
      throw error;
    }
  },

  // Internal optimistic update helpers
  addBookOptimistically: (book) => set((state) => {
    if (!state.bookIds.includes(book.id)) {
      return {
        books: [...state.books, book],
        bookIds: [...state.bookIds, book.id]
      };
    }
    return state;
  }),

  removeBookOptimistically: (bookId) => set((state) => ({
    books: state.books.filter(b => b.id !== bookId),
    bookIds: state.bookIds.filter(id => id !== bookId)
  })),

  revertOptimisticAdd: (book) => set((state) => ({
    books: state.books.filter(b => b.id !== book.id),
    bookIds: state.bookIds.filter(id => id !== book.id)
  })),

  revertOptimisticRemove: (book, bookId) => set((state) => ({
    books: [...state.books, book],
    bookIds: [...state.bookIds, bookId]
  })),

  // Utility actions
  clearError: () => set({ error: null }),
}));
