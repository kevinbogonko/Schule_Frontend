import React from "react";
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
import LoadingSpinner from "./components/blocks/LoadingSpinner";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
                <LoadingSpinner />     {" "}
      </div>
    );
  }

  return (
    <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordOTP />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />     {" "}
      {/* Protected Routes */}     {" "}
      <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />     {" "}
      </Route>
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />   {" "}
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
           {" "}
      <Router>
               {" "}
        <AuthProvider>
                    <AppRoutes />       {" "}
        </AuthProvider>
             {" "}
      </Router>
         {" "}
    </ToastProvider>
  );
}

export default App;
