import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the user state
interface UserState {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  token: string | null;
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
export const { login, logout, updateProfile } = userSlice.actions;

// Export reducer
export default userSlice.reducer;
