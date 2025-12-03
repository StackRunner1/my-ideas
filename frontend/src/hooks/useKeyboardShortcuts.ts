/**
 * useKeyboardShortcuts Hook
 * Session 3, Unit 12: Optimistic Updates & UX
 *
 * Provides keyboard navigation and shortcuts for power users
 */

import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description: string;
}

export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  const { key, ctrlKey, shiftKey, altKey, metaKey, handler } = shortcut;

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        // Exception: allow "/" to focus search even from inputs
        if (key !== "/") {
          return;
        }
      }

      const matchesKey = event.key === key;
      const matchesCtrl = ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const matchesShift = shiftKey ? event.shiftKey : !event.shiftKey;
      const matchesAlt = altKey ? event.altKey : !event.altKey;
      const matchesMeta = metaKey ? event.metaKey : !event.metaKey;

      if (
        matchesKey &&
        matchesCtrl &&
        matchesShift &&
        matchesAlt &&
        matchesMeta
      ) {
        event.preventDefault();
        handler(event);
      }
    },
    [key, ctrlKey, shiftKey, altKey, metaKey, handler]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  shortcuts.forEach((shortcut) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeyboardShortcut(shortcut);
  });
}
