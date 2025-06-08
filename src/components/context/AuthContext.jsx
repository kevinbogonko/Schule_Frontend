import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { attachAccessTokenSetter } from "../../hooks/apiRefreshToken";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      let cookie = parts.pop().split(";").shift();
      // Handle URL encoded cookies
      try {
        cookie = decodeURIComponent(cookie);
      } catch (e) {
        console.error("Error decoding cookie:", e);
      }
      console.log(`[Auth] Retrieved cookie ${name}:`, cookie);
      return cookie;
    }
    return undefined;
  };

  const checkAuth = async () => {
    console.log("[Auth] Running checkAuth");
    try {
      
      let csrf = localStorage.getItem('xsrf-token') || getCookie("XSRF-TOKEN");
      if (!csrf) {
        console.error("[Auth] No XSRF token found in cookies");
        throw new Error("Missing XSRF token");
      }

      api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
      console.log("[Auth] Set CSRF token header");

      const response = await api.get("/auth/getloggedinuser", {
        withCredentials: true, // Ensure credentials are sent
      });

      const userData = response.data;
      console.log("[Auth] Received user data:", userData);

      setUser((prevUser) => {
        const isDifferent =
          !prevUser ||
          prevUser.id !== userData.id ||
          prevUser.username !== userData.username ||
          prevUser.role !== userData.role;

        if (isDifferent) {
          console.log("[Auth] Updating user context");
          return { ...userData, role: userData.role || "student" };
        }

        console.log("[Auth] User context unchanged");
        return prevUser;
      });

      if (location.pathname === "/login") {
        const redirectPath = location.state?.from?.pathname || "/dashboard";
        console.log(`[Auth] On /login, redirecting to: ${redirectPath}`);
        if (redirectPath !== "/login") {
          navigate(redirectPath, { replace: true });
        }
      }
    } catch (error) {
      console.error("[Auth] checkAuth error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      setUser(null);
      if (location.pathname !== "/login") {
        console.log("[Auth] Redirecting to login");
        navigate("/login", { state: { from: location }, replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[Auth] Running useEffect for auth setup");

    attachAccessTokenSetter((userData) => {
      console.log("[Auth] Access token updated, updating user:", userData);
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

  const login = async (email, password) => {
    console.log("[Auth] Logging in with email:", email);
    try {
      const response = await api.post(
        "/auth/login",
        {
          username: email,
          password: password,
        },
        { withCredentials: true }
      );

      const { user: userData, csrf_token } = response.data;
      console.log("[Auth] Login successful, user data:", userData);

      localStorage.setItem('xsrf-token', csrf_token)

      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
        console.log("[Auth] Set CSRF token header after login");
      }

      setUser({
        ...userData,
        role: userData.role || "student",
      });

      const redirectPath = location.state?.from?.pathname || "/dashboard";
      console.log("[Auth] Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("[Auth] Login error:", err);
      throw err;
    }
  };

  const logout = async () => {
    console.log("[Auth] Logging out");
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      console.log("[Auth] Logout successful");
    } catch (err) {
      console.error("[Auth] Logout error:", err);
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
      {!loading && children}
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
