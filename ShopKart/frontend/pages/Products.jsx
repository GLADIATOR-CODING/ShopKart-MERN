import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import Navbar from '../Components/Navbar.jsx';
import ProductCard from '../Components/ProductCard.jsx';
import SearchBar from '../Components/SearchBar.jsx';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async (search = '', category = '') => {
        try {
            setLoading(true);
            setError(null);
            
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            
            // Fetch products, user wishlist, and customer data in parallel
            const [productsRes, wishlistRes, customerRes] = await Promise.allSettled([
                api.get(`/products?${params.toString()}`),
                api.get('/wishlist'),
                api.get('/customers/me')
            ]);

            if (productsRes.status === 'fulfilled') {
                setProducts(productsRes.value.data?.products || []);
            } else {
                throw new Error('Failed to load products');
            }

            if (wishlistRes.status === 'fulfilled') {
                const savedIds = new Set((wishlistRes.value.data?.wishlist || []).map(p => p._id));
                setWishlistIds(savedIds);
            }

            if (customerRes.status === 'fulfilled') {
                setCustomer(customerRes.value.data?.customer || customerRes.value.data);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Something went wrong while loading products.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = useCallback((searchTerm, category) => {
        fetchProducts(searchTerm, category);
    }, [fetchProducts]);

    const handleCardToggle = (productId, isSaved) => {
        setWishlistIds((prev) => {
            const next = new Set(prev);
            if (isSaved) {
                next.add(productId);
            } else {
                next.delete(productId);
            }
            return next;
        });
    };

    return (
        <div className="page-container">
            <Navbar customer={customer} />
            <main className="main-content">
                <div className="products-header">
                    <h2>Discover Products</h2>
                    <SearchBar onSearch={handleSearch} />
                </div>
                
                {loading && (
                    <div className="state-container loading-state">
                        <div className="spinner"></div>
                        <p>Loading products...</p>
                    </div>
                )}
                
                {error && (
                    <div className="state-container error-state">
                        <p>Something went wrong while loading products.</p>
                        <button onClick={() => fetchProducts()}>Try Again</button>
                    </div>
                )}
                
                {!loading && !error && products.length === 0 && (
                    <div className="state-container empty-state">
                        <div className="empty-icon">📦</div>
                        <p>No products found.</p>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard 
                                key={product._id} 
                                product={product} 
                                isWishlistedInitial={wishlistIds.has(product._id)}
                                onToggle={handleCardToggle}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Products;
