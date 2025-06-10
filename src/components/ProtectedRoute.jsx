import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Persist auth state
  useEffect(() => {
    if (user?.token) {
      localStorage.setItem("authToken", user.token);
    }
  }, [user]);

  if (loading) return <div className="full-page-loader">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
