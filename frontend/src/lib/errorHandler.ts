/**
 * Error handling utilities for API responses
 *
 * Extracts user-friendly messages from standardized error responses.
 */

import { AxiosError } from "axios";
import { logger } from "./logger";

/**
 * Standardized error response shape from backend
 */
export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    request_id?: string;
  };
}

/**
 * Parsed error information for UI display
 */
export interface ParsedError {
  message: string;
  code: string;
  requestId?: string;
  details?: Record<string, any>;
}

/**
 * Check if error response matches standardized API error format
 */
function isAPIErrorResponse(data: any): data is APIErrorResponse {
  return (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "object" &&
    "code" in data.error &&
    "message" in data.error
  );
}

/**
 * Extract user-friendly error message from API error response
 *
 * @param error - Axios error or any error object
 * @returns Parsed error information
 */
export function parseAPIError(error: unknown): ParsedError {
  // Handle Axios errors
  if (error instanceof Error && "isAxiosError" in error) {
    const axiosError = error as AxiosError;

    // Check if response has standardized error format
    if (
      axiosError.response?.data &&
      isAPIErrorResponse(axiosError.response.data)
    ) {
      const errorData = axiosError.response.data.error;

      // Log error details in development
      logger.error("API Error", {
        code: errorData.code,
        message: errorData.message,
        requestId: errorData.request_id,
        details: errorData.details,
      });

      return {
        message: errorData.message,
        code: errorData.code,
        requestId: errorData.request_id,
        details: errorData.details,
      };
    }

    // Fallback for non-standardized errors
    return {
      message:
        axiosError.response?.statusText ||
        axiosError.message ||
        "An unexpected error occurred",
      code: `http_${axiosError.response?.status || "unknown"}`,
      requestId: axiosError.response?.headers?.["x-request-id"],
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "unknown_error",
    };
  }

  // Handle unknown error types
  return {
    message: "An unexpected error occurred",
    code: "unknown_error",
  };
}

/**
 * Get user-friendly error message for display in UI
 *
 * @param error - Error object
 * @param includeRequestId - Whether to append request ID to message
 * @returns Formatted error message
 */
export function getErrorMessage(
  error: unknown,
  includeRequestId = true
): string {
  const parsed = parseAPIError(error);

  if (includeRequestId && parsed.requestId) {
    return `${parsed.message} (Request ID: ${parsed.requestId})`;
  }

  return parsed.message;
}

/**
 * HTTP status code descriptions for educational purposes
 */
export const HTTP_STATUS_DESCRIPTIONS: Record<number, string> = {
  200: "Success - Request completed successfully",
  201: "Created - Resource created successfully",
  400: "Bad Request - Malformed request or missing required fields",
  401: "Unauthorized - Authentication required or token invalid/expired",
  403: "Forbidden - Authenticated but insufficient permissions",
  404: "Not Found - Requested resource does not exist",
  422: "Unprocessable Entity - Request validation failed",
  500: "Server Error - Internal server error, please try again later",
  502: "Bad Gateway - Server communication error",
  503: "Service Unavailable - Server temporarily unavailable",
};

/**
 * Get description for HTTP status code
 */
export function getStatusDescription(statusCode: number): string {
  return (
    HTTP_STATUS_DESCRIPTIONS[statusCode] ||
    `HTTP ${statusCode} - Unknown status`
  );
}
