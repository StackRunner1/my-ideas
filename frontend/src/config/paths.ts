/**
 * Application Route Paths
 *
 * Centralized route path constants for type-safe navigation.
 * Use these constants instead of hardcoded strings throughout the app.
 *
 * Usage:
 * - In routes: <Route path={PATHS.DASHBOARD} element={<Dashboard />} />
 * - In navigation: navigate(PATHS.PROFILE)
 * - In links: <Link to={PATHS.HOME}>Home</Link>
 */

export const PATHS = {
  // Public routes
  HOME: "/",
  ABOUT: "/about",

  // Authenticated routes
  DASHBOARD: "/dashboard",
  IDEAS: "/ideas",
  PROFILE: "/profile",
} as const;

// Type helper for path values
export type AppPath = (typeof PATHS)[keyof typeof PATHS];
