/**
 * LoadingSkeleton Components
 *
 * Skeleton placeholders for better perceived performance while AI is thinking.
 */

import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function MessageSkeleton() {
  return (
    <div className="flex justify-start">
      <Card className="max-w-[85%] space-y-3 bg-muted p-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-3 w-16" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        {/* SQL code block skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-1 rounded bg-background/50 p-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      <div className="rounded border">
        {/* Table header */}
        <div className="flex gap-4 border-b p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex gap-4 border-b p-4 last:border-b-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatLoadingState() {
  return (
    <div className="space-y-4">
      <MessageSkeleton />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-current"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-current"
          style={{ animationDelay: "0.4s" }}
        />
        <span className="ml-2">AI is thinking...</span>
      </div>
    </div>
  );
}
