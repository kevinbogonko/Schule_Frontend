import { useAuth } from "../components/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
// import LoadingSpinner from "./LoadingSpinner";
import { FaSpinner } from "react-icons/fa";

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FaSpinner className="animate" />;
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
