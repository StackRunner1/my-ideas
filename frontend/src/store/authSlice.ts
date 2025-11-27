/**
 * Redux Auth Slice
 *
 * Manages authentication state including:
 * - User authentication status
 * - Token expiry tracking
 * - Beta access flags
 * - User profile loading state
 */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../lib/apiClient";

// Types
export interface AuthState {
  isAuthenticated: boolean;
  expiresAt: number | null; // Epoch milliseconds
  status: "idle" | "authenticated" | "guest";
  betaAccess: boolean | null;
  siteBeta: boolean | null;
  loadingProfile: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  betaAccess?: boolean;
  beta_access?: boolean;
  siteBeta?: boolean;
  site_beta?: boolean;
  createdAt?: string;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  expiresAt: null,
  status: "idle",
  betaAccess: null,
  siteBeta: null,
  loadingProfile: false,
};

// Async thunk: Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await apiClient.get<UserProfile>("/auth/me/profile");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch profile");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{ expiresAt: number }>) => {
      state.isAuthenticated = true;
      state.expiresAt = action.payload.expiresAt;
      state.status = "authenticated";
    },
    clearSession: (state) => {
      state.isAuthenticated = false;
      state.expiresAt = null;
      state.status = "guest";
      state.betaAccess = null;
      state.siteBeta = null;
      state.loadingProfile = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user profile - pending
      .addCase(fetchUserProfile.pending, (state) => {
        state.loadingProfile = true;
      })
      // Fetch user profile - fulfilled
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;

        // Handle both camelCase and snake_case responses
        const profile = action.payload;
        const betaAccess = profile.betaAccess ?? profile.beta_access ?? false;
        const siteBeta = profile.siteBeta ?? profile.site_beta ?? false;

        // Guard against stale responses overwriting betaAccess: true
        if (state.betaAccess !== true) {
          state.betaAccess = betaAccess;
        }

        state.siteBeta = siteBeta;
      })
      // Fetch user profile - rejected
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        console.error("[Auth] Failed to fetch profile:", action.payload);
      });
  },
});

// Export actions
export const { setSession, clearSession } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
