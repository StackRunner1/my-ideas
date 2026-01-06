/**
 * ClarificationPrompt Component
 *
 * Displays agent clarification questions with suggested responses.
 */

import { HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface ClarificationPromptProps {
  question: string;
  suggestions?: string[];
  onResponse: (response: string) => void;
}

export function ClarificationPrompt({
  question,
  suggestions,
  onResponse,
}: ClarificationPromptProps) {
  return (
    <Card className="border-l-4 border-l-amber-500 bg-amber-500/5 p-4">
      {/* Header */}
      <div className="mb-3 flex items-start gap-2">
        <HelpCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-400" />
        <div className="flex-1">
          <h4 className="mb-1 font-medium text-sm">
            Agent Needs Clarification
          </h4>
          <p className="text-sm text-muted-foreground">{question}</p>
        </div>
      </div>

      {/* Suggested responses */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Suggested responses:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onResponse(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
