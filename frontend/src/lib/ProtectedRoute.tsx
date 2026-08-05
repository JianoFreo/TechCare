import { Navigate } from "react-router";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to view this route, e.g. ["frontdesk-staff"]. */
  allowedRoles?: string[];
}

/**
 * Guards a route on the frontend: no token -> back to /login,
 * wrong role for this route -> back to /login.
 *
 * NOTE: this only prevents the page from being *displayed*. It is not a
 * substitute for backend auth — every /api/* route must independently
 * verify the token and role itself, because a determined user can always
 * skip the frontend and call the API directly. This guard exists purely
 * so the UI doesn't render another role's dashboard when someone
 * navigates to its URL directly.
 */
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;