/**
 * MessageCard Component
 *
 * Displays individual chat messages with different styling for user vs assistant.
 */

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, User, Bot } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { Message } from "../../store/chatSlice";
import { QueryResultsTable } from "./QueryResultsTable";
import { ActionBadge } from "./ActionBadge";
import { ToolResultCard } from "./ToolResultCard";

interface MessageCardProps {
  message: Message;
}

export function MessageCard({ message }: MessageCardProps) {
  const [showMetadata, setShowMetadata] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <Card
        className={`max-w-[85%] p-4 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background/10">
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
          <span className="text-xs font-medium">
            {isUser ? "You" : message.metadata?.agentName || "AI Assistant"}
          </span>
          <span className="ml-auto text-xs opacity-70">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Main message */}
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>

          {/* Agent Handoffs (for agent messages) */}
          {!isUser &&
            message.metadata?.handoffs &&
            message.metadata.handoffs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium">Agent Routing:</div>
                <div className="flex flex-wrap gap-2">
                  {message.metadata.handoffs.map((handoff, idx) => (
                    <ActionBadge
                      key={idx}
                      type="handoff"
                      from={handoff.from}
                      to={handoff.to}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Tool Calls (for agent messages) */}
          {!isUser &&
            message.metadata?.toolCalls &&
            message.metadata.toolCalls.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium">Tool Executions:</div>
                <div className="space-y-2">
                  {message.metadata.toolCalls.map((toolCall, idx) => (
                    <ToolResultCard key={idx} toolCall={toolCall} />
                  ))}
                </div>
              </div>
            )}

          {/* SQL Query (for assistant messages) */}
          {!isUser && message.metadata?.generatedSql && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Generated SQL:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(message.metadata!.generatedSql!)
                  }
                  className="h-6 px-2 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <pre className="overflow-x-auto rounded bg-background/20 p-3 text-xs">
                <code>{message.metadata.generatedSql}</code>
              </pre>
            </div>
          )}

          {/* Explanation (for assistant messages) */}
          {!isUser &&
            message.metadata?.explanation &&
            message.metadata.explanation !== message.content && (
              <div className="rounded bg-background/10 p-2">
                <p className="text-xs italic">{message.metadata.explanation}</p>
              </div>
            )}

          {/* Warnings */}
          {!isUser &&
            message.metadata?.warnings &&
            message.metadata.warnings.length > 0 && (
              <div className="space-y-1">
                {message.metadata.warnings.map((warning, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-yellow-600 dark:text-yellow-400"
                  >
                    ⚠️ {warning}
                  </p>
                ))}
              </div>
            )}

          {/* Metadata Toggle */}
          {!isUser &&
            message.metadata &&
            (message.metadata.tokenUsage || message.metadata.cost) && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="h-6 px-2 text-xs"
                >
                  {showMetadata ? (
                    <>
                      <ChevronUp className="mr-1 h-3 w-3" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-3 w-3" />
                      Show Details
                    </>
                  )}
                </Button>

                {showMetadata && (
                  <div className="mt-2 space-y-1 rounded bg-background/10 p-2 text-xs">
                    {message.metadata.confidence !== undefined && (
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-mono">
                          {(message.metadata.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {message.metadata.tokenUsage && (
                      <div className="flex justify-between">
                        <span>Tokens:</span>
                        <span className="font-mono">
                          {message.metadata.tokenUsage.totalTokens}
                          <span className="ml-1 opacity-70">
                            ({message.metadata.tokenUsage.promptTokens} in /{" "}
                            {message.metadata.tokenUsage.completionTokens} out)
                          </span>
                        </span>
                      </div>
                    )}
                    {message.metadata.cost && (
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-mono">
                          ${message.metadata.cost.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      </Card>
    </div>
  );
}
