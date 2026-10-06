import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const WishlistCard = ({ product, onRemove, isRemoving }) => {
    const navigate = useNavigate();
    const { addToCart, cartItems } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const isInCart = (cartItems || []).some(
        (item) => (item.product?._id || item.product) === product._id
    );

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (isAdding) return;
        try {
            setIsAdding(true);
            await addToCart(product._id);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="product-card wishlist-card">
            <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                <span className="wishlist-badge">❤️ SAVED</span>
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
                                disabled={isAdding || product.stock === 0}
                                title="Add another unit to cart"
                            >
                                {isAdding ? '⏳' : '+1'}
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="btn-add-to-cart-card"
                            onClick={handleAddToCart}
                            disabled={isAdding || product.stock === 0}
                        >
                            {isAdding ? '⏳ Adding...' : '🛒 Add to Cart'}
                        </button>
                    )}
                    <button 
                        className="btn-remove-wishlist"
                        onClick={() => onRemove(product._id)}
                        disabled={isRemoving}
                    >
                        {isRemoving ? '⏳ Removing...' : 'Remove ♥'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishlistCard;
