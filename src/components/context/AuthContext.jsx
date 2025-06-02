import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../hooks/apiRefreshToken"; // Adjust the import path as needed

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const savedUser = sessionStorage.getItem("authUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem("authUser");
      }
    }
    checkAuth();
  }, []);

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
      const userObj = {
        ...userData,
        role: userData.role || "student",
      };

      setUser(userObj);
      sessionStorage.setItem("authUser", JSON.stringify(userObj));

      if (location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post(
        "/auth/login",
        {
          username: email,
          password: password,
        },
        { withCredentials: true }
      );

      const { user: userData } = response.data;
      const userObj = {
        ...userData,
        role: userData.role || "student",
      };

      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
      }

      setUser(userObj);
      sessionStorage.setItem("authUser", JSON.stringify(userObj));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      sessionStorage.removeItem("authUser");
      navigate("/", { replace: true });
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
