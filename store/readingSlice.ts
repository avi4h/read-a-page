import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { type BookPage } from '../types';
import { DUMMY_BOOKS } from '../lib/dummyData';
import { RootState } from './store';

interface ReadingState {
  allBooks: BookPage[];
  currentBook: BookPage | null;
  currentIndex: number;
  isRevealed: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReadingState = {
  allBooks: DUMMY_BOOKS,
  currentBook: null,
  currentIndex: -1,
  isRevealed: false,
  status: 'idle',
  error: null,
};

export const changeBook = createAsyncThunk(
    'reading/changeBook',
    async (newIndex: number, { getState }) => {
        const { reading } = getState() as RootState;
        const clampedIndex = (newIndex + reading.allBooks.length) % reading.allBooks.length;
        // Simulate network delay to allow for fade-out transition
        await new Promise(resolve => setTimeout(resolve, 300)); 
        return { book: reading.allBooks[clampedIndex], index: clampedIndex };
    }
);

const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    loadInitialBook: (state) => {
        if (state.allBooks.length > 0 && state.currentIndex === -1) {
            const randomIndex = Math.floor(Math.random() * state.allBooks.length);
            state.currentIndex = randomIndex;
            state.currentBook = state.allBooks[randomIndex];
            state.isRevealed = false;
            state.status = 'succeeded';
        }
    },
    setBookById: (state, action: PayloadAction<string>) => {
      const bookId = action.payload;
      const foundIndex = state.allBooks.findIndex(b => b.id === bookId);
      if (foundIndex !== -1) {
        state.currentIndex = foundIndex;
        state.currentBook = state.allBooks[foundIndex];
        state.isRevealed = false;
        state.status = 'succeeded';
        state.error = null;
      } else {
        state.status = 'failed';
        state.error = `The book with ID "${bookId}" could not be found. It might be a broken or outdated link.`;
        state.currentBook = null;
        state.currentIndex = -1;
      }
    },
    revealBook: (state) => {
      state.isRevealed = true;
    },
    hideBookInfo: (state) => {
      state.isRevealed = false;
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(changeBook.pending, (state) => {
            state.status = 'loading';
        })
        .addCase(changeBook.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.isRevealed = false;
            state.currentBook = action.payload.book;
            state.currentIndex = action.payload.index;
        })
        .addCase(changeBook.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message ?? "Failed to load book.";
        })
  }
});

export const { loadInitialBook, setBookById, revealBook, hideBookInfo } = readingSlice.actions;
export default readingSlice.reducer;