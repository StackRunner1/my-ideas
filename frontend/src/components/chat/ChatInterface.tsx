/**
 * ChatInterface Component
 *
 * Main chat interface for AI-powered database queries.
 * Users can send natural language questions and receive SQL queries with explanations.
 */

import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { useChat } from "../../hooks/useChat";
import { Message } from "../../store/chatSlice";
import { MessageCard } from "./MessageCard";

const EXAMPLE_QUERIES = [
  "Show me all items created this week",
  "What are my most recent ideas?",
  "List all items with their tags",
  "Count how many items I have by status",
];

export function ChatInterface() {
  const { messages, loading, error, sendMessage, clearChat } = useChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading) return;

    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl+Enter to send
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (query: string) => {
    setInput(query);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            // Empty state with examples
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Ask me anything about your data
                </h3>
                <p className="text-sm text-muted-foreground">
                  I'll convert your question into SQL and show you the results
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Try these examples:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {EXAMPLE_QUERIES.map((query) => (
                    <Button
                      key={query}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(query)}
                      className="text-xs"
                    >
                      {query}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Message list
            <div className="space-y-4">
              {messages.map((message: Message) => (
                <MessageCard key={message.id} message={message} />
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                  <span>AI is thinking...</span>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input Area */}
      <div className="mt-4 space-y-2">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            className="min-h-[80px] resize-none"
            disabled={loading}
            aria-label="Query input"
          />
        </div>

        <div className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            Press <kbd className="rounded border px-1">Cmd</kbd>+
            <kbd className="rounded border px-1">Enter</kbd> to send
          </div>

          <div className="flex gap-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                disabled={loading}
              >
                Clear Chat
              </Button>
            )}

            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="sm"
            >
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
