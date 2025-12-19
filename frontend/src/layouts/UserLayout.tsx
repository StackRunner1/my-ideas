import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { FloatingChatButton } from "@/components/chat/FloatingChatButton";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

/**
 * UserLayout Component
 *
 * Layout for authenticated users.
 * Features:
 * - Navigation bar with logo, nav links, and user menu
 * - Avatar dropdown with logout functionality
 * - Floating chat button with drawer (accessible from all authenticated pages)
 * - Visual distinction from PublicLayout
 *
 * The <Outlet /> component renders the matched child route.
 */
export function UserLayout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Navigation */}
      <header className="border-b">
        <Navigation />
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

      {/* Floating Chat Button & Drawer */}
      <FloatingChatButton onClick={() => setChatOpen(true)} />
      <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
