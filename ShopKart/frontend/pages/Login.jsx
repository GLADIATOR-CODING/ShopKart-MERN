import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Support direct DOM values in case browser autofill did not trigger onChange
        const emailVal = (email || e.target.email?.value || "").trim().toLowerCase();
        const passwordVal = password || e.target.password?.value || "";

        if (!emailVal || !passwordVal) {
            setError("Email and password are required.");
            return;
        }

        try {
            setLoading(true);
            const response = await api.post("/customers/login", {
                email: emailVal,
                password: passwordVal
            });

            if (response.status === 200) {
                if (response.data?.token) {
                    try {
                        localStorage.setItem("shopkart_token", response.data.token);
                    } catch {
                        // ignore storage error
                    }
                }
                navigate("/home", { state: { customer: response.data.customer } });
            }
        } catch (err) {
            if (!err.response) {
                setError(err.code === "ECONNABORTED" 
                    ? "Connection timed out. Please try again." 
                    : "Unable to reach server. Please check your connection and try again.");
            } else {
                setError(err.response?.data?.message || "Invalid credentials");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="brand-badge">
                        <span>🛒 ShopKart</span>
                    </div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Log in to your account</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Don't have an account? <Link to="/register" className="auth-link">Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
