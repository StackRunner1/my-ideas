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

    // Check if error is 401 (Unauthorized) and we should attempt token refresh
    // Conditions that must ALL be true:
    // 1. Status is 401 (token expired or invalid)
    // 2. We have an original request to retry
    // 3. Request hasn't been retried yet (prevents infinite loops)
    // 4. Auto-refresh is enabled globally
    // 5. This isn't the refresh endpoint itself (prevent recursive refresh)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      allowAutoRefresh &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      // Check refresh cooldown - prevent refresh spam
      // If multiple requests fail simultaneously (e.g., user opens multiple tabs),
      // we don't want to trigger multiple refresh calls in quick succession
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
        console.warn("[API Client] Refresh cooldown active, rejecting request");
        return Promise.reject(error);
      }

      // Mark this specific request as retried to prevent infinite retry loops
      originalRequest._retry = true;

      // Coalesce multiple refresh attempts into a single refresh call
      // If refresh is already in progress, wait for it instead of starting another
      // This handles the case where multiple API calls fail at the same time
      if (isRefreshing && refreshPromise) {
        await refreshPromise; // Wait for ongoing refresh to complete
        // After refresh completes, retry the original request with new token
        return apiClient(originalRequest);
      }

      // Start refresh process - this will be shared across all pending requests
      isRefreshing = true;
      lastRefreshTime = now;

      // Create refresh promise that other pending requests can await
      // This ensures only one refresh call is made even if 10 requests fail simultaneously
      refreshPromise = (async () => {
        try {
          console.log("[API Client] Attempting token refresh...");

          // Call backend refresh endpoint
          // withCredentials: true ensures httpOnly refresh_token cookie is sent
          // Backend validates refresh_token cookie and sets new access_token/refresh_token cookies
          const refreshResponse = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          );

          // Backend automatically sets new httpOnly cookies on the response
          // We don't need to manually extract or store tokens - they're in cookies
          // The browser will automatically send these cookies on the next request
          console.log("[API Client] Token refreshed successfully");

          // Note: We intentionally don't update inMemoryToken here
          // Tokens are stored in httpOnly cookies (secure, not accessible to JavaScript)
          // If your backend returns a new access_token in the response body,
          // you could optionally store it: setAuthToken(refreshResponse.data.accessToken)
          // But for httpOnly cookie strategy, this isn't necessary
        } catch (refreshError) {
          console.error("[API Client] Token refresh failed:", refreshError);

          // Clear in-memory token on refresh failure
          // User will need to log in again
          setAuthToken(null);

          // Reject with original error to propagate to caller
          throw refreshError;
        } finally {
          // Clean up refresh state whether success or failure
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
