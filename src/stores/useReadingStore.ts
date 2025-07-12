import { create } from 'zustand';
import { type BookPage } from '../types';
import { getAllBooks, getAllBookIds } from '../services/bookService';

interface ReadingState {
  allBooks: BookPage[];
  allBookIds: string[];
  currentBook: BookPage | null;
  currentIndex: number;
  isRevealed: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface ReadingActions {
  initializeStore: () => Promise<void>;
  loadInitialBook: () => void;
  setBookById: (bookId: string) => void;
  revealBook: () => void;
  hideBookInfo: () => void;
}

type ReadingStore = ReadingState & ReadingActions;

export const useReadingStore = create<ReadingStore>((set, get) => ({
  // Initial state
  allBooks: [],
  allBookIds: [],
  currentBook: null,
  currentIndex: -1,
  isRevealed: false,
  status: 'idle',
  error: null,

  // Actions
  initializeStore: async () => {
    const state = get();
    if (state.allBooks.length > 0) return; // Already initialized
    
    set({ status: 'loading' });
    
    try {
      const [books, bookIds] = await Promise.all([
        getAllBooks(),
        getAllBookIds()
      ]);
      
      set({
        allBooks: books,
        allBookIds: bookIds,
        status: 'succeeded',
        error: null
      });
      
      // Load initial book if none is selected
      if (!state.currentBook && books.length > 0) {
        const randomIndex = Math.floor(Math.random() * books.length);
        set({
          currentIndex: randomIndex,
          currentBook: books[randomIndex],
          isRevealed: false,
        });
      }
    } catch (error) {
      console.error('Failed to initialize reading store:', error);
      set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to load books'
      });
    }
  },

  loadInitialBook: () => {
    const state = get();
    if (state.allBooks.length > 0 && state.currentIndex === -1) {
      const randomIndex = Math.floor(Math.random() * state.allBooks.length);
      set({
        currentIndex: randomIndex,
        currentBook: state.allBooks[randomIndex],
        isRevealed: false,
        status: 'succeeded' as const,
      });
    }
  },

  setBookById: (bookId) => {
    const state = get();
    const foundIndex = state.allBooks.findIndex(b => b.id === bookId);
    if (foundIndex !== -1) {
      set({
        currentIndex: foundIndex,
        currentBook: state.allBooks[foundIndex],
        isRevealed: false,
        status: 'succeeded' as const,
        error: null,
      });
    } else {
      set({
        status: 'failed' as const,
        error: `The book with ID "${bookId}" could not be found. It might be a broken or outdated link.`,
        currentBook: null,
        currentIndex: -1,
      });
    }
  },

  revealBook: () => set({ isRevealed: true }),

  hideBookInfo: () => set({ isRevealed: false }),
}));
