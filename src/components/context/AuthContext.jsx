import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { attachAccessTokenSetter } from "../../hooks/apiRefreshToken";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

      setUser({
        ...response.data,
        role: response.data.role || "student",
      });
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    attachAccessTokenSetter((userData) => {
      setUser(userData || null);
    });
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post(
        "/auth/login",
        { username: email, password },
        { withCredentials: true }
      );

      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
      }

      setUser({
        ...response.data.user,
        role: response.data.user.role || "student",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {typeof children === "function" ? children({ loading }) : children}
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
