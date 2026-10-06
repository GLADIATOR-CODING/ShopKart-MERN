import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../services/api.js";
import ProfileModal from "./ProfileModal.jsx";
import { useCart } from '../context/CartContext.jsx';

const Navbar = ({ customer }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userData, setUserData] = useState(customer);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { cartCount, clearCart } = useCart();

    useEffect(() => {
        if (customer && customer.fullName && customer.fullName !== "Guest") {
            setUserData(customer);
        } else {
            api.get("/customers/me")
                .then((res) => {
                    const cust = res.data?.customer || res.data;
                    if (cust && cust.fullName) {
                        setUserData(cust);
                    }
                })
                .catch(() => {
                    // Not logged in or error
                });
        }
    }, [customer]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await api.post("/customers/logout");
        } catch {
        } finally {
            try {
                localStorage.removeItem("shopkart_token");
                clearCart();
            } catch {
                // ignore
            }
            setIsLoggingOut(false);
            navigate("/login");
        }
    };

    const isProductsActive = location.pathname.startsWith("/products");
    const isHomeActive = location.pathname === "/home";
    const isWishlistActive = location.pathname.startsWith("/wishlist");
    const isCartActive = location.pathname.startsWith("/cart");

    const formatDisplayName = (fullName) => {
        if (!fullName) return "Account";
        return fullName
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getInitials = (fullName) => {
        if (!fullName) return "U";
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <>
            <header className="navbar">
                <div className="navbar-inner">
                    {/* Brand */}
                    <div 
                        className="nav-brand" 
                        onClick={() => navigate('/home')}
                        role="button"
                        tabIndex={0}
                        title="ShopKart Home"
                    >
                        <div className="nav-brand-logo-icon">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>
                        </div>
                        <span className="nav-brand-text">
                            Shop<span className="nav-brand-accent">Kart</span>
                        </span>
                    </div>

                    {/* Navigation Items */}
                    <nav className="nav-links">
                        <Link 
                            to="/home" 
                            className={`nav-link-item home-item ${isHomeActive ? 'active' : ''}`}
                            title="Go to Home"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            <span className="nav-link-text">Home</span>
                        </Link>

                        <Link 
                            to="/products" 
                            className={`nav-link-item products-item ${isProductsActive ? 'active' : ''}`}
                            title="Browse Products"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="7" height="7" x="3" y="3" rx="1.5" />
                                <rect width="7" height="7" x="14" y="3" rx="1.5" />
                                <rect width="7" height="7" x="14" y="14" rx="1.5" />
                                <rect width="7" height="7" x="3" y="14" rx="1.5" />
                            </svg>
                            <span className="nav-link-text">Products</span>
                        </Link>

                        <Link 
                            to="/wishlist" 
                            className={`nav-link-item wishlist-item ${isWishlistActive ? 'active' : ''}`}
                            title="Saved Wishlist"
                        >
                            <svg 
                                width="17" 
                                height="17" 
                                viewBox="0 0 24 24" 
                                fill={isWishlistActive ? "currentColor" : "none"} 
                                stroke="currentColor" 
                                strokeWidth="2.4" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                            <span className="nav-link-text">Wishlist</span>
                        </Link>

                        <Link 
                            to="/cart" 
                            className={`nav-link-item nav-cart-item ${isCartActive ? 'active' : ''}`}
                            title="Shopping Cart"
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill={isCartActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>
                            <span className="nav-link-text">({cartCount})</span>
                        </Link>
                    </nav>

                    {/* User Profile */}
                    <div className="nav-user-actions">
                        <button 
                            className="nav-user-profile-btn"
                            onClick={() => setIsProfileOpen(true)}
                            title="View Profile, Settings & Logout"
                            type="button"
                        >
                            <div className="nav-user-avatar">
                                {getInitials(userData?.fullName)}
                            </div>
                            <span className="nav-user-name">
                                {formatDisplayName(userData?.fullName)}
                            </span>
                            <div className="nav-user-settings-icon" title="Settings">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                customer={userData}
                onLogout={handleLogout}
            />
        </>
    );
};

export default Navbar;
