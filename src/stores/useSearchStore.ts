import { create } from 'zustand';
import { type BookPage } from '../types';
import { searchBooks as searchBooksApi } from '../services/bookService';

interface SearchState {
  query: string;
  results: BookPage[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface SearchActions {
  setSearchQuery: (query: string) => void;
  executeSearch: (query: string) => Promise<void>;
}

type SearchStore = SearchState & SearchActions;

export const useSearchStore = create<SearchStore>((set) => ({
  // Initial state
  query: '',
  results: [],
  status: 'idle',
  error: null,

  // Actions
  setSearchQuery: (query) => set({ query }),

  executeSearch: async (query) => {
    set({ 
      status: 'loading',
      error: null,
      results: []
    });

    try {
      const results = await searchBooksApi(query);
      set({
        status: 'succeeded',
        results
      });
    } catch (error) {
      set({
        status: 'failed',
        error: error instanceof Error ? error.message : 'An unknown search error occurred.'
      });
    }
  },
}));
