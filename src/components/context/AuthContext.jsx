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

      // ✅ Only redirect if on a public route
      const publicRoutes = ["/login", "/forgot-password", "/verify-reset-otp"];
      if (publicRoutes.includes(location.pathname)) {
        const redirectPath = location.state?.from?.pathname || "/dashboard";
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      setUser(null);

      const publicRoutes = ["/login", "/forgot-password", "/verify-reset-otp"];
      const isPublic = publicRoutes.includes(location.pathname);

      if (error.response?.status === 401 && !isPublic) {
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

    checkAuth(); // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
      }

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
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });

      localStorage.clear();
      sessionStorage.clear();

      setUser(null);

      // ✅ Force reload to fully clear state and cookies
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error", err);
      window.location.href = "/login";
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
