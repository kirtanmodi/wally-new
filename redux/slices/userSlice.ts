import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
  authProvider: "email" | "google" | "apple" | null;
  profile: {
    fullName: string | null;
    avatar: string | null;
    preferences: Record<string, any>;
  };
}

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

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    resetUser: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.username = null;
      state.email = null;
      state.token = null;
      state.authProvider = null;
      state.profile = {
        fullName: null,
        avatar: null,
        preferences: {},
      };
    },
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

      state.profile = {
        ...state.profile,
        fullName: state.profile.fullName || null,
        avatar: state.profile.avatar || null,
        preferences: state.profile.preferences || {},
      };
    },
    oauthLogin: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        username?: string;
        fullName: string;
        avatar: string;
        token: string;
        provider: "google" | "apple";
      }>
    ) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.username = action.payload.username || action.payload.email.split("@")[0];
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.authProvider = action.payload.provider;
      state.profile.fullName = action.payload.fullName;
      state.profile.avatar = action.payload.avatar;
      state.profile.preferences = state.profile.preferences || {};
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.username = null;
      state.email = null;
      state.token = null;
      state.authProvider = null;
      state.profile = {
        fullName: null,
        avatar: null,
        preferences: {},
      };
    },
    updateProfile: (
      state,
      action: PayloadAction<{
        fullName?: string;
        avatar?: string;
        preferences?: Record<string, any>;
      }>
    ) => {
      if (!state.profile) {
        state.profile = {
          fullName: null,
          avatar: null,
          preferences: {},
        };
      }

      if (action.payload.fullName !== undefined) {
        state.profile.fullName = action.payload.fullName;
      }
      if (action.payload.avatar !== undefined) {
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

export const { login, oauthLogin, logout, updateProfile, resetUser, setIsAuthenticated } = userSlice.actions;

// Keep the googleLogin action for backward compatibility
export const googleLogin = oauthLogin;

export const selectUser = (state: RootState) => state.user;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectUserId = (state: RootState) => state.user.userId;
export const selectUsername = (state: RootState) => state.user.username;
export const selectUserEmail = (state: RootState) => state.user.email;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserFullName = (state: RootState) => state.user.profile?.fullName;
export const selectUserAvatar = (state: RootState) => state.user.profile?.avatar;
export const selectUserPreferences = (state: RootState) => state.user.profile?.preferences;
export const selectAuthProvider = (state: RootState) => state.user.authProvider;

export default userSlice.reducer;
