import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/AuthModal";
import { PATHS } from "@/config/paths";

/**
 * PublicLayout Component
 *
 * Layout for unauthenticated users (public routes).
 * Features:
 * - Simple header with logo and "Sign In" button
 * - AuthModal for authentication
 * - Clean, minimal design
 *
 * The <Outlet /> component renders the matched child route.
 */
export function PublicLayout() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to={PATHS.HOME} className="text-xl font-bold">
            MyIdeas
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link to={PATHS.HOME} className="text-sm hover:underline">
              Home
            </Link>
            <Link to={PATHS.ABOUT} className="text-sm hover:underline">
              About
            </Link>
            <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
          </nav>
        </div>
      </header>

      {/* Main content - renders matched child route */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer (optional) */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 MyIdeas. All rights reserved.
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
