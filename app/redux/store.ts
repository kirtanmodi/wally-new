import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";

// Import reducers (will be created in next steps)
import appReducer from "./slices/appSlice";
import userReducer from "./slices/userSlice";

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  // Whitelist (save specific reducers)
  whitelist: ["user", "app"],
  // Blacklist (don't save specific reducers)
  // blacklist: [],
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  app: appReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
