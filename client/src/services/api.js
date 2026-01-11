// client/src/services/api.js
// Detect the correct API URL based on environment (Vite or CRA)
// client/src/services/api.js

// Vite uses import.meta.env instead of process.env
// Hardcode the production URL to be 100% sure while debugging
// services/api.js
// services/api.js mein is line ko check karein
// services/api.js
// Render ka URL hata kar localhost ka URL dalein
const API_URL = 'http://localhost:8000/api'; 

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

// ... baaki poora code same rahega

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
  // 8000 (8s) ko badal kar 30000 (30s) karein
  const id = setTimeout(() => controller.abort(), 30000); 

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });
    clearTimeout(id);
    // ... rest of the code
    
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
export const getCountryNumbers = async (countryCode) => {
  const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
  const data = await res.json();
  // Isse hum police/ambulance ke local numbers nikal sakte hain
  return data[0];
};