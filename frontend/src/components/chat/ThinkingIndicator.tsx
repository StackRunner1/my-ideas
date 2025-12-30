/**
 * ThinkingIndicator Component
 *
 * Animated indicator shown when agent is processing a request.
 */

import { Bot } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Bot className="h-4 w-4 animate-pulse" />
      <span className="animate-pulse">Agent is thinking</span>
      <div className="flex gap-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
      </div>
    </div>
  );
}
