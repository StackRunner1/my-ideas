/**
 * Chat service for AI query requests.
 *
 * Handles communication with the backend /api/v1/ai/query endpoint.
 */

import apiClient from "../lib/apiClient";

// TypeScript interfaces matching backend models
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface QueryRequest {
  query: string;
  schemaContext?: Record<string, any>;
  includeExplanation?: boolean;
}

export interface QueryResult {
  success: boolean;
  queryType?: string;
  generatedSql?: string;
  explanation?: string;
  results?: Array<Record<string, any>>;
  rowCount?: number;
  tokenUsage?: TokenUsage;
  cost?: number;
  warnings?: string[];
  error?: string;
}

/**
 * Send natural language query to AI backend.
 *
 * @param query - Natural language question
 * @param options - Optional configuration
 * @returns Query result with generated SQL and execution data
 */
export async function sendQuery(
  query: string,
  options?: {
    schemaContext?: Record<string, any>;
    includeExplanation?: boolean;
  }
): Promise<QueryResult> {
  try {
    const requestBody: QueryRequest = {
      query,
      schemaContext: options?.schemaContext,
      includeExplanation: options?.includeExplanation ?? true,
    };

    const response = await apiClient.post<QueryResult>(
      "/ai/query",
      requestBody
    );

    // Validate response
    if (!response || !response.data) {
      throw new Error("No response from server");
    }

    const data = response.data;

    if (!data.success && data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error: any) {
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message =
        error.response.data?.detail || error.response.data?.message;

      if (status === 429) {
        throw new Error(
          "Rate limit exceeded. Please wait a moment and try again."
        );
      } else if (status === 401) {
        throw new Error("Authentication required. Please log in.");
      } else if (status === 400) {
        throw new Error(message || "Invalid query. Please try rephrasing.");
      } else {
        throw new Error(message || "Query failed. Please try again.");
      }
    } else if (error.request) {
      // Network error
      throw new Error("Network error. Please check your connection.");
    } else {
      // Other errors
      throw new Error(error.message || "An unexpected error occurred.");
    }
  }
}

/**
 * Get conversation history (placeholder for future implementation).
 *
 * Future enhancement: Store conversation history in backend/database
 * and retrieve it here for persistent chat sessions.
 *
 * @returns Array of historical messages
 */
export async function getConversationHistory(): Promise<any[]> {
  // TODO: Implement when backend supports conversation persistence
  if (import.meta.env.DEV) {
    console.log("[ChatService] getConversationHistory not yet implemented");
  }
  return [];
}

/**
 * Clear conversation history (placeholder for future implementation).
 */
export async function clearConversationHistory(): Promise<void> {
  // TODO: Implement when backend supports conversation persistence
  if (import.meta.env.DEV) {
    console.log("[ChatService] clearConversationHistory not yet implemented");
  }
}
