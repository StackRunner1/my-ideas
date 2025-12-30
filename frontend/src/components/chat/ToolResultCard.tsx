/**
 * ToolResultCard Component
 *
 * Displays tool execution results with success/error states for Agent SDK.
 */

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card } from "../ui/card";
import type { ToolCall } from "../../store/chatSlice";

interface ToolResultCardProps {
  toolCall: ToolCall;
}

export function ToolResultCard({ toolCall }: ToolResultCardProps) {
  const hasError = Boolean(toolCall.error);
  const hasResult = Boolean(toolCall.result);

  return (
    <Card
      className={`border-l-4 p-3 text-sm ${
        hasError
          ? "border-l-destructive bg-destructive/5"
          : hasResult
          ? "border-l-green-500 bg-green-500/5"
          : "border-l-blue-500 bg-blue-500/5"
      }`}
    >
      {/* Header */}
      <div className="mb-2 flex items-start gap-2">
        <div className="mt-0.5">
          {hasError ? (
            <XCircle className="h-4 w-4 text-destructive" />
          ) : hasResult ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="font-medium">
            <span className="text-xs opacity-70">Tool: </span>
            <code className="text-xs">{toolCall.toolName}</code>
          </div>
        </div>
      </div>

      {/* Parameters */}
      {toolCall.parameters && Object.keys(toolCall.parameters).length > 0 && (
        <div className="mb-2">
          <div className="mb-1 text-xs font-medium opacity-70">Parameters:</div>
          <pre className="overflow-x-auto rounded bg-background/50 p-2 text-xs">
            <code>{JSON.stringify(toolCall.parameters, null, 2)}</code>
          </pre>
        </div>
      )}

      {/* Result */}
      {hasResult && (
        <div>
          <div className="mb-1 text-xs font-medium opacity-70">Result:</div>
          <div className="rounded bg-background/50 p-2">
            {typeof toolCall.result === "string" ? (
              <p className="text-xs">{toolCall.result}</p>
            ) : (
              <pre className="overflow-x-auto text-xs">
                <code>{JSON.stringify(toolCall.result, null, 2)}</code>
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div>
          <div className="mb-1 text-xs font-medium text-destructive">
            Error:
          </div>
          <p className="text-xs text-destructive">{toolCall.error}</p>
        </div>
      )}
    </Card>
  );
}
