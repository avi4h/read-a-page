import { create } from 'zustand';
import { type BookPage } from '../types';
import { BOOKS_DATA } from '../lib/data';

interface ReadingState {
  allBooks: BookPage[];
  currentBook: BookPage | null;
  currentIndex: number;
  isRevealed: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface ReadingActions {
  loadInitialBook: () => void;
  setBookById: (bookId: string) => void;
  revealBook: () => void;
  hideBookInfo: () => void;
}

type ReadingStore = ReadingState & ReadingActions;

export const useReadingStore = create<ReadingStore>((set) => ({
  // Initial state
  allBooks: BOOKS_DATA,
  currentBook: null,
  currentIndex: -1,
  isRevealed: false,
  status: 'idle',
  error: null,

  // Actions
  loadInitialBook: () => set((state) => {
    if (state.allBooks.length > 0 && state.currentIndex === -1) {
      const randomIndex = Math.floor(Math.random() * state.allBooks.length);
      return {
        currentIndex: randomIndex,
        currentBook: state.allBooks[randomIndex],
        isRevealed: false,
        status: 'succeeded' as const,
      };
    }
    return state;
  }),

  setBookById: (bookId) => set((state) => {
    const foundIndex = state.allBooks.findIndex(b => b.id === bookId);
    if (foundIndex !== -1) {
      return {
        currentIndex: foundIndex,
        currentBook: state.allBooks[foundIndex],
        isRevealed: false,
        status: 'succeeded' as const,
        error: null,
      };
    } else {
      return {
        status: 'failed' as const,
        error: `The book with ID "${bookId}" could not be found. It might be a broken or outdated link.`,
        currentBook: null,
        currentIndex: -1,
      };
    }
  }),

  revealBook: () => set({ isRevealed: true }),

  hideBookInfo: () => set({ isRevealed: false }),
}));
