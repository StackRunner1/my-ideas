/**
 * useTokenRefresh Hook
 *
 * Proactively refreshes authentication tokens before expiry.
 * Handles tab visibility changes and schedules automatic refresh.
 */

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSession, clearSession } from "../store/authSlice";
import * as authService from "../services/authService";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry
const MIN_REFRESH_INTERVAL_MS = 60 * 1000; // Don't refresh more than once per minute

/**
 * Automatically refresh tokens before they expire
 *
 * Features:
 * - Schedules refresh 5 minutes before token expiry
 * - Refreshes on tab visibility after long absence
 * - Prevents duplicate refreshes with cooldown
 * - Clears session if refresh fails
 *
 * @returns void
 */
export function useTokenRefresh(): void {
  const dispatch = useAppDispatch();
  const { isAuthenticated, expiresAt } = useAppSelector((state) => state.auth);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  // Clear any existing timeout
  const clearRefreshTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Perform token refresh
  const performRefresh = async (reason: string) => {
    const now = Date.now();

    // Prevent duplicate refreshes (cooldown check)
    if (now - lastRefreshRef.current < MIN_REFRESH_INTERVAL_MS) {
      console.log(`[Token Refresh] Skipped (cooldown) - ${reason}`);
      return;
    }

    try {
      console.log(`[Token Refresh] Starting - ${reason}`);
      const response = await authService.refreshSession();

      lastRefreshRef.current = now;
      dispatch(setSession({ expiresAt: response.expiresAt }));

      console.log(
        `[Token Refresh] Success - new expiry: ${new Date(
          response.expiresAt
        ).toISOString()}`
      );

      // Schedule next refresh
      scheduleRefresh(response.expiresAt);
    } catch (error: any) {
      console.error(`[Token Refresh] Failed - ${reason}:`, error);

      // Clear session if refresh fails (user must re-login)
      dispatch(clearSession());
    }
  };

  // Schedule refresh based on expiry time
  const scheduleRefresh = (expiry: number) => {
    clearRefreshTimeout();

    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    const timeUntilRefresh = timeUntilExpiry - REFRESH_BUFFER_MS;

    // If already expired or very close to expiry, refresh immediately
    if (timeUntilRefresh <= 0) {
      console.log(
        `[Token Refresh] Scheduling immediate refresh (expires in ${Math.round(
          timeUntilExpiry / 1000
        )}s)`
      );
      performRefresh("token near expiry");
      return;
    }

    // Schedule refresh before expiry
    console.log(
      `[Token Refresh] Scheduled in ${Math.round(
        timeUntilRefresh / 1000
      )}s (${Math.round(REFRESH_BUFFER_MS / 1000)}s buffer)`
    );

    timeoutRef.current = setTimeout(() => {
      performRefresh("scheduled refresh");
    }, timeUntilRefresh);
  };

  // Handle tab visibility changes
  useEffect(() => {
    if (!isAuthenticated || !expiresAt) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        console.log(
          `[Token Refresh] Tab became visible - expires in ${Math.round(
            timeUntilExpiry / 1000
          )}s`
        );

        // If expired or close to expiry, refresh immediately
        if (timeUntilExpiry <= REFRESH_BUFFER_MS) {
          performRefresh("tab visibility (near expiry)");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, expiresAt]);

  // Schedule refresh based on current expiry
  useEffect(() => {
    if (!isAuthenticated || !expiresAt) {
      clearRefreshTimeout();
      return;
    }

    scheduleRefresh(expiresAt);

    return () => {
      clearRefreshTimeout();
    };
  }, [isAuthenticated, expiresAt]);
}
