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

  // Clear all frontend auth state
  const clearAuthState = () => {
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    delete api.defaults.headers.common["X-XSRF-TOKEN"];
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
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

      setUser((prevUser) => {
        const isDifferent =
          !prevUser ||
          prevUser.id !== userData.id ||
          prevUser.username !== userData.username ||
          prevUser.role !== userData.role;
        return isDifferent
          ? { ...userData, role: userData.role || "student" }
          : prevUser;
      });

      // Only redirect if not already on a protected page
      const publicPaths = ["/login", "/forgot-password", "/verify-reset-otp"];
      if (
        !publicPaths.includes(location.pathname) &&
        location.pathname !== "/"
      ) {
        const redirectPath = location.state?.from?.pathname || "/dashboard";
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      clearAuthState();
      if (
        error.response?.status === 401 &&
        !["/login", "/forgot-password", "/verify-reset-otp"].includes(
          location.pathname
        )
      ) {
        navigate("/login", { state: { from: location }, replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    attachAccessTokenSetter((userData) => {
      setUser((prev) => {
        if (!userData || !prev || prev.id !== userData.id) {
          return userData;
        }
        return prev;
      });
    });

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post(
        "/auth/login",
        { username: email, password },
        { withCredentials: true }
      );

      const { user: userData } = response.data;
      setUser({
        ...userData,
        role: userData.role || "student",
      });

      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      clearAuthState();
      // Add timeout to ensure cookies are cleared before redirect
      setTimeout(() => {
        navigate("/login", { replace: true, state: { from: location } });
        setLoading(false);
      }, 100);
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
      {loading ? (
        <div className="h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        children
      )}
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
