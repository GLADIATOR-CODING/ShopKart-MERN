import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';

const ProductCard = ({ product, isWishlistedInitial = false, onToggle }) => {
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(isWishlistedInitial);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isInCart = (cartItems || []).some(
        (item) => (item.product?._id || item.product) === product._id
    );

    // Keep isSaved in sync with isWishlistedInitial when loaded from backend
    useEffect(() => {
        setIsSaved(isWishlistedInitial);
    }, [isWishlistedInitial]);

    const handleWishlistToggle = async (e) => {
        e.stopPropagation();
        if (isSaving) return;

        setIsSaving(true);
        setErrorMessage('');

        try {
            const res = await api.patch(`/wishlist/${product._id}/toggle`);
            const nextSavedState = res.data?.saved ?? !isSaved;
            setIsSaved(nextSavedState);
            if (onToggle) {
                onToggle(product._id, nextSavedState);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setErrorMessage('Please login to save');
            } else {
                setErrorMessage(err.response?.data?.error || 'Unable to update wishlist. Please try again.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (isAddingToCart) return;

        setIsAddingToCart(true);
        setErrorMessage('');

        try {
            await addToCart(product._id);
        } catch (err) {
            if (err.response?.status === 401) {
                setErrorMessage('Please login to add to cart');
            } else {
                setErrorMessage(err.response?.data?.message || 'Failed to add to cart');
            }
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                <button 
                    className={`product-card-heart-btn ${isSaved ? 'saved' : ''}`}
                    onClick={handleWishlistToggle}
                    disabled={isSaving}
                    title={isSaved ? "Remove from Wishlist" : "Add to Wishlist"}
                    aria-label="Wishlist heart button"
                >
                    {isSaving ? '⏳' : isSaved ? '♥' : '♡'}
                </button>
            </div>
            <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <span className="product-category">{product.category}</span>
                <div className="product-price-stock">
                    <span className="product-price">₹{product.price}</span>
                    <span className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
                    </span>
                </div>

                <div className="product-card-actions">
                    <button 
                        className="btn-view-details"
                        onClick={() => navigate(`/products/${product._id}`)}
                    >
                        View Details
                    </button>
                    {isInCart ? (
                        <div className="card-cart-btn-group">
                            <button 
                                className="btn-go-to-cart-card"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/cart');
                                }}
                                title="Open Cart"
                            >
                                🛒 Go to Cart &rarr;
                            </button>
                            <button 
                                className="btn-add-another-card"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart || product.stock === 0}
                                title="Add another unit to cart"
                            >
                                {isAddingToCart ? '⏳' : '+1'}
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="btn-add-to-cart-card"
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || product.stock === 0}
                        >
                            {isAddingToCart ? '⏳ Adding...' : '🛒 Add to Cart'}
                        </button>
                    )}
                    <button 
                        className={`btn-wishlist-action ${isSaved ? 'saved' : ''}`}
                        onClick={handleWishlistToggle}
                        disabled={isSaving}
                    >
                        {isSaving ? '⏳ Saving...' : isSaved ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
                    </button>
                </div>

                {errorMessage && (
                    <div className="card-error-msg">{errorMessage}</div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;

