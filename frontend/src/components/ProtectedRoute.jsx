import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  // Show a blank loading interface while validating user session
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-brand-accent-light" />
      </div>
    );
  }

  // If no auth token is found, redirect to the login form
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authorization matches, load child component tree
  return children;
}
