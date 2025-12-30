/**
 * Agent service for Agent SDK requests.
 *
 * Handles communication with the backend /api/v1/agent/chat endpoint.
 */

import apiClient from "../lib/apiClient";
import type { Handoff, ToolCall } from "../store/chatSlice";

// TypeScript interfaces matching backend models
export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AgentChatRequest {
  message: string;
  sessionId?: string;
  conversationHistory?: AgentMessage[];
}

export interface AgentChatResponse {
  success: boolean;
  response: string;
  sessionId: string;
  handoffs?: Handoff[];
  toolCalls?: ToolCall[];
  agentName?: string;
  confidence?: number;
  tokenUsage?: TokenUsage;
  cost?: number;
  error?: string;
}

/**
 * Send message to Agent SDK backend.
 *
 * @param message - User message
 * @param options - Optional configuration including conversation history
 * @returns Agent response with handoffs and tool execution details
 */
export async function sendAgentMessage(
  message: string,
  options?: {
    conversationHistory?: AgentMessage[];
    sessionId?: string;
  }
): Promise<AgentChatResponse> {
  try {
    const requestBody: AgentChatRequest = {
      message,
      sessionId: options?.sessionId,
      conversationHistory: options?.conversationHistory,
    };

    console.log("🌐 [API] Sending POST to /api/v1/agent/chat");
    console.log(
      "📦 [API] Request body:",
      JSON.stringify(
        {
          message: requestBody.message,
          sessionId: requestBody.sessionId || "none",
          conversationHistory: requestBody.conversationHistory?.length
            ? `${requestBody.conversationHistory.length} messages`
            : "none",
        },
        null,
        2
      )
    );

    const response = await apiClient.post<AgentChatResponse>(
      "/api/v1/agent/chat",
      requestBody
    );

    console.log("✅ [API] Agent response received");
    console.log("📊 [API] Response data:", {
      success: response.data.success,
      agentName: response.data.agentName,
      handoffs: response.data.handoffs?.length || 0,
      toolCalls: response.data.toolCalls?.length || 0,
      sessionId: response.data.sessionId,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Agent request failed");
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ [API] Agent request failed:", error);

    // Handle Axios error
    if (error.response) {
      // Server responded with error status
      const errorMessage =
        error.response.data?.error ||
        error.response.data?.detail ||
        `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Error setting up request
      throw new Error(error.message || "Failed to send agent message");
    }
  }
}
