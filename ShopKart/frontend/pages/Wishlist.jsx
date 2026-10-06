import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Navbar from '../Components/Navbar.jsx';
import WishlistCard from '../Components/WishlistCard.jsx';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [removingId, setRemovingId] = useState(null);
    const [notification, setNotification] = useState('');

    const fetchWishlist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Check customer auth & load profile
            try {
                const customerRes = await api.get('/customers/me');
                setCustomer(customerRes.data?.customer || customerRes.data);
            } catch {
                // If not logged in, redirect to login
                navigate('/login');
                return;
            }

            const response = await api.get('/wishlist');
            // Populate gives array of product objects
            setWishlist(response.data?.wishlist || []);
        } catch (err) {
            console.error('Error fetching wishlist:', err);
            setError("We couldn't load your wishlist.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemove = async (productId) => {
        try {
            setRemovingId(productId);
            await api.delete(`/wishlist/${productId}`);
            
            // Update UI state without full page refresh
            setWishlist((prev) => prev.filter((item) => item._id !== productId));
            
            setNotification('Product removed from wishlist');
            setTimeout(() => setNotification(''), 3000);
        } catch (err) {
            console.error('Failed to remove from wishlist:', err);
            alert(err.response?.data?.error || 'Failed to remove product. Please try again.');
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div className="page-container">
            <Navbar customer={customer} />
            <main className="main-content">
                <div className="wishlist-header">
                    <div>
                        <h2 className="wishlist-title">My Wishlist</h2>
                        {!loading && !error && (
                            <p className="wishlist-count-text">
                                {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
                            </p>
                        )}
                    </div>
                    <button 
                        className="btn-back"
                        onClick={() => navigate('/products')}
                    >
                        &larr; Continue Shopping
                    </button>
                </div>

                {notification && (
                    <div className="alert alert-success wishlist-notification">
                        <span>✅ {notification}</span>
                    </div>
                )}

                {/* 1. LOADING STATE */}
                {loading && (
                    <div className="state-container loading-state">
                        <div className="spinner"></div>
                        <p>Loading your wishlist...</p>
                    </div>
                )}

                {/* 2. ERROR STATE */}
                {!loading && error && (
                    <div className="state-container error-state">
                        <div className="error-icon">❌</div>
                        <h2>Something went wrong.</h2>
                        <p>{error}</p>
                        <button className="btn-primary" style={{ maxWidth: '240px' }} onClick={fetchWishlist}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* 3. EMPTY STATE */}
                {!loading && !error && wishlist.length === 0 && (
                    <div className="state-container empty-state wishlist-empty-state">
                        <div className="empty-icon">❤️</div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save products you love and find them here later.</p>
                        <button 
                            className="btn-primary" 
                            style={{ maxWidth: '260px' }}
                            onClick={() => navigate('/products')}
                        >
                            Browse Products
                        </button>
                    </div>
                )}

                {/* 4. SUCCESS / WISHLIST PRODUCTS GRID */}
                {!loading && !error && wishlist.length > 0 && (
                    <div className="products-grid">
                        {wishlist.map((product) => (
                            <WishlistCard
                                key={product._id}
                                product={product}
                                onRemove={handleRemove}
                                isRemoving={removingId === product._id}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Wishlist;
