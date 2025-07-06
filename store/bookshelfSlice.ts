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

const bookshelfSlice = createSlice({
  name: 'bookshelf',
  initialState,
  reducers: {},
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
      .addCase(addBookToShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addBookToShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books.push(action.payload);
        state.bookIds.push(action.payload.id);
      })
      .addCase(addBookToShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to save book.';
      })
      .addCase(removeBookFromShelf.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeBookFromShelf.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.books = state.books.filter(b => b.id !== action.payload);
        state.bookIds = state.bookIds.filter(id => id !== action.payload);
      })
      .addCase(removeBookFromShelf.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to remove book.';
      });
  },
});

export default bookshelfSlice.reducer;