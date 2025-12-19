/**
 * Chat service for AI query requests.
 *
 * Handles communication with the backend /api/v1/ai/query endpoint.
 */

import apiClient from "../lib/apiClient";

// TypeScript interfaces matching backend models
export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface QuerySettings {
  temperature?: number; // 0.0-2.0
  maxTokens?: number; // 100-8192
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface QueryRequest {
  query: string;
  conversationHistory?: Message[];
  settings?: QuerySettings;
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
 * Send natural language query to AI backend with conversation context.
 *
 * @param query - Natural language question
 * @param options - Optional configuration including conversation history and settings
 * @returns Query result with generated SQL and execution data
 */
export async function sendQuery(
  query: string,
  options?: {
    conversationHistory?: Message[];
    settings?: QuerySettings;
    schemaContext?: Record<string, any>;
    includeExplanation?: boolean;
  }
): Promise<QueryResult> {
  try {
    const requestBody: QueryRequest = {
      query,
      conversationHistory: options?.conversationHistory,
      settings: options?.settings,
      schemaContext: options?.schemaContext,
      includeExplanation: options?.includeExplanation ?? true,
    };

    console.log("🌐 [API] Sending POST to /api/v1/ai/query");
    console.log(
      "📦 [API] Request body:",
      JSON.stringify(
        {
          query: requestBody.query,
          conversationHistory: requestBody.conversationHistory?.length
            ? `${requestBody.conversationHistory.length} messages`
            : "none",
          settings: requestBody.settings,
          includeExplanation: requestBody.includeExplanation,
        },
        null,
        2
      )
    );
    if (
      requestBody.conversationHistory &&
      requestBody.conversationHistory.length > 0
    ) {
      console.log(
        "📜 [API] Full conversation history:",
        requestBody.conversationHistory
      );
    }

    const response = await apiClient.post<QueryResult>(
      "/api/v1/ai/query",
      requestBody
    );

    console.log("✅ [API] Response received:", response.data);

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
