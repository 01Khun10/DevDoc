import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Logs out and redirects to /login when any passed query/mutation error is a 401.
export default function useAuthGuard(...errors) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const hasUnauthorized = errors.some((error) => error?.status === 401);

  useEffect(() => {
    if (hasUnauthorized) {
      logout();
      navigate("/login", { replace: true });
    }
  }, [hasUnauthorized, logout, navigate]);

  return hasUnauthorized;
}
