/**
 * Enhanced Axios API Client with Auto-Refresh
 *
 * Features:
 * - httpOnly cookie support for secure token storage
 * - Automatic token refresh on 401 errors
 * - In-memory token storage for Authorization headers
 * - Request/response interceptors
 * - Refresh cooldown to prevent abuse
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Configuration
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const TIMEOUT = 30000; // 30 seconds
const REFRESH_COOLDOWN_MS = 5000; // 5 seconds

// In-memory token storage
let inMemoryToken: string | null = null;
let allowAutoRefresh = true;
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
let lastRefreshTime = 0;

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true, // CRITICAL: enables httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Sanity check for base URL
if (!BASE_URL.includes("/api/v") && !BASE_URL.includes("/v")) {
  console.warn(
    "[API Client] Base URL does not contain version segment (e.g., /api/v1). " +
      "Ensure VITE_API_BASE_URL is correctly configured."
  );
}

/**
 * Set the in-memory authentication token
 * This token will be sent as Authorization: Bearer header
 *
 * @param token - JWT token or null to clear
 */
export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

/**
 * Toggle automatic token refresh behavior
 *
 * @param allow - Whether to allow auto-refresh on 401
 */
export function setAllowAutoRefresh(allow: boolean): void {
  allowAutoRefresh = allow;
}

/**
 * Get current in-memory token (for debugging)
 */
export function getAuthToken(): string | null {
  return inMemoryToken;
}

// Request Interceptor: Add Authorization header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Authorization header if token exists
    if (inMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and auto-refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Successful response, return as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we should attempt refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      allowAutoRefresh &&
      !originalRequest.url?.includes("/auth/refresh") // Don't retry refresh endpoint itself
    ) {
      // Check refresh cooldown
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
        console.warn("[API Client] Refresh cooldown active, rejecting request");
        return Promise.reject(error);
      }

      // Mark request as retried
      originalRequest._retry = true;

      // Coalesce multiple refresh attempts
      if (isRefreshing && refreshPromise) {
        await refreshPromise;
        // After refresh completes, retry original request
        return apiClient(originalRequest);
      }

      // Start refresh process
      isRefreshing = true;
      lastRefreshTime = now;

      refreshPromise = (async () => {
        try {
          console.log("[API Client] Attempting token refresh...");

          // Call refresh endpoint (uses httpOnly refresh_token cookie)
          const refreshResponse = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          // Backend sets new cookies automatically, no need to extract tokens
          console.log("[API Client] Token refreshed successfully");

          // Note: We don't update inMemoryToken here because the backend
          // will set httpOnly cookies. The next request will use the cookie.
          // If you have access to the new token in the response, you could set it:
          // if (refreshResponse.data.accessToken) {
          //   setAuthToken(refreshResponse.data.accessToken);
          // }
        } catch (refreshError) {
          console.error("[API Client] Token refresh failed:", refreshError);

          // Clear token on refresh failure
          setAuthToken(null);

          // Reject with original error
          throw refreshError;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      await refreshPromise;

      // Retry original request with new token
      return apiClient(originalRequest);
    }

    // Not a 401 or already retried, reject
    return Promise.reject(error);
  }
);

export default apiClient;
