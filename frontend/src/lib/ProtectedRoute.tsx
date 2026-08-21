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
  // Only enforce this guard in production (mirrors ENV.IS_PRODUCTION on
  // the backend). In dev, let every route through unrestricted so local
  // testing doesn't require logging in as every role.
  //
  // IMPORTANT: this does NOT relax anything on the backend — every
  // /api/* route must keep checking the token/role itself regardless of
  // this flag, since this only ever controls what the frontend renders.
  if (!import.meta.env.PROD) {
    // import.meta.env.PROD is true automatically whenever the app is built with vite build (which npm run build does), 
    // and false under vite dev — no env var setup needed on your end at all. 
    // That's the whole point of using it over a custom var: 
    // it can't be misconfigured the way MODE/IS_PRODUCTION was on the backend, 
    // because Vite sets it for you based on the actual build command.
    return <>{children}</>;
  }

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;