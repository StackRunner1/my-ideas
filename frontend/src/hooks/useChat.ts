/**
 * useChat Hook
 *
 * Custom hook wrapping Redux chat actions and selectors.
 * Provides a clean interface for chat functionality.
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
  sendQuery as sendQueryThunk,
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

  // Send message (optimistic update + API call)
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

  // Clear chat history
  const clearChat = useCallback(() => {
    // TODO: Add confirmation dialog before clearing
    dispatch(clearMessages());
  }, [dispatch]);

  return {
    messages,
    loading,
    error,
    totalTokens,
    totalCost,
    sendMessage,
    clearChat,
  };
}
