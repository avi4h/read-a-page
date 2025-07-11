import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { type BookPage } from '../types';
import { searchBooks as searchBooksApi } from '../services/bookService';

interface SearchState {
  query: string;
  results: BookPage[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SearchState = {
  query: '',
  results: [],
  status: 'idle',
  error: null,
};

export const executeSearch = createAsyncThunk('search/execute', async (query: string) => {
  const results = await searchBooksApi(query);
  return results;
});

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(executeSearch.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.results = [];
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.results = action.payload;
      })
      .addCase(executeSearch.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'An unknown search error occurred.';
      })
  }
});

export const { setSearchQuery } = searchSlice.actions;
export default searchSlice.reducer;