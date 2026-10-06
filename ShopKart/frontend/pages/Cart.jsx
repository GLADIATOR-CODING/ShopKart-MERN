import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Navbar from '../Components/Navbar.jsx';
import CartItem from '../Components/CartItem.jsx';
import { useCart } from '../context/CartContext.jsx';

const Cart = () => {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const { cartItems, cartLoading, cartError, cartCount, subtotal, fetchCart } = useCart();

    useEffect(() => {
        const loadCustomer = async () => {
            try {
                const res = await api.get('/customers/me');
                setCustomer(res.data?.customer || res.data);
            } catch {
                navigate('/login');
            }
        };
        loadCustomer();
    }, [navigate]);

    return (
        <div className="page-container">
            <Navbar customer={customer} />
            <main className="main-content">
                <div className="cart-header">
                    <div>
                        <h2 className="cart-title">My Cart</h2>
                        {!cartLoading && !cartError && (
                            <p className="cart-count-text">
                                {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
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

                {/* Loading State */}
                {cartLoading && (
                    <div className="state-container loading-state">
                        <div className="spinner"></div>
                        <p>Loading your cart...</p>
                    </div>
                )}

                {/* Error State */}
                {!cartLoading && cartError && (
                    <div className="state-container error-state">
                        <div className="error-icon">❌</div>
                        <h2>Unable to load your cart.</h2>
                        <p>{cartError}</p>
                        <button className="btn-primary" style={{ maxWidth: '240px' }} onClick={fetchCart}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!cartLoading && !cartError && cartItems.length === 0 && (
                    <div className="state-container empty-state cart-empty-state">
                        <div className="empty-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything yet.</p>
                        <button
                            className="btn-primary"
                            style={{ maxWidth: '260px' }}
                            onClick={() => navigate('/products')}
                        >
                            Browse Products
                        </button>
                    </div>
                )}

                {/* Cart Items + Order Summary */}
                {!cartLoading && !cartError && cartItems.length > 0 && (
                    <div className="cart-layout">
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <CartItem key={item._id || item.product?._id} item={item} />
                            ))}
                        </div>
                        <div className="order-summary">
                            <h3 className="order-summary-title">Order Summary</h3>
                            <div className="order-summary-row">
                                <span>Items</span>
                                <span>{cartCount}</span>
                            </div>
                            <div className="order-summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="order-summary-divider"></div>
                            <div className="order-summary-row order-summary-total">
                                <span>Total</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <button 
                                className="btn-checkout"
                                onClick={() => alert(`🎉 Order Ready for Checkout! Total: ₹${subtotal.toLocaleString('en-IN')} (${cartCount} items). The Checkout and Payment flow will be connected in Lab-06.`)}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;
