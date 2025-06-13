import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { attachAccessTokenSetter } from "../../hooks/apiRefreshToken";
import LoadingSpinner from "../blocks/LoadingSpinner";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const checkAuth = async () => {
    try {
      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
      }

      const response = await api.get("/auth/getloggedinuser", {
        withCredentials: true,
      });

      const userData = response.data;

      setUser((prev) => {
        if (!prev || prev.id !== userData.id) {
          return { ...userData, role: userData.role || "student" };
        }
        return prev;
      });

      // Only redirect if not already on the target page
      if (location.pathname === "/login") {
        const redirectPath = location.state?.from?.pathname || "/dashboard";
        if (redirectPath !== location.pathname) {
          navigate(redirectPath, {
            replace: true,
            state: { from: location },
          });
        }
      }
    } catch (error) {
      setUser(null);
      if (error.response?.status === 401 && location.pathname !== "/login") {
        navigate("/login", {
          state: { from: location },
          replace: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    attachAccessTokenSetter(setUser);
    checkAuth();
  }, [location.pathname]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post(
        "/auth/login",
        { username: email, password },
        { withCredentials: true }
      );

      const { user: userData } = response.data;

      // Update user state immediately
      setUser({
        ...userData,
        role: userData.role || "student",
      });

      // Get redirect path before navigation
      const redirectPath = location.state?.from?.pathname || "/dashboard";

      // Skip checkAuth and navigate directly
      navigate(redirectPath, {
        replace: true,
        state: { from: location }, // Preserve location state
      });
    } catch (err) {
      console.error("Login error", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading? (
        <LoadingSpinner />
      ) : (
        children
      )}
      {/* {!loading && children} */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
