/**
 * Chat Page
 *
 * AI-powered database query interface.
 * Protected route requiring authentication.
 */

import { ChatInterface } from "../components/chat/ChatInterface";
import { useAppSelector } from "../store/hooks";
import { selectTotalCost, selectTotalTokens } from "../store/chatSlice";

export default function Chat() {
  const totalTokens = useAppSelector(selectTotalTokens);
  const totalCost = useAppSelector(selectTotalCost);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask questions about your data in natural language
          </p>
        </div>

        {/* Token/Cost Display */}
        {(totalTokens > 0 || totalCost > 0) && (
          <div className="rounded-lg bg-muted px-4 py-2 text-sm">
            <div className="flex gap-4">
              <div>
                <span className="text-muted-foreground">Tokens:</span>
                <span className="ml-2 font-mono font-semibold">
                  {totalTokens.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Cost:</span>
                <span className="ml-2 font-mono font-semibold">
                  ${totalCost.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
