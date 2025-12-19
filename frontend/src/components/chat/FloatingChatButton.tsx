/**
 * FloatingChatButton Component
 *
 * Persistent floating button in bottom-right corner for accessing AI chat.
 * Appears on all authenticated pages for quick access without navigation.
 */

import { MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

interface FloatingChatButtonProps {
  onClick: () => void;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110"
      aria-label="Open AI Assistant"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
}
