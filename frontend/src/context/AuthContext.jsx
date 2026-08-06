import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Sync token and user states on initialization
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Clear legacy values if mismatch occurs
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    const { user: loggedInUser, token: authToken } = response.data;

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setToken(authToken);
    setUser(loggedInUser);
    return response.data;
  };

  // Registration handler
  const register = async (username, email, password) => {
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      { username, email, password },
    );
    const { user: registeredUser, token: authToken } = response.data;

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(registeredUser));
    setToken(authToken);
    setUser(registeredUser);
    return response.data;
  };

  // Sign out handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for simple component context loading
export function useAuth() {
  return useContext(AuthContext);
}
