/**
 * useChat Hook
 *
 * Custom hook wrapping Redux chat actions and selectors.
 * Provides a clean interface for both Responses API and Agent SDK chat functionality.
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addMessage,
  clearMessages,
  selectError,
  selectLoading,
  selectMessages,
  selectTotalCost,
  selectTotalTokens,
  selectChatMode,
  selectAgentStatus,
  selectCurrentAction,
  selectPendingConfirmation,
  sendQuery as sendQueryThunk,
  sendAgentMessage as sendAgentMessageThunk,
  setChatMode as setChatModeAction,
  ChatMode,
} from "../store/chatSlice";
import type { Message } from "../store/chatSlice";

export function useChat() {
  const dispatch = useAppDispatch();

  // Selectors
  const messages = useAppSelector(selectMessages);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const totalTokens = useAppSelector(selectTotalTokens);
  const totalCost = useAppSelector(selectTotalCost);
  const chatMode = useAppSelector(selectChatMode);
  const agentStatus = useAppSelector(selectAgentStatus);
  const currentAction = useAppSelector(selectCurrentAction);
  const pendingConfirmation = useAppSelector(selectPendingConfirmation);

  // Send message to Responses API (optimistic update + API call)
  const sendMessage = useCallback(
    (query: string) => {
      // Add user message immediately (optimistic update)
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: Date.now(),
      };

      dispatch(addMessage(userMessage));

      // Send to API (async thunk will add assistant response)
      dispatch(sendQueryThunk(query));
    },
    [dispatch]
  );

  // Send message to Agent SDK (optimistic update + API call)
  const sendAgentMessage = useCallback(
    (message: string) => {
      // Add user message immediately (optimistic update)
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: Date.now(),
      };

      dispatch(addMessage(userMessage));

      // Send to Agent SDK (async thunk will add agent response)
      dispatch(sendAgentMessageThunk(message));
    },
    [dispatch]
  );

  // Set chat mode
  const setChatMode = useCallback(
    (mode: ChatMode) => {
      dispatch(setChatModeAction(mode));
    },
    [dispatch]
  );

  // Clear chat history
  const clearChat = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    messages,
    loading,
    error,
    totalTokens,
    totalCost,
    chatMode,
    agentStatus,
    currentAction,
    pendingConfirmation,
    sendMessage,
    sendAgentMessage,
    setChatMode,
    clearChat,
  };
}
