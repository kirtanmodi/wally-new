import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define a type for the user state
interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
  authProvider: "email" | "google" | null;
  profile: {
    fullName: string | null;
    avatar: string | null;
    preferences: Record<string, any>;
  };
}

// Define the initial state
const initialState: UserState = {
  isAuthenticated: false,
  userId: null,
  username: null,
  email: null,
  token: null,
  authProvider: null,
  profile: {
    fullName: null,
    avatar: null,
    preferences: {},
  },
};

// Create slice
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        userId: string;
        username: string;
        email: string;
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.authProvider = "email";
    },
    googleLogin: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        fullName: string;
        avatar: string;
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.username = action.payload.email.split("@")[0];
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.authProvider = "google";
      state.profile.fullName = action.payload.fullName;
      state.profile.avatar = action.payload.avatar;
    },
    logout: (state) => {
      return initialState;
    },
    updateProfile: (
      state,
      action: PayloadAction<{
        fullName?: string;
        avatar?: string;
        preferences?: Record<string, any>;
      }>
    ) => {
      if (action.payload.fullName) {
        state.profile.fullName = action.payload.fullName;
      }
      if (action.payload.avatar) {
        state.profile.avatar = action.payload.avatar;
      }
      if (action.payload.preferences) {
        state.profile.preferences = {
          ...state.profile.preferences,
          ...action.payload.preferences,
        };
      }
    },
  },
});

// Export actions
export const { login, googleLogin, logout, updateProfile } = userSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.user;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectUsername = (state: RootState) => state.user.username;
export const selectUserEmail = (state: RootState) => state.user.email;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserFullName = (state: RootState) => state.user.profile.fullName;
export const selectUserAvatar = (state: RootState) => state.user.profile.avatar;
export const selectUserPreferences = (state: RootState) => state.user.profile.preferences;
export const selectAuthProvider = (state: RootState) => state.user.authProvider;

// Export reducer
export default userSlice.reducer;
