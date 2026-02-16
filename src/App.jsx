import React from "react";
import "./App.css";
import { ToastProvider } from "./components/ui/Toast";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/LoginPage";
import ForgotPasswordOTP from "./components/blocks/Auth/ForgotPasswordOTP";
import VerifyResetOTP from "./components/blocks/Auth/VerifyResetOTP";
import ContactForm from "./components/blocks/Analytics/ContactForm"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/context/AuthContext";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
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
            <Route path="/contact" element={<ContactForm />} />     {" "}
      {/* Protected Routes */}     {" "}
      <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />     {" "}
      </Route>
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
       {" "}
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