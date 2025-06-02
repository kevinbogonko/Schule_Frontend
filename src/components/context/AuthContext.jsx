import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../hooks/apiRefreshToken";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Secure storage with fallback
  const authStorage = {
    get: () => {
      try {
        return JSON.parse(
          sessionStorage.getItem("auth") || localStorage.getItem("auth")
        );
      } catch {
        return null;
      }
    },
    set: (data) => {
      const storage = data?.rememberMe ? localStorage : sessionStorage;
      storage.setItem("auth", JSON.stringify(data));
      // Clear the other storage
      (data?.rememberMe ? sessionStorage : localStorage).removeItem("auth");
    },
    clear: () => {
      sessionStorage.removeItem("auth");
      localStorage.removeItem("auth");
    },
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const savedAuth = authStorage.get();
      if (savedAuth) {
        setUser(savedAuth.user);

        // Verify the session is still valid
        try {
          await api.get("/auth/validate", { withCredentials: true });
        } catch (error) {
          authStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials, rememberMe = false) => {
    try {
      const response = await api.post("/auth/login", credentials, {
        withCredentials: true,
      });

      const userData = {
        ...response.data.user,
        role: response.data.user.role || "user",
      };

      setUser(userData);
      authStorage.set({ user: userData, rememberMe });

      // Redirect to intended location or default
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
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
      authStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
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
