/**
 * ChatSettings Component
 *
 * Settings panel for adjusting AI query parameters (temperature, max tokens).
 * Now fully functional and integrated with Redux state.
 */

import { Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSettings, updateSettings } from "@/store/chatSlice";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

export function ChatSettings() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);

  const handleTemperatureChange = (value: number[]) => {
    dispatch(updateSettings({ temperature: value[0] }));
  };

  const handleMaxTokensChange = (value: number[]) => {
    dispatch(updateSettings({ maxTokens: value[0] }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Chat Settings"
          title="Chat Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Chat Settings</SheetTitle>
          <SheetDescription>Adjust AI query parameters</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Temperature Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="temperature">Temperature</Label>
              <span className="text-sm text-muted-foreground">
                {settings.temperature.toFixed(1)}
              </span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[settings.temperature]}
              onValueChange={handleTemperatureChange}
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness. Lower = more focused, Higher = more creative.
            </p>
          </div>

          {/* Max Tokens Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="maxTokens">Max Tokens</Label>
              <span className="text-sm text-muted-foreground">
                {settings.maxTokens}
              </span>
            </div>
            <Slider
              id="maxTokens"
              min={100}
              max={8192}
              step={100}
              value={[settings.maxTokens]}
              onValueChange={handleMaxTokensChange}
            />
            <p className="text-xs text-muted-foreground">
              Maximum length of AI responses.
            </p>
          </div>

          {/* Info */}
          <div className="space-y-2 rounded border bg-muted/50 p-4">
            <p className="text-sm font-medium">Settings Applied</p>
            <p className="text-xs text-muted-foreground">
              Your settings are active for all new queries. Changes take effect
              immediately.
            </p>
          </div>

          {/* Future Settings Placeholder */}
          <div className="space-y-2 rounded border border-dashed p-4">
            <p className="text-sm font-medium">Coming Soon:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Custom system instructions</li>
              <li>• Default query limits</li>
              <li>• Response format preferences</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
