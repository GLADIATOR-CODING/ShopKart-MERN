import axios from "axios";

// Dynamically use current hostname so testing on a phone over LAN targets computer's backend
const backendHost = (typeof window !== "undefined" && window.location.hostname) ? window.location.hostname : "localhost";

const api = axios.create({
    baseURL: `http://${backendHost}:8000`,
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
