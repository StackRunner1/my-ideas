import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/Navigation";

/**
 * PublicLayout Component
 *
 * Layout for public routes (accessible to everyone).
 * Uses the adaptive Navigation component that changes based on auth state.
 *
 * The <Outlet /> component renders the matched child route.
 */
export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with adaptive Navigation */}
      <header className="border-b">
        <Navigation />
      </header>

      {/* Main content - renders matched child route */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 MyIdeas. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
