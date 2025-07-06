import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReadingSettings } from '../types';

interface SettingsState {
  reading: ReadingSettings;
}

const initialState: SettingsState = {
  reading: {
    fontSize: 'lg',
    fontFamily: 'serif',
    textAlign: 'justify',
    maxWidth: '2xl',
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateReadingSettings(state, action: PayloadAction<Partial<ReadingSettings>>) {
      state.reading = { ...state.reading, ...action.payload };
    },
  },
});

export const { updateReadingSettings } = settingsSlice.actions;
export default settingsSlice.reducer;