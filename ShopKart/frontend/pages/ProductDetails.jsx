import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Navbar from '../Components/Navbar.jsx';
import { useCart } from '../context/CartContext.jsx';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart, cartItems } = useCart();
    const isInCart = (cartItems || []).some(
        (item) => (item.product?._id || item.product) === id
    );

    useEffect(() => {
        const fetchProductAndWishlist = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch product details, user wishlist, and profile in parallel
                const [productRes, wishlistRes, customerRes] = await Promise.allSettled([
                    api.get(`/products/${id}`),
                    api.get('/wishlist'),
                    api.get('/customers/me')
                ]);

                if (productRes.status === 'fulfilled') {
                    setProduct(productRes.value.data);
                } else {
                    throw new Error('Product not found');
                }

                if (wishlistRes.status === 'fulfilled') {
                    const savedIds = (wishlistRes.value.data?.wishlist || []).map(p => p._id);
                    setIsWishlisted(savedIds.includes(id));
                }

                if (customerRes.status === 'fulfilled') {
                    setCustomer(customerRes.value.data?.customer || customerRes.value.data);
                }
            } catch (err) {
                console.error('Error fetching product details:', err);
                setError('Something went wrong while loading the product.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductAndWishlist();
        }
    }, [id]);

    const handleWishlistToggle = async () => {
        try {
            setIsWishlistLoading(true);
            const res = await api.patch(`/wishlist/${id}/toggle`);
            setIsWishlisted(res.data?.saved ?? !isWishlisted);
        } catch (err) {
            alert(err.response?.data?.error || 'Please login to manage your wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Navbar customer={customer} />
            <main className="main-content">
                <button className="btn-back" onClick={() => navigate('/products')}>
                    &larr; Back to Products
                </button>

                {loading && (
                    <div className="state-container loading-state">
                        <div className="spinner"></div>
                        <p>Loading product details...</p>
                    </div>
                )}

                {error && (
                    <div className="state-container error-state">
                        <p>{error}</p>
                        <button className="btn-primary" onClick={() => navigate('/products')}>Go Back</button>
                    </div>
                )}

                {!loading && !error && product && (
                    <div className="product-details-container">
                        <div className="product-details-image">
                            <img src={product.image} alt={product.name} />
                        </div>
                        <div className="product-details-info">
                            <span className="details-category">{product.category}</span>
                            <h2 className="details-title">{product.name}</h2>
                            <p className="details-description">{product.description}</p>
                            
                            <div className="details-price-stock">
                                <span className="details-price">₹{product.price}</span>
                                <span className={`details-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                                </span>
                            </div>

                            <div className="product-details-actions">
                                {isInCart ? (
                                    <>
                                        <button 
                                            className="btn-go-to-cart"
                                            onClick={() => navigate('/cart')}
                                        >
                                            🛒 Go to Cart &rarr;
                                        </button>
                                        <button 
                                            className="btn-add-to-cart btn-add-another-details" 
                                            disabled={product.stock === 0 || isAddingToCart}
                                            onClick={async () => {
                                                try {
                                                    setIsAddingToCart(true);
                                                    await addToCart(product._id);
                                                } catch (err) {
                                                    alert(err.response?.data?.message || 'Failed to add to cart');
                                                } finally {
                                                    setIsAddingToCart(false);
                                                }
                                            }}
                                        >
                                            {isAddingToCart ? '⏳ Adding...' : '+ Add Another'}
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="btn-add-to-cart" 
                                        disabled={product.stock === 0 || isAddingToCart}
                                        onClick={async () => {
                                            try {
                                                setIsAddingToCart(true);
                                                await addToCart(product._id);
                                            } catch (err) {
                                                alert(err.response?.data?.message || 'Failed to add to cart');
                                            } finally {
                                                setIsAddingToCart(false);
                                            }
                                        }}
                                    >
                                        {isAddingToCart ? '⏳ Adding...' : 'Add to Cart 🛒'}
                                    </button>
                                )}
                                
                                <button 
                                    className={`btn-wishlist-details ${isWishlisted ? 'saved' : ''}`}
                                    onClick={handleWishlistToggle}
                                    disabled={isWishlistLoading}
                                >
                                    {isWishlistLoading 
                                        ? '⏳ Updating...' 
                                        : isWishlisted 
                                            ? '♥ Remove from Wishlist' 
                                            : '♡ Add to Wishlist'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductDetails;
