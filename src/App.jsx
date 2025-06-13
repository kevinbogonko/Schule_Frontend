import React, { Suspense } from "react";
import "./App.css";
import { ToastProvider } from "./components/Toast";
import Dashboard from "./components/blocks/Dashboard";
import Login from "./components/blocks/Login";
import ForgotPasswordOTP from "./components/blocks/ForgotPasswordOTP";
import VerifyResetOTP from "./components/blocks/VerifyResetOTP";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/blocks/LoadingSpinner"; // Create this component

// Create an auth checking wrapper
function AuthChecker({ children }) {
  const { loading } = useAuth();
  // Assuming your AuthContext has a loading state
  // console.log(user)
  if (loading) {
    return <LoadingSpinner />; // Show spinner while checking auth
  }

  return children;
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <AuthChecker>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPasswordOTP />} />
              <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthChecker>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
