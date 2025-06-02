import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
// import LoadingOverlay from "./LoadingOverlay";

const ProtectedRoute = ({ roles, redirectPath = "/login" }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(redirectPath, {
        state: { from: location },
        replace: true,
      });
    }
  }, [loading, isAuthenticated, navigate, location, redirectPath]);

  if (loading) {
    return <FaSpinner />;
  }

  if (!isAuthenticated) {
    return null; // Already handled by useEffect
  }

  if (roles && !roles.includes(user.role)) {
    return navigate("/unauthorized", { replace: true });
  }

  return <Outlet />;
};

export default ProtectedRoute;
