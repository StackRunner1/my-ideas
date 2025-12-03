/**
 * Analytics API Service
 * Session 3, Unit 11: Recharts Integration
 *
 * Fetches aggregated analytics data for dashboard charts
 */

import apiClient from "@/lib/apiClient";

export interface ItemsByDate {
  date: string;
  count: number;
}

export interface ItemsByStatus {
  status: string;
  count: number;
}

export interface TagUsage {
  label: string;
  usage_count: number;
}

/**
 * Fetch items created per day (last 30 days)
 */
export async function getItemsByDate(): Promise<ItemsByDate[]> {
  const response = await apiClient.get<ItemsByDate[]>(
    "/api/v1/analytics/items-by-date"
  );
  return response.data;
}

/**
 * Fetch items grouped by status
 */
export async function getItemsByStatus(): Promise<ItemsByStatus[]> {
  const response = await apiClient.get<ItemsByStatus[]>(
    "/api/v1/analytics/items-by-status"
  );
  return response.data;
}

/**
 * Fetch top 10 most used tags
 */
export async function getTagsUsage(): Promise<TagUsage[]> {
  const response = await apiClient.get<TagUsage[]>(
    "/api/v1/analytics/tags-usage"
  );
  return response.data;
}
