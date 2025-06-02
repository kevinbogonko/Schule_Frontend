import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../components/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
// import LoadingSpinner from "./LoadingSpinner"; // Create this component

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FaSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
