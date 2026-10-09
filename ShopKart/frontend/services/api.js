import axios from "axios";

// In production (Vercel), set VITE_API_URL to your Render backend URL.
// In development, falls back to localhost:8000
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

// Automatically attach Bearer token as fallback alongside cookies
api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("shopkart_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch {
        // localStorage not available
    }
    return config;
}, (error) => Promise.reject(error));

export default api;
