/**
 * Ideas Redux Slice
 * Session 3, Unit 12: Optimistic Updates & Advanced UX
 *
 * Manages ideas state with optimistic updates for better UX
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  vote_count: number;
  created_at: string;
  updated_at: string;
  // Optimistic update tracking
  isPending?: boolean;
  tempId?: string;
}

interface IdeasState {
  items: Idea[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: "all" | "draft" | "published" | "archived";
  tagFilter: string[];
}

const initialState: IdeasState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: "",
  statusFilter: "all",
  tagFilter: [],
};

const ideasSlice = createSlice({
  name: "ideas",
  initialState,
  reducers: {
    // Fetch ideas
    setIdeas: (state, action: PayloadAction<Idea[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Optimistic create
    addIdeaOptimistic: (state, action: PayloadAction<Idea>) => {
      state.items.unshift({ ...action.payload, isPending: true });
    },
    confirmIdeaCreated: (
      state,
      action: PayloadAction<{ tempId: string; realIdea: Idea }>
    ) => {
      const index = state.items.findIndex(
        (item) => item.tempId === action.payload.tempId
      );
      if (index !== -1) {
        state.items[index] = action.payload.realIdea;
      }
    },
    revertIdeaCreation: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.tempId !== action.payload
      );
    },

    // Optimistic update
    updateIdeaOptimistic: (state, action: PayloadAction<Idea>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = { ...action.payload, isPending: true };
      }
    },
    confirmIdeaUpdated: (state, action: PayloadAction<Idea>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    revertIdeaUpdate: (state, action: PayloadAction<Idea>) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    // Optimistic delete
    deleteIdeaOptimistic: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        state.items[index].isPending = true;
      }
    },
    confirmIdeaDeleted: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    revertIdeaDeletion: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        state.items[index].isPending = false;
      }
    },

    // Filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<"all" | "draft" | "published" | "archived">
    ) => {
      state.statusFilter = action.payload;
    },
    setTagFilter: (state, action: PayloadAction<string[]>) => {
      state.tagFilter = action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = "";
      state.statusFilter = "all";
      state.tagFilter = [];
    },
  },
});

export const {
  setIdeas,
  setLoading,
  setError,
  addIdeaOptimistic,
  confirmIdeaCreated,
  revertIdeaCreation,
  updateIdeaOptimistic,
  confirmIdeaUpdated,
  revertIdeaUpdate,
  deleteIdeaOptimistic,
  confirmIdeaDeleted,
  revertIdeaDeletion,
  setSearchQuery,
  setStatusFilter,
  setTagFilter,
  clearFilters,
} = ideasSlice.actions;

export default ideasSlice.reducer;
