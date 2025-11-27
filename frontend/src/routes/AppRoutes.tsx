import { Routes, Route } from "react-router-dom";
import { PATHS } from "@/config/paths";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicLayout } from "@/layouts/PublicLayout";
import { UserLayout } from "@/layouts/UserLayout";

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
