/**
 * Authentication Service Layer
 *
 * Service functions for signup, login, logout, and session management.
 * Uses the enhanced API client with auto-refresh capabilities.
 */

import apiClient from "../lib/apiClient";

// Types
export interface SignupCredentials {
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  expiresAt: number; // Epoch milliseconds
  accessToken: string; // JWT token for Authorization header
}

export interface UserData {
  user: {
    id: string;
    email: string;
    token: string;
  };
}

/**
 * Sign up a new user
 * Creates both user and agent-user accounts on the backend
 *
 * @param credentials - Email and password
 * @returns Auth response with user data and expiry
 * @throws Error if signup fails
 */
export async function signup(
  credentials: SignupCredentials
): Promise<AuthResponse> {
  try {
    // Use shorter timeout for auth requests (10 seconds)
    const response = await apiClient.post<AuthResponse>(
      "/api/v1/auth/signup",
      credentials,
      { timeout: 10000 }
    );
    return response.data;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        "Signup request timed out. Please check your connection and try again."
      );
    }
    // Handle network errors
    if (!error.response) {
      throw new Error("Cannot reach server. Please check your connection.");
    }
    const message = error.response?.data?.detail || "Signup failed";
    throw new Error(message);
  }
}

/**
 * Log in an existing user
 *
 * @param credentials - Email and password
 * @returns Auth response with user data and expiry
 * @throws Error if login fails
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    // Use shorter timeout for auth requests (10 seconds)
    const response = await apiClient.post<AuthResponse>(
      "/api/v1/auth/login",
      credentials,
      { timeout: 10000 }
    );
    return response.data;
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      throw new Error(
        "Login request timed out. Please check your connection and try again."
      );
    }
    // Handle network errors
    if (!error.response) {
      throw new Error("Cannot reach server. Please check your connection.");
    }
    const message = error.response?.data?.detail || "Login failed";
    throw new Error(message);
  }
}

/**
 * Log out the current user
 * Clears session cookies and revokes refresh token server-side
 *
 * @returns Success status
 * @throws Error if logout fails (though this shouldn't prevent local cleanup)
 */
export async function logout(): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<{ message: string }>(
      "/api/v1/auth/logout"
    );
    return response.data;
  } catch (error: any) {
    // Even if backend fails, we should clear local state
    console.error("Logout error:", error);
    return { message: "Logged out (with errors)" };
  }
}

/**
 * Refresh the current session
 * Uses httpOnly refresh_token cookie to get new access token
 *
 * @returns New expiry timestamp
 * @throws Error if refresh fails
 */
export async function refreshSession(): Promise<{ expiresAt: number }> {
  try {
    const response = await apiClient.post<{ expiresAt: number }>(
      "/api/v1/auth/refresh"
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || "Session refresh failed";
    throw new Error(message);
  }
}

/**
 * Check current authentication status
 * Returns user data if authenticated, null if not
 *
 * @returns User data or null
 */
export async function checkAuthStatus(): Promise<UserData | null> {
  try {
    const response = await apiClient.get<UserData>("/api/v1/auth/me");
    return response.data;
  } catch (error: any) {
    // 401 is expected if not authenticated
    if (error.response?.status === 401) {
      return null;
    }

    // Network errors, timeouts, or backend unavailable - treat as not authenticated
    // This prevents the app from hanging when backend is slow/unreachable
    if (
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.message?.includes("timeout")
    ) {
      console.warn(
        "[authService] Backend unavailable or timeout, treating as unauthenticated:",
        error.message
      );
      return null;
    }

    throw error;
  }
}

/**
 * Get user profile with metadata
 *
 * @returns User profile data
 * @throws Error if fetch fails
 */
export async function getUserProfile(): Promise<any> {
  try {
    const response = await apiClient.get("/api/v1/auth/me/profile");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || "Failed to fetch profile";
    throw new Error(message);
  }
}
