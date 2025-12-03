/**
 * Analytics Dashboard Page
 * Session 3, Unit 11: Recharts Integration
 *
 * Displays interactive charts showing user activity and data insights
 */

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getItemsByDate,
  getItemsByStatus,
  getTagsUsage,
  ItemsByDate,
  ItemsByStatus,
  TagUsage,
} from "@/services/analyticsService";
import { parseAPIError } from "@/lib/errorHandler";
import { format } from "date-fns";
import { AnalyticsChartSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";

// Chart color palette from design system
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(0 84.2% 60.2%)", // destructive
  "hsl(142 76% 36%)", // green
  "hsl(221 83% 53%)", // blue
  "hsl(280 65% 60%)", // purple
  "hsl(38 92% 50%)", // orange
  "hsl(199 89% 48%)", // cyan
  "hsl(330 81% 60%)", // pink
];

export default function Analytics() {
  const [itemsByDate, setItemsByDate] = useState<ItemsByDate[]>([]);
  const [itemsByStatus, setItemsByStatus] = useState<ItemsByStatus[]>([]);
  const [tagsUsage, setTagsUsage] = useState<TagUsage[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const [dateData, statusData, tagsData] = await Promise.all([
        getItemsByDate(),
        getItemsByStatus(),
        getTagsUsage(),
      ]);

      // Sort date data chronologically (oldest to newest for chart)
      const sortedDateData = [...dateData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setItemsByDate(sortedDateData);
      setItemsByStatus(statusData);
      setTagsUsage(tagsData);
    } catch (err) {
      const parsedError = parseAPIError(err);
      setError(parsedError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Loading Analytics</h2>
          <p className="text-muted-foreground">
            Fetching your data insights...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Analytics Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">
                Failed to load analytics: {error}
              </p>
              <Button onClick={fetchAnalytics}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights into your ideas and activity
          </p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Line Chart - Items Created Over Time */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Items Created Over Time</CardTitle>
            <CardDescription>
              Number of ideas created per day (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {itemsByDate.length === 0 ? (
              <EmptyState
                icon="📊"
                title="No activity data"
                description="Start creating ideas to see your activity over time"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={itemsByDate}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    labelFormatter={(date) =>
                      format(new Date(date), "MMMM d, yyyy")
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Ideas Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Items by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Items by Status</CardTitle>
            <CardDescription>
              Distribution of ideas across statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {itemsByStatus.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No status data"
                description="Create some ideas to see status distribution"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={itemsByStatus}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="status"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    name="Count"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Tag Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Top Tags</CardTitle>
            <CardDescription>Most frequently used tags</CardDescription>
          </CardHeader>
          <CardContent>
            {tagsUsage.length === 0 ? (
              <EmptyState
                icon="🏷️"
                title="No tags yet"
                description="Add tags to your ideas to see usage statistics"
              />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tagsUsage as any}
                    dataKey="usage_count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {tagsUsage.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
