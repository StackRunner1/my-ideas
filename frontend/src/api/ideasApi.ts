import apiClient from "./apiClient";

export interface Idea {
  id: number;
  title: string;
  description?: string | null;
  votes: number;
}

export interface IdeaCreate {
  title: string;
  description?: string | null;
}

export async function listIdeas(): Promise<Idea[]> {
  const res = await apiClient.get<Idea[]>("/ideas");
  return res.data;
}

export async function createIdea(data: IdeaCreate): Promise<Idea> {
  const res = await apiClient.post<Idea>("/ideas", data);
  return res.data;
}

export async function voteIdea(id: number): Promise<Idea> {
  const res = await apiClient.post<Idea>(`/ideas/${id}/vote`);
  return res.data;
}

export async function deleteIdea(id: number): Promise<void> {
  await apiClient.delete(`/ideas/${id}`);
}
