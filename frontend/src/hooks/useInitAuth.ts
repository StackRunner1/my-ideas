/**
 * useInitAuth Hook
 *
 * Restores user session on app initialization.
 * Handles session validation, auto-refresh, and profile loading.
 */

import { useEffect, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { setSession, clearSession, fetchUserProfile } from "../store/authSlice";
import * as authService from "../services/authService";

export interface InitAuthState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initialize authentication on app mount
 *
 * Flow:
 * 1. Check for existing session via /auth/me
 * 2. If valid, restore session and fetch profile
 * 3. If expired, attempt auto-refresh
 * 4. If no session or refresh fails, set as guest
 *
 * @returns InitAuthState with loading and error states
 */
export function useInitAuth(): InitAuthState {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<InitAuthState>({
    isInitialized: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        // Step 1: Check for existing session
        const userData = await authService.checkAuthStatus();

        if (!isMounted) return;

        if (userData) {
          // Session is valid, extract token expiry from JWT
          const token = userData.user.token;
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          const expiresAt = tokenPayload.exp * 1000; // Convert to milliseconds

          // Restore session in Redux
          dispatch(setSession({ expiresAt }));

          // Load user profile
          dispatch(fetchUserProfile());

          setState({
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        } else {
          // No active session, try to refresh
          try {
            const refreshData = await authService.refreshSession();

            if (!isMounted) return;

            // Refresh succeeded, restore session
            dispatch(setSession({ expiresAt: refreshData.expiresAt }));
            dispatch(fetchUserProfile());

            setState({
              isInitialized: true,
              isLoading: false,
              error: null,
            });
          } catch (refreshError) {
            // Refresh failed, clear any stale state and continue as guest
            if (!isMounted) return;

            dispatch(clearSession());

            setState({
              isInitialized: true,
              isLoading: false,
              error: null, // Not an error - just no session
            });
          }
        }
      } catch (error: any) {
        // Network error or unexpected failure
        if (!isMounted) return;

        console.error("Auth initialization error:", error);

        // Clear any partial state
        dispatch(clearSession());

        setState({
          isInitialized: true,
          isLoading: false,
          error: error.message || "Failed to initialize authentication",
        });
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return state;
}
