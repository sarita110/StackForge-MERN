import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent-light" />
      </div>
    );
  }

  // If user is not authenticated or does not have admin privileges, redirect to index dashboard
  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
