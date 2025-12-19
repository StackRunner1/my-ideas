/**
 * Tests for chatService.
 *
 * Validates:
 * - sendQuery function with successful responses
 * - Error handling (network errors, rate limiting, auth failures)
 * - Response validation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { sendQuery, type QueryResult } from "../chatService";
import apiClient from "../../lib/apiClient";

// Mock apiClient
vi.mock("../../lib/apiClient");

describe("chatService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendQuery", () => {
    it("should send query and return result on success", async () => {
      const mockResponse: QueryResult = {
        success: true,
        queryType: "SQL_GENERATION",
        generatedSql: "SELECT * FROM ideas LIMIT 10",
        explanation: "Here are your ideas",
        results: [
          { id: 1, title: "Idea 1" },
          { id: 2, title: "Idea 2" },
        ],
        rowCount: 2,
        tokenUsage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        cost: 0.01,
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: mockResponse,
      } as any);

      const result = await sendQuery("Show me all ideas");

      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/ai/query", {
        query: "Show me all ideas",
        includeExplanation: true,
      });
      expect(result).toEqual(mockResponse);
    });

    it("should send query with custom options", async () => {
      const mockResponse: QueryResult = {
        success: true,
        explanation: "Test response",
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: mockResponse,
      } as any);

      await sendQuery("Test query", {
        schemaContext: { tableName: "ideas" },
        includeExplanation: false,
      });

      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/ai/query", {
        query: "Test query",
        schemaContext: { tableName: "ideas" },
        includeExplanation: false,
      });
    });

    it("should handle conversational query response", async () => {
      const mockResponse: QueryResult = {
        success: true,
        queryType: "CONVERSATIONAL",
        explanation: "I'm doing well, thank you!",
        results: [],
        rowCount: 0,
        tokenUsage: {
          promptTokens: 50,
          completionTokens: 20,
          totalTokens: 70,
        },
        cost: 0.005,
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: mockResponse,
      } as any);

      const result = await sendQuery("How are you?");

      expect(result.success).toBe(true);
      expect(result.queryType).toBe("CONVERSATIONAL");
      expect(result.generatedSql).toBeUndefined();
    });

    it("should throw error when response is missing", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({} as any);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "No response from server"
      );
    });

    it("should throw error when response data is missing", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: null } as any);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "No response from server"
      );
    });

    it("should throw error from response data when success is false", async () => {
      const mockResponse: QueryResult = {
        success: false,
        error: "Invalid query format",
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: mockResponse,
      } as any);

      await expect(sendQuery("Bad query")).rejects.toThrow(
        "Invalid query format"
      );
    });

    it("should handle 429 rate limit error", async () => {
      const error = {
        response: {
          status: 429,
          data: { detail: "Too many requests" },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "Rate limit exceeded. Please wait a moment and try again."
      );
    });

    it("should handle 401 authentication error", async () => {
      const error = {
        response: {
          status: 401,
          data: { detail: "Unauthorized" },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "Authentication required. Please log in."
      );
    });

    it("should handle 400 bad request error", async () => {
      const error = {
        response: {
          status: 400,
          data: { message: "Query is too long" },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "Query is too long"
      );
    });

    it("should handle generic server error", async () => {
      const error = {
        response: {
          status: 500,
          data: { detail: "Internal server error" },
        },
      };

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "Internal server error"
      );
    });

    it("should handle server error with no detail", async () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "Query failed. Please try again."
      );
    });

    it("should handle network error", async () => {
      const error = {
        request: {},
      };

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "Network error. Please check your connection."
      );
    });

    it("should handle unknown error", async () => {
      const error = new Error("Unknown error");

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow("Unknown error");
    });

    it("should handle error without message", async () => {
      const error = {};

      vi.mocked(apiClient.post).mockRejectedValue(error);

      await expect(sendQuery("Test query")).rejects.toThrow(
        "An unexpected error occurred."
      );
    });
  });
});
