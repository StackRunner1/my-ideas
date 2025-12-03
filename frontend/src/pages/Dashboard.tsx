import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { getIdeas } from "@/api/ideasApi";
import { parseAPIError } from "@/lib/errorHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  FileEdit,
  CheckCircle,
  Archive,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  total: number;
  draft: number;
  published: number;
  archived: number;
}

export default function Dashboard() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    draft: 0,
    published: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const ideas = await getIdeas();

        // Calculate stats from ideas
        const newStats: DashboardStats = {
          total: ideas.length,
          draft: ideas.filter((i) => i.status === "draft").length,
          published: ideas.filter((i) => i.status === "published").length,
          archived: ideas.filter((i) => i.status === "archived").length,
        };

        setStats(newStats);
        setError(null);
      } catch (err) {
        const parsedError = parseAPIError(err);
        setError(parsedError.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load stats: {error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Ideas
                </CardTitle>
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All ideas in your workspace
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <FileEdit className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.draft}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Work in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.published}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Shared with others
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Archived</CardTitle>
                <Archive className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.archived}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Inactive ideas
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isAuthenticated && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Please sign in to view your dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
