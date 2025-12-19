/**
 * ChatDrawer Component
 *
 * Right-side drawer containing the AI chat interface.
 * Opens from floating button, spans full viewport height.
 */

import { useAppSelector } from "@/store/hooks";
import { selectTotalTokens, selectTotalCost } from "@/store/chatSlice";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { ChatInterface } from "./ChatInterface";
import { ChatSettings } from "./ChatSettings";

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const totalTokens = useAppSelector(selectTotalTokens);
  const totalCost = useAppSelector(selectTotalCost);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:w-[500px] lg:w-[600px]"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <SheetHeader className="border-b px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle>AI Assistant</SheetTitle>
                <SheetDescription>
                  Let's have a chat about your ideas
                </SheetDescription>
                {totalTokens > 0 && (
                  <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                    <span>Tokens: {totalTokens.toLocaleString()}</span>
                    <span>Cost: ${totalCost.toFixed(4)}</span>
                  </div>
                )}
              </div>
              <ChatSettings />
            </div>
          </SheetHeader>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden p-6">
            <ChatInterface />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
