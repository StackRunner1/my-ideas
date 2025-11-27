/**
 * Auth Modal Component
 *
 * Reusable modal for sign-in and sign-up with form validation.
 * Uses shadcn/ui components for consistent styling.
 */

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setSession } from "@/store/authSlice";
import { fetchUserProfile } from "@/store/authSlice";
import { setAuthToken } from "@/lib/apiClient";
import * as authService from "@/services/authService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = "signin",
}: AuthModalProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState("");

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [signUpAcceptTerms, setSignUpAcceptTerms] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState("");

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);

    try {
      const response = await authService.login({
        email: signInEmail,
        password: signInPassword,
      });

      // Set session in Redux
      dispatch(setSession({ expiresAt: response.expiresAt }));

      // Store token in memory (though backend uses cookies primarily)
      // This is optional since we rely on httpOnly cookies
      setAuthToken(null); // We don't have access token in response, cookies handle it

      // Fetch user profile
      dispatch(fetchUserProfile());

      // Close modal
      onOpenChange(false);

      // Reset form
      setSignInEmail("");
      setSignInPassword("");
    } catch (error: any) {
      setSignInError(error.message || "Login failed");
    } finally {
      setSignInLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");

    // Validate password match
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match");
      return;
    }

    // Validate password length
    if (signUpPassword.length < 8) {
      setSignUpError("Password must be at least 8 characters");
      return;
    }

    // Validate terms acceptance
    if (!signUpAcceptTerms) {
      setSignUpError("You must accept the terms and conditions");
      return;
    }

    setSignUpLoading(true);

    try {
      const response = await authService.signup({
        email: signUpEmail,
        password: signUpPassword,
      });

      // Set session in Redux
      dispatch(setSession({ expiresAt: response.expiresAt }));

      // Store token in memory
      setAuthToken(null); // Cookies handle authentication

      // Fetch user profile
      dispatch(fetchUserProfile());

      // Close modal
      onOpenChange(false);

      // Reset form
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");
      setSignUpAcceptTerms(false);
    } catch (error: any) {
      setSignUpError(error.message || "Signup failed");
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "signin" | "signup")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                  disabled={signInLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={signInLoading}
                />
              </div>

              <div className="text-sm text-right">
                <a href="#" className="text-muted-foreground hover:underline">
                  Forgot password?
                </a>
              </div>

              {signInError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {signInError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={signInLoading}>
                {signInLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                  disabled={signUpLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={signUpLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">
                  Confirm Password
                </Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={signUpLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={signUpAcceptTerms}
                  onCheckedChange={(checked) =>
                    setSignUpAcceptTerms(checked as boolean)
                  }
                  disabled={signUpLoading}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the{" "}
                  <a href="#" className="text-primary hover:underline">
                    terms and conditions
                  </a>
                </label>
              </div>

              {signUpError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {signUpError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={signUpLoading}>
                {signUpLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
