/**
 * Enhanced Axios API Client with Auto-Refresh and Request Tracing
 *
 * Features:
 * - httpOnly cookie support for secure token storage
 * - Automatic token refresh on 401 errors
 * - In-memory token storage for Authorization headers
 * - Request/response interceptors
 * - Refresh cooldown to prevent abuse
 * - Request ID generation for end-to-end tracing
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { logger } from "./logger";
import { parseAPIError } from "./errorHandler";

/**
 * Generate a unique UUID v4 for request tracing
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Configuration
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const TIMEOUT = 30000; // 30 seconds
const REFRESH_COOLDOWN_MS = 5000; // 5 seconds
const MAX_RETRIES = 2; // Maximum retry attempts for 5xx errors
const RETRY_DELAY_MS = 1000; // Initial retry delay (exponential backoff)

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

// Request Interceptor: Add Authorization header and request ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate and add request ID for tracing
    const requestId = generateUUID();
    config.headers["x-request-id"] = requestId;

    // Log request in development
    logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      requestId,
      method: config.method,
      url: config.url,
    });

    // Add Authorization header if token exists
    if (inMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => {
    logger.error("API Request Error", { error: error.message });
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and auto-refresh, log response
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    const requestId = response.headers["x-request-id"];
    const duration = response.headers["x-duration-ms"];
    logger.debug(
      `API Response: ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`,
      {
        requestId,
        status: response.status,
        durationMs: duration,
      }
    );
    return response;
  },
  async (error: AxiosError) => {
    // Log error details in development
    const parsedError = parseAPIError(error);
    logger.error("API Error", {
      code: parsedError.code,
      message: parsedError.message,
      requestId: parsedError.requestId,
      status: error.response?.status,
    });

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Handle retry logic for 5xx errors and network timeouts
    // Only retry on server errors (5xx) and network timeouts, NOT on client errors (4xx)
    const shouldRetry =
      originalRequest &&
      !originalRequest._retry &&
      ((error.response?.status && error.response.status >= 500) ||
        error.code === "ECONNABORTED" ||
        error.message.includes("timeout"));

    if (shouldRetry) {
      const retryCount = (originalRequest._retryCount || 0) + 1;

      if (retryCount <= MAX_RETRIES) {
        originalRequest._retryCount = retryCount;
        originalRequest._retry = true;

        // Calculate exponential backoff delay
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount - 1);

        logger.warn(
          `Retrying request (attempt ${retryCount}/${MAX_RETRIES}) after ${delay}ms`,
          {
            url: originalRequest.url,
            method: originalRequest.method,
            status: error.response?.status,
          }
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Retry the request
        return apiClient(originalRequest);
      } else {
        logger.error("Max retry attempts exceeded", {
          url: originalRequest.url,
          method: originalRequest.method,
        });
      }
    }

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
      // If multiple requests fail simultaneously (e.g., user opens multiple tabs),
      // we don't want to trigger multiple refresh calls in quick succession
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN_MS) {
        logger.warn("Refresh cooldown active, rejecting request");
        return Promise.reject(error);
      }/ Mark this specific request as retried to prevent infinite retry loops
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
      // Create refresh promise that other pending requests can await
      // This ensures only one refresh call is made even if 10 requests fail simultaneously
      refreshPromise = (async () => {
        try {
          logger.info("Attempting token refresh...");

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
          logger.info("Token refreshed successfully");

          // Note: We intentionally don't update inMemoryToken here
          // Tokens are stored in httpOnly cookies (secure, not accessible to JavaScript)
          // If your backend returns a new access_token in the response body,
          // you could optionally store it: setAuthToken(refreshResponse.data.accessToken)
          // But for httpOnly cookie strategy, this isn't necessary
        } catch (refreshError) {
          logger.error("Token refresh failed", {
            error: refreshError instanceof Error ? refreshError.message : String(refreshError),
          });

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
      })(); refreshPromise;

      // Retry original request with new token
      return apiClient(originalRequest);
    }

    // Not a 401 or already retried, reject
    return Promise.reject(error);
  }
);

export default apiClient;
