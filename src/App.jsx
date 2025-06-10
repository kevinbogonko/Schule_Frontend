import React, { useState } from "react";
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
              {/* Add more protected routes here */}
            </Route>
            <Route
              path="*"
              element={
                localStorage.getItem("authToken") ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;