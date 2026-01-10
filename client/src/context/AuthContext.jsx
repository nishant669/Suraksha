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
    console.log("Attempting login for:", email);
    try {
      const data = await api.loginUser({ email, password }); 
      console.log("Login success, token received");
      
      // 1. Save Token First
      localStorage.setItem('token', data.access_token);

      // 2. Fetch Profile (Wrap in try/catch so login doesn't fully fail if profile fails)
      try {
        const userData = await api.getUserProfile(); 
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (profileError) {
        console.error("Profile fetch failed, using fallback:", profileError);
        // Fallback: Create a basic user object from the email if profile fails
        const fallbackUser = { email: email, name: email.split('@')[0] };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
      }
      
      return { success: true };
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
      await api.registerUser(userData);
      return { success: true }; // Simplified as you aborted OTP
    } catch (error) {
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