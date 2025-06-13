import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { attachAccessTokenSetter } from "../../hooks/apiRefreshToken";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
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

      if (location.pathname === "/login" && userData) {
        const redirectPath = location.state?.from?.pathname || "/dashboard";
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      setUser(null);
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
      if (!initialCheckDone) setInitialCheckDone(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialCheckDone && !loading) {
      if (user && location.pathname === "/login") {
        navigate("/dashboard", { replace: true });
      } else if (
        !user &&
        !["/login", "/forgot-password", "/verify-reset-otp"].includes(
          location.pathname
        )
      ) {
        navigate("/login", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCheckDone, loading, user]);

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

      const redirectPath = location.state?.from?.pathname || "/dashboard";
      navigate(redirectPath, { replace: true });
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
