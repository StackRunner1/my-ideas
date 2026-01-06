/**
 * Redux slice for AI chat functionality.
 *
 * Manages chat messages, loading states, and async query execution
 * for both OpenAI Responses API and Agent SDK integrations.
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { sendQuery as sendQueryAPI } from "../services/chatService";
import { sendAgentMessage as sendAgentMessageAPI } from "../services/agentService";

// Chat modes
export type ChatMode = "responses_api" | "agent_sdk";

// Agent statuses
export type AgentStatus =
  | "idle"
  | "thinking"
  | "acting"
  | "waiting_confirmation";

// Agent action types
export interface ToolCall {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
}

export interface Handoff {
  from: string;
  to: string;
  timestamp: number;
}

// Types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  metadata?: {
    // Responses API metadata
    generatedSql?: string;
    explanation?: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    cost?: number;
    warnings?: string[];
    // Agent SDK metadata
    handoffs?: Handoff[];
    toolCalls?: ToolCall[];
    agentName?: string;
    confidence?: number;
    requiresConfirmation?: boolean;
  };
}

export interface ChatSettings {
  temperature: number; // 0.0-2.0
  maxTokens: number; // 100-8192
}

export interface ChatState {
  // Mode selection
  chatMode: ChatMode;

  // Common state
  messages: Message[];
  loading: boolean;
  error: string | null;
  totalTokens: number;
  totalCost: number;
  settings: ChatSettings;

  // Agent SDK specific state
  agentStatus: AgentStatus;
  agentSessionId: string | null; // SDK session ID for conversation continuity
  currentAction: string | null;
  pendingConfirmation: {
    action: string;
    details: Record<string, any>;
  } | null;
}

// Initial state
const initialState: ChatState = {
  chatMode: "responses_api", // Default mode
  messages: [],
  loading: false,
  error: null,
  totalTokens: 0,
  totalCost: 0,
  settings: {
    temperature: 0.7,
    maxTokens: 2000,
  },
  agentStatus: "idle",
  agentSessionId: null, // No active session initially
  currentAction: null,
  pendingConfirmation: null,
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

// Async thunk for sending Agent SDK messages
export const sendAgentMessage = createAsyncThunk(
  "chat/sendAgentMessage",
  async (message: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { agentSessionId } = state.chat;

      console.log("📤 [AGENT] Sending message to Agent SDK");
      console.log(`📨 [AGENT] Current message: "${message}"`);
      console.log(
        `🔗 [AGENT] Session ID: ${
          agentSessionId || "(new session will be created)"
        }`
      );

      // Pass sessionId to service - SDK handles conversation history automatically
      const result = await sendAgentMessageAPI(message, {
        sessionId: agentSessionId || undefined,
      });

      console.log("✅ [AGENT] Agent response received");
      console.log(`🔗 [AGENT] Session ID from response: ${result.sessionId}`);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send agent message");
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
      // Clear agent session to start fresh conversation
      state.agentSessionId = null;
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
    // Chat mode management
    setChatMode: (state, action: PayloadAction<ChatMode>) => {
      state.chatMode = action.payload;
      // Clear agent session when switching modes to prevent context leakage
      if (action.payload !== "agent_sdk") {
        state.agentSessionId = null;
      }
    },
    // Agent-specific reducers
    setAgentStatus: (state, action: PayloadAction<AgentStatus>) => {
      state.agentStatus = action.payload;
    },
    // Agent session management
    setAgentSessionId: (state, action: PayloadAction<string>) => {
      state.agentSessionId = action.payload;
    },
    clearAgentSession: (state) => {
      state.agentSessionId = null;
    },
    setCurrentAction: (state, action: PayloadAction<string | null>) => {
      state.currentAction = action.payload;
    },
    addToolResult: (state, action: PayloadAction<ToolCall>) => {
      // Add tool result to the last assistant message
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        if (!lastMessage.metadata) {
          lastMessage.metadata = {};
        }
        if (!lastMessage.metadata.toolCalls) {
          lastMessage.metadata.toolCalls = [];
        }
        lastMessage.metadata.toolCalls.push(action.payload);
      }
    },
    addHandoff: (state, action: PayloadAction<Handoff>) => {
      // Add handoff to the last assistant message
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        if (!lastMessage.metadata) {
          lastMessage.metadata = {};
        }
        if (!lastMessage.metadata.handoffs) {
          lastMessage.metadata.handoffs = [];
        }
        lastMessage.metadata.handoffs.push(action.payload);
      }
    },
    requestConfirmation: (
      state,
      action: PayloadAction<{ action: string; details: Record<string, any> }>
    ) => {
      state.agentStatus = "waiting_confirmation";
      state.pendingConfirmation = action.payload;
    },
    clearConfirmation: (state) => {
      state.agentStatus = "idle";
      state.pendingConfirmation = null;
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
      })
      // Agent SDK: Pending
      .addCase(sendAgentMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.agentStatus = "thinking";
      })
      // Agent SDK: Fulfilled
      .addCase(sendAgentMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.agentStatus = "idle";

        // Save session ID for conversation continuity
        if (action.payload.sessionId) {
          state.agentSessionId = action.payload.sessionId;
        }

        // Add assistant message with agent response
        const assistantMessage: Message = {
          id: `agent-${Date.now()}`,
          role: "assistant",
          content: action.payload.response || "Action completed",
          timestamp: Date.now(),
          metadata: {
            handoffs: action.payload.handoffs,
            toolCalls: action.payload.toolCalls,
            agentName: action.payload.agentName,
            confidence: action.payload.confidence,
            tokenUsage: action.payload.tokenUsage,
            cost: action.payload.cost,
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
      // Agent SDK: Rejected
      .addCase(sendAgentMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.agentStatus = "idle";

        // Add error message to chat
        const errorMessage: Message = {
          id: `agent-error-${Date.now()}`,
          role: "assistant",
          content: `Agent Error: ${action.payload}`,
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
  setChatMode,
  setAgentStatus,
  setAgentSessionId,
  clearAgentSession,
  setCurrentAction,
  addToolResult,
  addHandoff,
  requestConfirmation,
  clearConfirmation,
} = chatSlice.actions;

// Selectors
export const selectMessages = (state: RootState) => state.chat.messages;
export const selectLoading = (state: RootState) => state.chat.loading;
export const selectError = (state: RootState) => state.chat.error;
export const selectTotalTokens = (state: RootState) => state.chat.totalTokens;
export const selectTotalCost = (state: RootState) => state.chat.totalCost;
export const selectSettings = (state: RootState) => state.chat.settings;
export const selectChatMode = (state: RootState) => state.chat.chatMode;
export const selectAgentStatus = (state: RootState) => state.chat.agentStatus;
export const selectAgentSessionId = (state: RootState) =>
  state.chat.agentSessionId;
export const selectCurrentAction = (state: RootState) =>
  state.chat.currentAction;
export const selectPendingConfirmation = (state: RootState) =>
  state.chat.pendingConfirmation;

// Reducer
export default chatSlice.reducer;
