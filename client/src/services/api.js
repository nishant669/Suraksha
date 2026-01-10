// client/src/services/api.js
// Detect the correct API URL based on environment (Vite or CRA)
// client/src/services/api.js

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

// ... rest of your file

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Registration failed");
  return data;
};

export const loginUser = async (credentials) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000); // 8 second timeout

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      signal: controller.signal, // Connect the timeout signal
    });
    clearTimeout(id);
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error("Server took too long to respond.");
    throw error;
  }
};

export const verifyAccount = async (email, otp) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Verification failed");
  return data;
};

export const getWeather = async (lat, lon) => {
  const response = await fetch(`${API_URL}/weather?lat=${lat}&lon=${lon}`);
  if (!response.ok) throw new Error("Weather service unavailable");
  return await response.json();
};

export const getSOSHistory = async () => {
  const response = await fetch(`${API_URL}/sos/history`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch SOS history");
  return await response.json();
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}/user/profile`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return await response.json();
};