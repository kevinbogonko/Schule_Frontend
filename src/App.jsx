import React from "react";
import "./App.css";
import { ToastProvider } from "./components/Toast";
import Dashboard from "./components/blocks/Dashboard";
import Login from "./components/blocks/Login";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route
              path="/"
              element={
                <Navigate to="/dashboard" replace />
              }
            />

            <Route
              path="*"
              element={
                <Navigate to="/dashboard" replace />
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;