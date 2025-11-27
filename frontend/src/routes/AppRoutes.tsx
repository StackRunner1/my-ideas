import { Routes, Route } from "react-router-dom";
import { PATHS } from "@/config/paths";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "@/layouts/PublicLayout";
import { UserLayout } from "@/layouts/UserLayout";
import { useInitAuth } from "@/hooks/useInitAuth";

// Page components (will create these next)
import Home from "@/pages/Home";
import About from "@/pages/About";
import Dashboard from "@/pages/Dashboard";
import Ideas from "@/pages/Ideas";
import Profile from "@/pages/Profile";

/**
 * AppRoutes Component
 *
 * Centralized routing configuration for the entire application.
 * Uses nested routes with layouts to automatically switch UI based on auth state.
 *
 * Structure:
 * - PublicLayout: Wraps public routes, shows "Sign In" button
 * - UserLayout: Wraps authenticated routes, shows navigation with logout
 * - ProtectedRoute: Guards routes that require authentication
 */
export function AppRoutes() {
  const { isInitialized, isLoading, error } = useInitAuth();

  // Show loading spinner during auth initialization
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Authentication Error</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route element={<PublicLayout />}>
        <Route path={PATHS.HOME} element={<Home />} />
        <Route path={PATHS.ABOUT} element={<About />} />
      </Route>

      {/* Authenticated routes - require login */}
      <Route element={<UserLayout />}>
        <Route
          path={PATHS.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.IDEAS}
          element={
            <ProtectedRoute>
              <Ideas />
            </ProtectedRoute>
          }
        />
        <Route
          path={PATHS.PROFILE}
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
