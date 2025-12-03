/**
 * Ideas API Service
 * Session 3, Unit 12: Ideas CRUD Operations
 *
 * Handles all API calls for ideas management
 */

import apiClient from "@/lib/apiClient";

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
}

export interface CreateIdeaRequest {
  title: string;
  description: string;
  status?: "draft" | "published" | "archived";
  tags?: string[];
}

export interface UpdateIdeaRequest {
  title?: string;
  description?: string;
  status?: "draft" | "published" | "archived";
  tags?: string[];
}

/**
 * Fetch all ideas for the current user
 */
export async function getIdeas(): Promise<Idea[]> {
  const response = await apiClient.get<Idea[]>("/api/v1/ideas");
  return response.data;
}

/**
 * Fetch a single idea by ID
 */
export async function getIdea(id: string): Promise<Idea> {
  const response = await apiClient.get<Idea>(`/api/v1/ideas/${id}`);
  return response.data;
}

/**
 * Create a new idea
 */
export async function createIdea(data: CreateIdeaRequest): Promise<Idea> {
  const response = await apiClient.post<Idea>("/api/v1/ideas", data);
  return response.data;
}

/**
 * Update an existing idea
 */
export async function updateIdea(
  id: string,
  data: UpdateIdeaRequest
): Promise<Idea> {
  const response = await apiClient.patch<Idea>(`/api/v1/ideas/${id}`, data);
  return response.data;
}

/**
 * Delete an idea
 */
export async function deleteIdea(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/ideas/${id}`);
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await apiClient.get<{ status: string }>("/health");
  return res.data;
}
