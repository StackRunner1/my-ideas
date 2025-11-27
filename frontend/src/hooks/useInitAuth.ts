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
          // Session is valid - user has active cookies and backend validated them
          // Extract token expiry from JWT payload to enable frontend-side scheduling
          const token = userData.user.token;

          // JWT structure: header.payload.signature
          // Split on '.', take middle part (payload), decode from base64
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));

          // JWT exp claim is in seconds since epoch, convert to milliseconds
          // This will be used by useTokenRefresh to schedule proactive refresh
          const expiresAt = tokenPayload.exp * 1000;

          // Restore session in Redux - updates isAuthenticated to true
          // This triggers Navigation component to show authenticated UI
          dispatch(setSession({ expiresAt }));

          // Load user profile data (betaAccess, siteBeta flags)
          // This is async but we don't await it - profile loads in background
          dispatch(fetchUserProfile());

          setState({
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        } else {
          // No active session from /auth/me - could be expired or never logged in
          // Try to refresh using httpOnly refresh_token cookie (if it exists)
          try {
            const refreshData = await authService.refreshSession();

            if (!isMounted) return; // Component unmounted during refresh

            // Refresh succeeded - backend had valid refresh_token cookie
            // User was logged in before, session just expired, now restored
            dispatch(setSession({ expiresAt: refreshData.expiresAt }));
            dispatch(fetchUserProfile());

            setState({
              isInitialized: true,
              isLoading: false,
              error: null,
            });
          } catch (refreshError) {
            // Refresh failed - no valid refresh_token cookie or token invalid
            // This is expected for users who have never logged in
            // Clear any stale Redux state and continue as guest
            if (!isMounted) return;

            dispatch(clearSession());

            setState({
              isInitialized: true,
              isLoading: false,
              error: null, // Not an error - just no session (user is guest)
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
