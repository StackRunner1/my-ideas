/**
 * Redux slice for AI chat functionality.
 *
 * Manages chat messages, loading states, and async query execution
 * for the OpenAI Responses API integration.
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { sendQuery as sendQueryAPI } from "../services/chatService";

// Types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: {
    generatedSql?: string;
    explanation?: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    cost?: number;
    warnings?: string[];
  };
}

export interface ChatSettings {
  temperature: number; // 0.0-2.0
  maxTokens: number; // 100-8192
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  totalTokens: number;
  totalCost: number;
  settings: ChatSettings;
}

// Initial state
const initialState: ChatState = {
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

// Async thunk for sending queries with conversation history
export const sendQuery = createAsyncThunk(
  "chat/sendQuery",
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { messages, settings } = state.chat;

      // Convert messages to conversation history (last 10 messages)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log("📤 [CHAT] Sending query to API");
      console.log(`📨 [CHAT] Current query: "${query}"`);
      console.log(`📚 [CHAT] Total messages in state: ${messages.length}`);
      console.log(
        `📜 [CHAT] Conversation history (last 10): ${conversationHistory.length} messages`
      );
      conversationHistory.forEach((msg, i) => {
        const preview =
          msg.content.length > 60
            ? msg.content.substring(0, 60) + "..."
            : msg.content;
        console.log(`   ${i + 1}. ${msg.role}: ${preview}`);
      });
      console.log(
        `⚙️ [CHAT] Settings: temp=${settings.temperature}, maxTokens=${settings.maxTokens}`
      );

      const result = await sendQueryAPI(query, {
        conversationHistory,
        settings: {
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        },
      });

      console.log("✅ [CHAT] Query successful");
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send query");
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.totalTokens = 0;
      state.totalCost = 0;
      state.error = null;
    },
    updateTokenUsage: (
      state,
      action: PayloadAction<{ tokens: number; cost: number }>
    ) => {
      state.totalTokens += action.payload.tokens;
      state.totalCost += action.payload.cost;
    },
    updateSettings: (state, action: PayloadAction<Partial<ChatSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending: Query is being sent
      .addCase(sendQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Fulfilled: Query succeeded
      .addCase(sendQuery.fulfilled, (state, action) => {
        state.loading = false;

        // Add assistant message with response
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: action.payload.explanation || "Query executed successfully",
          timestamp: Date.now(),
          metadata: {
            generatedSql: action.payload.generatedSql,
            explanation: action.payload.explanation,
            tokenUsage: action.payload.tokenUsage,
            cost: action.payload.cost,
            warnings: action.payload.warnings,
          },
        };

        state.messages.push(assistantMessage);

        // Update totals
        if (action.payload.tokenUsage) {
          state.totalTokens += action.payload.tokenUsage.totalTokens;
        }
        if (action.payload.cost) {
          state.totalCost += action.payload.cost;
        }
      })
      // Rejected: Query failed
      .addCase(sendQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;

        // Add error message to chat
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${action.payload}`,
          timestamp: Date.now(),
        };

        state.messages.push(errorMessage);
      });
  },
});

// Actions
export const {
  addMessage,
  setLoading,
  setError,
  clearMessages,
  updateTokenUsage,
  updateSettings,
} = chatSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectLoading = (state: RootState) => state.chat.loading;
export const selectError = (state: RootState) => state.chat.error;
export const selectTotalTokens = (state: RootState) => state.chat.totalTokens;
export const selectTotalCost = (state: RootState) => state.chat.totalCost;
export const selectSettings = (state: RootState) => state.chat.settings;

// Reducer
export default chatSlice.reducer;
