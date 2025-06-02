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

      const userData = response.data;
      setUser({
        ...userData,
        role: userData.role || "student",
      });

      if (window.location.pathname === "/login") {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setUser(null);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  useEffect(() => {
    attachAccessTokenSetter((userData) => {
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    const initialize = async () => {
      await checkAuth();
      setLoading(false); // Only mark loading complete after auth check
    };

    initialize();
  }, []);

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

      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
      }

      setUser({
        ...userData,
        role: userData.role || "student",
      });

      navigate("/dashboard");
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
            {!loading && children}   {" "}
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
