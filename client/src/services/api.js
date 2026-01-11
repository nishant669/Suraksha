// client/src/services/api.js

// 🟢 CRITICAL CHANGE: Use Render Backend URL for Production
// Localhost hata diya hai, ab ye seedha Cloud se connect karega.
const API_URL = 'https://suraksha-a74u.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

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
  const id = setTimeout(() => controller.abort(), 30000); // 30s timeout for slow render wake-up

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });
    clearTimeout(id);
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error("Server sleeping. Try again in 30s.");
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

export const createSOS = async (sosData) => {
  const response = await fetch(`${API_URL}/sos/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(sosData),
  });
  if (!response.ok) throw new Error("Failed to send SOS");
  return await response.json();
};

export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}/user/profile`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return await response.json();
};

export const getCountryNumbers = async (countryCode) => {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const data = await res.json();
    return data[0];
  } catch (e) {
    console.error("Country API failed");
    return null;
  }
};