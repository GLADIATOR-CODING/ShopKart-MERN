import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const CartItem = ({ item }) => {
    const navigate = useNavigate();
    const { updateQuantity, removeFromCart } = useCart();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [error, setError] = useState('');

    const product = (item?.product && typeof item?.product === 'object')
        ? item.product
        : { _id: item?.product || item?._id, name: 'Product', price: 0, image: '', stock: 99 };
    const lineTotal = (product.price || 0) * (item.quantity || 1);

    const handleIncrease = async () => {
        if (item.quantity >= product.stock) return;
        try {
            setIsUpdating(true);
            setError('');
            await updateQuantity(product._id, item.quantity + 1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDecrease = async () => {
        if (item.quantity <= 1) return;
        try {
            setIsUpdating(true);
            setError('');
            await updateQuantity(product._id, item.quantity - 1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        try {
            setIsRemoving(true);
            setError('');
            await removeFromCart(product._id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove');
            setIsRemoving(false);
        }
    };

    return (
        <div className="cart-item">
            <div className="cart-item-image" onClick={() => navigate(`/products/${product._id}`)}>
                <img src={product.image} alt={product.name} />
            </div>
            <div className="cart-item-info">
                <h3 className="cart-item-name" onClick={() => navigate(`/products/${product._id}`)}>
                    {product.name}
                </h3>
                <span className="cart-item-price">₹{product.price}</span>
                <span className={`cart-item-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
            </div>
            <div className="cart-item-controls">
                <div className="quantity-controls">
                    <button
                        className="qty-btn"
                        onClick={handleDecrease}
                        disabled={isUpdating || item.quantity <= 1}
                    >
                        −
                    </button>
                    <span className="qty-value">{isUpdating ? '...' : item.quantity}</span>
                    <button
                        className="qty-btn"
                        onClick={handleIncrease}
                        disabled={isUpdating || item.quantity >= product.stock}
                    >
                        +
                    </button>
                </div>
                <span className="cart-item-line-total">₹{lineTotal.toLocaleString('en-IN')}</span>
                <button
                    className="btn-remove-cart"
                    onClick={handleRemove}
                    disabled={isRemoving}
                >
                    {isRemoving ? 'Removing...' : 'Remove'}
                </button>
            </div>
            {error && <div className="cart-item-error">{error}</div>}
        </div>
    );
};

export default CartItem;
