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
    const cookie =
      parts.length === 2 ? parts.pop().split(";").shift() : undefined;
    console.debug(`[Auth] Retrieved cookie ${name}:`, cookie);
    return cookie;
  };

  const checkAuth = async () => {
    console.debug("[Auth] Running checkAuth");
    try {
      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
        console.debug("[Auth] Set CSRF token header");
      }

      console.debug("[Auth] Sending request to /auth/getloggedinuser");
      const response = await api.get("/auth/getloggedinuser", {
        withCredentials: true,
      });

      const userData = response.data;
      console.debug("[Auth] Received user data:", userData);

      setUser((prevUser) => {
        const isDifferent =
          !prevUser ||
          prevUser.id !== userData.id ||
          prevUser.username !== userData.username ||
          prevUser.role !== userData.role;

        if (isDifferent) {
          console.debug("[Auth] Updating user context");
          return { ...userData, role: userData.role || "student" };
        }

        console.debug("[Auth] User context unchanged");
        return prevUser;
      });

      if (location.pathname === "/login") {
        const redirectPath = location.state?.from?.pathname || "/dashboard";
        console.debug(`[Auth] On /login, redirecting to: ${redirectPath}`);
        if (redirectPath !== "/login") {
          navigate(redirectPath, { replace: true });
        }
      }
    } catch (error) {
      console.error("[Auth] checkAuth error:", error);
      setUser(null);
      if (error.response?.status === 401 && location.pathname !== "/login") {
        console.debug("[Auth] Unauthorized, redirecting to login");
        navigate("/login", { state: { from: location }, replace: true });
      }
    } finally {
      setLoading(false);
      console.debug("[Auth] Finished checkAuth");
    }
  };

  useEffect(() => {
    console.debug("[Auth] Running useEffect for auth setup");

    attachAccessTokenSetter((userData) => {
      console.debug("[Auth] Access token updated, updating user:", userData);
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
    console.debug("[Auth] Logging in with email:", email);
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
      console.debug("[Auth] Login successful, user data:", userData);

      const csrf = getCookie("XSRF-TOKEN");
      if (csrf) {
        api.defaults.headers.common["X-XSRF-TOKEN"] = csrf;
        console.debug("[Auth] Set CSRF token header after login");
      }

      setUser({
        ...userData,
        role: userData.role || "student",
      });

      const redirectPath = location.state?.from?.pathname || "/dashboard";
      console.debug("[Auth] Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("[Auth] Login error:", err);
      throw err;
    }
  };

  const logout = async () => {
    console.debug("[Auth] Logging out");
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      console.debug("[Auth] Logout successful");
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
