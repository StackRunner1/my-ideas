import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearSession } from "@/store/authSlice";
import * as authService from "@/services/authService";
import { setAuthToken } from "@/lib/apiClient";
import { PATHS } from "@/config/paths";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Loader2 } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

/**
 * Navigation Component
 *
 * Main navigation bar that adapts based on authentication state.
 *
 * Public State (not authenticated):
 * - Logo + nav links (Home, About)
 * - "Sign In" button that triggers AuthModal
 *
 * Authenticated State:
 * - Logo + nav links (Home, Dashboard, Ideas)
 * - User avatar with dropdown containing email and logout
 *
 * Logout Process (demonstrates proper httpOnly cookie cleanup):
 * 1. Call backend /auth/logout (clears httpOnly cookies, revokes tokens)
 * 2. Clear Redux auth state
 * 3. Clear in-memory token
 * 4. Clear localStorage (if any)
 * 5. Redirect to home
 */
export function Navigation() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Get user email from Redux (would come from profile fetch)
  // For now, we'll use a placeholder
  const userEmail = "user@example.com"; // TODO: Get from Redux state after profile fetch

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      // 1. Call backend logout endpoint
      // This is CRITICAL for httpOnly cookies - JavaScript cannot delete them
      // The backend must call Supabase to revoke the refresh token
      await authService.logout();

      // 2. Clear Redux auth state
      dispatch(clearSession());

      // 3. Clear in-memory token
      setAuthToken(null);

      // 4. Clear localStorage (if we stored any auth data there)
      // Note: We don't store tokens in localStorage for security
      // but clearing it ensures no stale auth-related data remains
      localStorage.removeItem("auth"); // Example, adjust based on your needs

      // 5. Redirect to home
      navigate(PATHS.HOME);
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, clear local state to prevent inconsistent UI
      dispatch(clearSession());
      setAuthToken(null);
      navigate(PATHS.HOME);
    } finally {
      setLoggingOut(false);
    }
  };

  // Get user initials for avatar
  const getUserInitial = () => {
    if (!userEmail) return "U";
    return userEmail.charAt(0).toUpperCase();
  };

  return (
    <>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={PATHS.HOME} className="text-xl font-bold">
            MyIdeas
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link to={PATHS.HOME} className="text-sm hover:underline">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={PATHS.DASHBOARD} className="text-sm hover:underline">
                  Dashboard
                </Link>
                <Link to={PATHS.IDEAS} className="text-sm hover:underline">
                  Ideas
                </Link>
              </>
            ) : (
              <Link to={PATHS.ABOUT} className="text-sm hover:underline">
                About
              </Link>
            )}

            {/* Auth Section */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={loggingOut}>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    {loggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{getUserInitial()}</AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        My Account
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
            )}
          </nav>
        </div>
      </div>

      {/* Auth Modal for public users */}
      {!isAuthenticated && (
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      )}
    </>
  );
}
