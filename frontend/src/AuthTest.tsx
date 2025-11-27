/**
 * Temporary Test Page for Auth Modal
 *
 * This file is for testing the AuthModal component.
 * Delete or replace this after testing is complete.
 */

import { useState } from "react";
import { AuthModal } from "./components/AuthModal";
import { Button } from "./components/ui/button";
import { useAppSelector } from "./store/hooks";

export default function AuthTest() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, status, betaAccess } = useAppSelector(
    (state) => state.auth
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-950 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-center">Auth Testing</h1>

        <div className="space-y-4">
          {/* Auth Status */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
            <h2 className="font-semibold mb-2">Current Status:</h2>
            <ul className="text-sm space-y-1">
              <li>
                <span className="font-medium">Authenticated:</span>{" "}
                <span
                  className={
                    isAuthenticated ? "text-green-600" : "text-red-600"
                  }
                >
                  {isAuthenticated ? "Yes ✓" : "No ✗"}
                </span>
              </li>
              <li>
                <span className="font-medium">Status:</span> {status}
              </li>
              <li>
                <span className="font-medium">Beta Access:</span>{" "}
                {betaAccess === null ? "N/A" : betaAccess ? "Yes" : "No"}
              </li>
            </ul>
          </div>

          {/* Actions */}
          <Button
            onClick={() => setShowAuthModal(true)}
            className="w-full"
            size="lg"
          >
            Open Auth Modal
          </Button>

          {isAuthenticated && (
            <div className="text-center text-sm text-muted-foreground">
              Authentication successful! Check Redux DevTools for state.
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
            <p>
              <strong>Testing Steps:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Click "Open Auth Modal"</li>
              <li>Try signing up with a new email</li>
              <li>Check browser cookies (DevTools → Application)</li>
              <li>Check Redux state (Redux DevTools)</li>
              <li>Check Supabase auth.users table</li>
              <li>Try logging in with same credentials</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="signup"
      />
    </div>
  );
}
