import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define a type for the app state
interface AppState {
  theme: "light" | "dark" | "system";
  language: string;
  counter: number;
  appSettings: {
    notifications: boolean;
    sounds: boolean;
    haptics: boolean;
  };
}

// Define the initial state
const initialState: AppState = {
  theme: "system",
  language: "en",
  counter: 0,
  appSettings: {
    notifications: true,
    sounds: true,
    haptics: true,
  },
};

// Create slice
export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    incrementCounter: (state) => {
      state.counter += 1;
    },
    decrementCounter: (state) => {
      state.counter -= 1;
    },
    resetCounter: (state) => {
      state.counter = 0;
    },
    setCounter: (state, action: PayloadAction<number>) => {
      state.counter = action.payload;
    },
    updateAppSettings: (
      state,
      action: PayloadAction<{
        notifications?: boolean;
        sounds?: boolean;
        haptics?: boolean;
      }>
    ) => {
      state.appSettings = {
        ...state.appSettings,
        ...action.payload,
      };
    },
  },
});

// Export actions
export const { setTheme, setLanguage, incrementCounter, decrementCounter, resetCounter, setCounter, updateAppSettings } = appSlice.actions;

// Export reducer
export default appSlice.reducer;

// Export selectors
export const selectApp = (state: RootState) => state.app;
export const selectTheme = (state: RootState) => state.app.theme;
export const selectLanguage = (state: RootState) => state.app.language;
export const selectCounter = (state: RootState) => state.app.counter;
export const selectAppSettings = (state: RootState) => state.app.appSettings;
