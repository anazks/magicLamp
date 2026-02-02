import { Routes, Route, Navigate } from "react-router-dom";
import Banner from './Component/Banner/Banner';
import './App.css';
import Home from "./Pages/Home";
import LoginPage from "./Pages/LoginPage";
import Register from "./Pages/Register";
import AuthProvider, { useAuth } from "./Context/userContext";  // make sure useAuth is exported
import AdminLayout from "./Admin/AdminLayout";
import Unauthorized from "./Pages/Unauthorized";

// Protected Admin Route Component
function AdminProtectedRoute() {
  const { isAdmin, setIsAdmin } = useAuth();   // ← get real admin status from context
  localStorage.setItem("isAdmin", isAdmin ? "true" : "false");


  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AdminLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Banner />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        {/* Admin-only route — protected */}
        <Route path="/admin" element={<AdminProtectedRoute />} />

        {/* 403 / Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-all → redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  );
}