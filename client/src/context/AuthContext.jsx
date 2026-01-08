import React, { createContext, useContext, useState, useEffect } from 'react';
// Import your api service functions
import * as api from '../services/api';

const AuthContext = createContext();

// EXPORT 1: The custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// EXPORT 2: The provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
        const data = await api.loginUser({ email, password });
        // data contains { access_token: "...", token_type: "bearer" }
        localStorage.setItem('token', data.access_token);

        // Fetch the profile using the new token
        const response = await fetch("http://127.0.0.1:8000/api/user/profile", {
            headers: { 
                'Authorization': `Bearer ${data.access_token}` 
            }
        });

        if (!response.ok) throw new Error("Failed to fetch user profile");

        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
};
  const register = async (userData) => {
    try {
      await api.registerUser(userData);
      return { success: true, requiresOtp: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};