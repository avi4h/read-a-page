import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { type BookPage } from '../types';
import * as db from '../lib/db';

interface BookshelfState {
  books: BookPage[];
  bookIds: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BookshelfState = {
  books: [],
  bookIds: [],
  status: 'idle',
  error: null,
};

export const fetchBookshelf = createAsyncThunk('bookshelf/fetchBookshelf', async () => {
  await db.initDB();
  const books = await db.getBooks();
  const bookIds = books.map(b => b.id);
  return { books, bookIds };
});

export const addBookToShelf = createAsyncThunk('bookshelf/addBook', async (book: BookPage) => {
  await db.addBook(book);
  return book;
});

export const removeBookFromShelf = createAsyncThunk('bookshelf/removeBook', async (bookId: string) => {
  await db.deleteBook(bookId);
  return bookId;
});

// Enhanced action with optimistic updates
export const addBookToShelfOptimistic = createAsyncThunk(
  'bookshelf/addBookOptimistic',
  async (book: BookPage, { dispatch }) => {
    // Optimistic update first
    dispatch(addBookOptimistically(book));
    
    try {
      await db.addBook(book);
      return book;
    } catch (error) {
      // Revert optimistic update on error
      dispatch(revertOptimisticUpdate({ type: 'add', book }));
      throw error;
    }
  }
);

export const removeBookFromShelfOptimistic = createAsyncThunk(
  'bookshelf/removeBookOptimistic',
  async (bookId: string, { dispatch, getState }) => {
    const state = getState() as { bookshelf: BookshelfState };
    const book = state.bookshelf.books.find(b => b.id === bookId);
    
    // Optimistic update first
    dispatch(removeBookOptimistically(bookId));
    
    try {
      await db.deleteBook(bookId);
      return bookId;
    } catch (error) {
      // Revert optimistic update on error
      if (book) {
        dispatch(revertOptimisticUpdate({ type: 'remove', book, bookId }));
      }
      throw error;
    }
  }
);

const bookshelfSlice = createSlice({
  name: 'bookshelf',
  initialState,
  reducers: {
    // Optimistic updates for better UX
    addBookOptimistically: (state, action) => {
      const book = action.payload;
      if (!state.bookIds.includes(book.id)) {
        state.books.push(book);
        state.bookIds.push(book.id);
      }
    },
    removeBookOptimistically: (state, action) => {
      const bookId = action.payload;
      state.books = state.books.filter(b => b.id !== bookId);
      state.bookIds = state.bookIds.filter(id => id !== bookId);
    },
    revertOptimisticUpdate: (state, action) => {
      const { type, book, bookId } = action.payload;
      if (type === 'add') {
        state.books = state.books.filter(b => b.id !== book.id);
        state.bookIds = state.bookIds.filter(id => id !== book.id);
      } else if (type === 'remove') {
        state.books.push(book);
        state.bookIds.push(bookId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookshelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookshelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books = action.payload.books;
        state.bookIds = action.payload.bookIds;
      })
      .addCase(fetchBookshelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch bookshelf';
      })
      .addCase(addBookToShelf.pending, (_state, _action) => {
        // Don't change status to loading for individual book operations
        // Use optimistic updates instead
      })
      .addCase(addBookToShelf.fulfilled, (state, action) => {
        // Ensure the book is in the store (optimistic update should have already added it)
        if (!state.bookIds.includes(action.payload.id)) {
          state.books.push(action.payload);
          state.bookIds.push(action.payload.id);
        }
      })
      .addCase(addBookToShelf.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to save book.';
      })
      .addCase(removeBookFromShelf.pending, (_state) => {
        // Don't change status to loading for individual book operations
      })
      .addCase(removeBookFromShelf.fulfilled, (state, action) => {
        // Ensure the book is removed (optimistic update should have already removed it)
        state.books = state.books.filter(b => b.id !== action.payload);
        state.bookIds = state.bookIds.filter(id => id !== action.payload);
      })
      .addCase(removeBookFromShelf.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to remove book.';
      });
  },
});

export const { addBookOptimistically, removeBookOptimistically, revertOptimisticUpdate } = bookshelfSlice.actions;
export default bookshelfSlice.reducer;