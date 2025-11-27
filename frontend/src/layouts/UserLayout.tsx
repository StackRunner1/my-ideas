import { Outlet } from "react-router-dom";
// import { Navigation } from '@/components/Navigation'; // Will create in Unit 14

/**
 * UserLayout Component
 *
 * Layout for authenticated users.
 * Features:
 * - Navigation bar with logo, nav links, and user menu
 * - Avatar dropdown with logout functionality
 * - Visual distinction from PublicLayout
 *
 * The <Outlet /> component renders the matched child route.
 */
export function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Navigation component will be added in Unit 14
          </p>
        </div>
        {/* <Navigation /> */}
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
    </div>
  );
}
