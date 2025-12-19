/**
 * Tests for chatSlice Redux slice.
 *
 * Validates:
 * - Reducers (addMessage, clearMessages, setError, etc.)
 * - sendQuery async thunk lifecycle (pending, fulfilled, rejected)
 * - Token usage and cost tracking
 * - Selectors
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import chatReducer, {
  addMessage,
  clearMessages,
  setError,
  setLoading,
  updateTokenUsage,
  sendQuery,
  type ChatState,
  type Message,
} from "../chatSlice";
import * as chatService from "../../services/chatService";

// Mock chatService
vi.mock("../../services/chatService");

describe("chatSlice", () => {
  let initialState: ChatState;

  beforeEach(() => {
    initialState = {
      messages: [],
      loading: false,
      error: null,
      totalTokens: 0,
      totalCost: 0,
      settings: {
        temperature: 0.7,
        maxTokens: 2000,
      },
    };
    vi.clearAllMocks();
  });

  describe("reducers", () => {
    it("should return initial state", () => {
      expect(chatReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    it("should handle addMessage", () => {
      const message: Message = {
        id: "msg-1",
        role: "user",
        content: "Hello",
        timestamp: Date.now(),
      };

      const state = chatReducer(initialState, addMessage(message));

      expect(state.messages).toHaveLength(1);
      expect(state.messages[0]).toEqual(message);
    });

    it("should handle multiple addMessage calls", () => {
      let state = initialState;

      const message1: Message = {
        id: "msg-1",
        role: "user",
        content: "Hello",
        timestamp: Date.now(),
      };

      const message2: Message = {
        id: "msg-2",
        role: "assistant",
        content: "Hi there!",
        timestamp: Date.now(),
      };

      state = chatReducer(state, addMessage(message1));
      state = chatReducer(state, addMessage(message2));

      expect(state.messages).toHaveLength(2);
      expect(state.messages[0]).toEqual(message1);
      expect(state.messages[1]).toEqual(message2);
    });

    it("should handle setLoading", () => {
      const state = chatReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);

      const state2 = chatReducer(state, setLoading(false));
      expect(state2.loading).toBe(false);
    });

    it("should handle setError", () => {
      const errorMessage = "Something went wrong";
      const state = chatReducer(initialState, setError(errorMessage));

      expect(state.error).toBe(errorMessage);
    });

    it("should handle setError with null to clear error", () => {
      const stateWithError = {
        ...initialState,
        error: "Previous error",
      };

      const state = chatReducer(stateWithError, setError(null));
      expect(state.error).toBeNull();
    });

    it("should handle clearMessages", () => {
      const stateWithData: ChatState = {
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Test",
            timestamp: Date.now(),
          },
        ],
        loading: false,
        error: "Some error",
        totalTokens: 100,
        totalCost: 0.05,
        settings: {
          temperature: 0.7,
          maxTokens: 2000,
        },
      };

      const state = chatReducer(stateWithData, clearMessages());

      expect(state.messages).toHaveLength(0);
      expect(state.totalTokens).toBe(0);
      expect(state.totalCost).toBe(0);
      expect(state.error).toBeNull();
    });

    it("should handle updateTokenUsage", () => {
      const state = chatReducer(
        initialState,
        updateTokenUsage({ tokens: 150, cost: 0.01 })
      );

      expect(state.totalTokens).toBe(150);
      expect(state.totalCost).toBe(0.01);
    });

    it("should accumulate updateTokenUsage", () => {
      let state = initialState;

      state = chatReducer(
        state,
        updateTokenUsage({ tokens: 100, cost: 0.005 })
      );
      state = chatReducer(state, updateTokenUsage({ tokens: 50, cost: 0.003 }));

      expect(state.totalTokens).toBe(150);
      expect(state.totalCost).toBe(0.008);
    });
  });

  describe("sendQuery async thunk", () => {
    it("should handle sendQuery.pending", () => {
      const action = { type: sendQuery.pending.type };
      const state = chatReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle sendQuery.fulfilled with successful query", () => {
      const mockResult = {
        success: true,
        queryType: "SQL_GENERATION",
        generatedSql: "SELECT * FROM ideas LIMIT 10",
        explanation: "Here are your ideas",
        results: [{ id: 1, title: "Test Idea" }],
        rowCount: 1,
        tokenUsage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        cost: 0.01,
      };

      const action = {
        type: sendQuery.fulfilled.type,
        payload: mockResult,
      };

      const state = chatReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].role).toBe("assistant");
      expect(state.messages[0].content).toBe("Here are your ideas");
      expect(state.messages[0].metadata?.generatedSql).toBe(
        mockResult.generatedSql
      );
      expect(state.messages[0].metadata?.tokenUsage).toEqual(
        mockResult.tokenUsage
      );
      expect(state.totalTokens).toBe(150);
      expect(state.totalCost).toBe(0.01);
    });

    it("should handle sendQuery.fulfilled with conversational response", () => {
      const mockResult = {
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

      const action = {
        type: sendQuery.fulfilled.type,
        payload: mockResult,
      };

      const state = chatReducer(initialState, action);

      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].content).toBe("I'm doing well, thank you!");
      expect(state.messages[0].metadata?.generatedSql).toBeUndefined();
      expect(state.totalTokens).toBe(70);
    });

    it("should handle sendQuery.rejected with error", () => {
      const errorMessage = "Network error";
      const action = {
        type: sendQuery.rejected.type,
        payload: errorMessage,
      };

      const state = chatReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].role).toBe("assistant");
      expect(state.messages[0].content).toContain("Error");
      expect(state.messages[0].content).toContain(errorMessage);
    });

    it("should handle multiple query lifecycle", () => {
      let state = initialState;

      // First query - pending
      state = chatReducer(state, { type: sendQuery.pending.type });
      expect(state.loading).toBe(true);

      // First query - fulfilled
      const result1 = {
        success: true,
        explanation: "Response 1",
        tokenUsage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        cost: 0.005,
      };
      state = chatReducer(state, {
        type: sendQuery.fulfilled.type,
        payload: result1,
      });
      expect(state.loading).toBe(false);
      expect(state.messages).toHaveLength(1);
      expect(state.totalTokens).toBe(80);

      // Second query - pending
      state = chatReducer(state, { type: sendQuery.pending.type });
      expect(state.loading).toBe(true);

      // Second query - fulfilled
      const result2 = {
        success: true,
        explanation: "Response 2",
        tokenUsage: {
          promptTokens: 60,
          completionTokens: 40,
          totalTokens: 100,
        },
        cost: 0.008,
      };
      state = chatReducer(state, {
        type: sendQuery.fulfilled.type,
        payload: result2,
      });
      expect(state.loading).toBe(false);
      expect(state.messages).toHaveLength(2);
      expect(state.totalTokens).toBe(180); // 80 + 100
      expect(state.totalCost).toBe(0.013); // 0.005 + 0.008
    });
  });

  describe("sendQuery thunk execution", () => {
    it("should call chatService.sendQuery with correct query", async () => {
      const mockResult = {
        success: true,
        explanation: "Test response",
        tokenUsage: { promptTokens: 50, completionTokens: 30, totalTokens: 80 },
        cost: 0.005,
      };

      vi.mocked(chatService.sendQuery).mockResolvedValue(mockResult);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const thunk = sendQuery("Show me all ideas");
      await thunk(dispatch, getState, undefined);

      expect(chatService.sendQuery).toHaveBeenCalledWith("Show me all ideas");
    });

    it("should handle chatService.sendQuery rejection", async () => {
      const errorMessage = "API error";
      vi.mocked(chatService.sendQuery).mockRejectedValue(
        new Error(errorMessage)
      );

      const dispatch = vi.fn();
      const getState = vi.fn();

      const thunk = sendQuery("Test query");
      const result = await thunk(dispatch, getState, undefined);

      expect(result.type).toBe(sendQuery.rejected.type);
      expect(result.payload).toBe(errorMessage);
    });
  });
});
