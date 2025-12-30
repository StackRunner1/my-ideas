/**
 * ChatModeToggle Component
 *
 * Compact segmented control for switching between Responses API and Agent SDK modes.
 */

import { MessageSquare, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import type { ChatMode } from "../../store/chatSlice";

interface ChatModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export function ChatModeToggle({ mode, onModeChange }: ChatModeToggleProps) {
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => onModeChange(value as ChatMode)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 h-9">
        <TabsTrigger
          value="responses_api"
          className="gap-1.5 px-3 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ask Questions
        </TabsTrigger>
        <TabsTrigger
          value="agent_sdk"
          className="gap-1.5 px-3 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Take Actions
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
