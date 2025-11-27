import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface UseRequireAuthOptions {
  redirectTo?: string;
}

/**
 * useRequireAuth Hook
 *
 * Alternative to ProtectedRoute component - use directly in components
 * that need auth protection. Redirects if not authenticated.
 *
 * @param options.redirectTo - Where to redirect if not authenticated (default: '/')
 *
 * Usage:
 * function Dashboard() {
 *   useRequireAuth(); // Redirects to '/' if not authenticated
 *   return <div>Dashboard content</div>;
 * }
 *
 * function Profile() {
 *   useRequireAuth({ redirectTo: '/login' }); // Custom redirect
 *   return <div>Profile content</div>;
 * }
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { redirectTo = "/" } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Not authenticated - redirect
    if (!isAuthenticated) {
      navigate(redirectTo, { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, redirectTo, navigate, location]);

  return { isAuthenticated };
}
