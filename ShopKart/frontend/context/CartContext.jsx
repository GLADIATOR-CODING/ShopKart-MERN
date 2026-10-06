import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api.js';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState(null);
    const location = useLocation();

    const fetchCart = useCallback(async () => {
        try {
            setCartLoading(true);
            setCartError(null);
            const res = await api.get('/cart');
            setCartItems(res.data?.cart || []);
        } catch (err) {
            if (err.response?.status === 401) {
                // Not authenticated, cart is empty
                setCartItems([]);
            } else {
                setCartError("Unable to load your cart.");
            }
        } finally {
            setCartLoading(false);
        }
    }, []);

    // When on authenticated pages or when route changes, ensure cart is loaded
    useEffect(() => {
        const publicPages = ['/login', '/register'];
        if (!publicPages.includes(location.pathname)) {
            fetchCart();
        } else {
            setCartLoading(false);
        }
    }, [location.pathname, fetchCart]);

    const addToCart = async (productId) => {
        const res = await api.post(`/cart/${productId}`);
        await fetchCart();
        return res.data;
    };

    const updateQuantity = async (productId, quantity) => {
        const res = await api.patch(`/cart/${productId}`, { quantity });
        await fetchCart();
        return res.data;
    };

    const removeFromCart = async (productId) => {
        const res = await api.delete(`/cart/${productId}`);
        await fetchCart();
        return res.data;
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Derived values
    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * (item.quantity || 0);
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartLoading,
            cartError,
            cartCount,
            subtotal,
            fetchCart,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;

