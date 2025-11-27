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
    const response = await apiClient.post<AuthResponse>(
      "/auth/signup",
      credentials
    );
    return response.data;
  } catch (error: any) {
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
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  } catch (error: any) {
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
    const response = await apiClient.post<{ message: string }>("/auth/logout");
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
      "/auth/refresh"
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
    const response = await apiClient.get<UserData>("/auth/me");
    return response.data;
  } catch (error: any) {
    // 401 is expected if not authenticated
    if (error.response?.status === 401) {
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
    const response = await apiClient.get("/auth/me/profile");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.detail || "Failed to fetch profile";
    throw new Error(message);
  }
}
