/**
 * Redux Store Configuration
 */

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import ideasReducer from "./ideasSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ideas: ideasReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: [],
      },
    }),
});

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
