import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Load Effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setLoading(false);
  }, []);

  // 2. Auth Functions (Defined before they are used in the return)
  const login = async (email, password) => {
  try {
    const data = await api.loginUser({ email, password }); 
    
    if (data && data.access_token) {
      // 1. Store token
      localStorage.setItem('token', data.access_token);
      
      // 2. Immediately set a temporary user state to unlock the UI
      const tempUser = { email, name: email.split('@')[0] };
      setUser(tempUser);

      // 3. Try to get full profile in the background
      try {
        const userData = await api.getUserProfile(); 
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {
        console.warn("Profile fetch failed, staying with temp user data.");
        localStorage.setItem('user', JSON.stringify(tempUser));
      }
      
      return { success: true };
    }
    return { success: false, message: "Invalid server response" };
  } catch (error) {
    // This catches the 500 errors and the "Failed to fetch" (CORS) errors
    const errorMsg = error.message.includes("Failed to fetch") 
      ? "Server Connection Error (CORS or Crash)" 
      : error.message;
    
    console.error("Detailed Login Error:", error);
    return { success: false, message: errorMsg };
  }
};
  // Example fix for register in AuthContext.js
const register = async (userData) => {
  try {
    const response = await api.registerUser(userData);
    
    // CHANGE THIS: Don't look for .payload, just return success
    if (response) {
      return { success: true, data: response }; 
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: error.message };
  }
};

  const verifyAccount = async (email, otp) => {
    try {
      await api.verifyAccount(email, otp);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 3. Single Return Statement at the end
  return (
    <AuthContext.Provider value={{ user, login, register, logout, verifyAccount, loading }}>
      {children}
    </AuthContext.Provider>
  );
};