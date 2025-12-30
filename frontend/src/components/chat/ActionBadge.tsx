/**
 * ActionBadge Component
 *
 * Displays handoffs and tool execution indicators for Agent SDK messages.
 */

import { ArrowRight, Wrench } from "lucide-react";
import { Badge } from "../ui/badge";

interface ActionBadgeProps {
  type: "handoff" | "tool";
  from?: string;
  to?: string;
  toolName?: string;
  status?: "pending" | "success" | "error";
}

export function ActionBadge({
  type,
  from,
  to,
  toolName,
  status,
}: ActionBadgeProps) {
  if (type === "handoff" && from && to) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
        <span className="text-base">🔄</span>
        <span>{from}</span>
        <ArrowRight className="h-3 w-3" />
        <span>{to}</span>
      </Badge>
    );
  }

  if (type === "tool" && toolName) {
    const statusEmoji =
      status === "success" ? "✅" : status === "error" ? "❌" : "⏳";
    const statusColor =
      status === "success"
        ? "bg-green-500/10 text-green-700 dark:text-green-400"
        : status === "error"
        ? "bg-red-500/10 text-red-700 dark:text-red-400"
        : "bg-blue-500/10 text-blue-700 dark:text-blue-400";

    return (
      <Badge className={`flex items-center gap-1 text-xs ${statusColor}`}>
        <Wrench className="h-3 w-3" />
        <span>{toolName}</span>
        <span>{statusEmoji}</span>
      </Badge>
    );
  }

  return null;
}
