import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import settingsReducer from './settingsSlice';
import readingReducer from './readingSlice';
import bookshelfReducer from './bookshelfSlice';
import searchReducer from './searchSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    settings: settingsReducer,
    reading: readingReducer,
    bookshelf: bookshelfReducer,
    search: searchReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;