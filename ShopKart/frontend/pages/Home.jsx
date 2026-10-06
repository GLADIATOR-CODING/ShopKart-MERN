import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../Components/Navbar.jsx";
import ProductCard from "../Components/ProductCard.jsx";

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialCustomer = location.state?.customer || null;
    const [customer, setCustomer] = useState(initialCustomer);
    const [loading, setLoading] = useState(!initialCustomer);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [copiedCoupon, setCopiedCoupon] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const customerRes = await api.get("/customers/me");
                setCustomer(customerRes.data?.customer || customerRes.data);
            } catch (err) {
                // If token or initial customer exists, retry once in case cookie is still settling
                if (initialCustomer || localStorage.getItem("shopkart_token")) {
                    try {
                        await new Promise(r => setTimeout(r, 400));
                        const retryRes = await api.get("/customers/me");
                        setCustomer(retryRes.data?.customer || retryRes.data);
                    } catch {
                        localStorage.removeItem("shopkart_token");
                        navigate("/login");
                        return;
                    }
                } else {
                    localStorage.removeItem("shopkart_token");
                    navigate("/login");
                    return;
                }
            } finally {
                setLoading(false);
            }

            try {
                const productsRes = await api.get("/products");
                setAllProducts(productsRes.data.products || []);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
        };

        fetchData();
    }, [navigate]);

    const handleCopyCoupon = () => {
        navigator.clipboard.writeText("SHOPKART20");
        setCopiedCoupon(true);
        setTimeout(() => setCopiedCoupon(false), 2000);
    };

    const formatDisplayName = (fullName) => {
        if (!fullName) return "Creator";
        return fullName
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p style={{ fontWeight: 800, fontSize: "1.1rem" }}>Loading ShopKart Storefront...</p>
            </div>
        );
    }

    if (!customer) {
        return null;
    }

    // Filter products based on selected category pill
    const filteredProducts = selectedCategory === "All"
        ? allProducts.slice(0, 6)
        : allProducts.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()).slice(0, 6);

    // Spotlight featured item (pick mechanical keyboard or first item)
    const spotlightItem = allProducts.find((p) => p.name?.toLowerCase().includes("keyboard")) || allProducts[0] || {
        _id: "spotlight",
        name: "Retro Mechanical Keyboard",
        category: "Electronics",
        price: 3499,
        image: "/product-images/keyboard.svg",
        stock: 5
    };

    const categories = ["All", "Electronics", "Fashion", "Home", "Books"];

    return (
        <div className="page-container">
            <Navbar customer={customer} />

            <main className="home-container">
                {/* Main Neo-Brutalist Hero Card */}
                <div className="hero-neo-card">
                    <div className="hero-left-content">
                        <div className="hero-top-badges">
                            <div className="hero-neo-tag">
                                <span>👋 Hey, {formatDisplayName(customer.fullName)}</span>
                                <span className="hero-tag-dot">•</span>
                                <span className="hero-vip-badge">⚡ VIP MEMBER</span>
                            </div>

                            <div 
                                className={`hero-coupon-chip ${copiedCoupon ? 'copied' : ''}`}
                                onClick={handleCopyCoupon}
                                title="Click to copy coupon code"
                                role="button"
                                tabIndex={0}
                            >
                                <span>🏷️ {copiedCoupon ? "COPIED 'SHOPKART20'!" : "USE 'SHOPKART20' (20% OFF)"}</span>
                            </div>
                        </div>

                        <h1 className="hero-neo-title">
                            BUILT DIFFERENT.<br />
                            <span className="hero-title-highlight">CREATOR GEAR</span>
                        </h1>

                        <p className="hero-neo-subtitle">
                            Tactile mechanical boards, studio-grade peripherals, and neo-brutalist workspace essentials crafted without compromise.
                        </p>

                        <div className="hero-cta-group">
                            <button 
                                className="btn-hero-primary"
                                onClick={() => navigate('/products')}
                            >
                                <span>Shop All Drops</span>
                                <span>🛍️</span>
                            </button>

                            <button 
                                className="btn-hero-secondary"
                                onClick={() => navigate('/wishlist')}
                            >
                                <span>My Wishlist</span>
                                <span>♥</span>
                            </button>
                        </div>

                        <div className="hero-trust-bullets">
                            <span className="hero-bullet-item">★ 4.9/5 Rating (2.4k+ Reviews)</span>
                            <span>•</span>
                            <span className="hero-bullet-item">⚡ 10K+ Shipped</span>
                            <span>•</span>
                            <span className="hero-bullet-item">🚚 24h Express Dispatch</span>
                        </div>
                    </div>

                    {/* Spotlight Product Card */}
                    <div className="hero-spotlight-box">
                        <div className="spotlight-badge">🔥 Featured Deal</div>
                        <div className="spotlight-image-wrap">
                            <img src={spotlightItem.image} alt={spotlightItem.name} />
                        </div>
                        <span className="spotlight-category">{spotlightItem.category}</span>
                        <h3 className="spotlight-title">{spotlightItem.name}</h3>
                        <div className="spotlight-price-row">
                            <div>
                                <span className="spotlight-price">₹{spotlightItem.price}</span>
                                <span className="spotlight-original-price">₹{Math.round(spotlightItem.price * 1.3)}</span>
                            </div>
                            <span className="spotlight-stock-tag">⚡ Only {spotlightItem.stock || 4} left</span>
                        </div>
                        <button 
                            className="btn-spotlight"
                            onClick={() => navigate(`/products/${spotlightItem._id}`)}
                        >
                            Claim This Drop &rarr;
                        </button>
                    </div>
                </div>

                {/* 3. Fast Category Filter Strip */}
                <div className="home-categories-section">
                    <span className="categories-section-label">Browse by Category</span>
                    <div className="home-categories-strip">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`home-category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat === "All" && "🔥"}
                                {cat === "Electronics" && "⌨️"}
                                {cat === "Fashion" && "👕"}
                                {cat === "Home" && "🏠"}
                                {cat === "Books" && "📚"}
                                <span>{cat === "All" ? "All Drops" : cat}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Trending Products Grid */}
                <section className="trending-section">
                    <div className="trending-header-row">
                        <div className="trending-heading-box">
                            <h2>🔥 Trending Drops Right Now</h2>
                            <p className="trending-subtext">
                                {selectedCategory === "All" 
                                    ? "The most wanted creator items this week, freshly restocked."
                                    : `Top trending picks in ${selectedCategory}.`
                                }
                            </p>
                        </div>
                        <button 
                            className="btn-view-all-products"
                            onClick={() => navigate('/products')}
                        >
                            <span>View Full Catalog ({allProducts.length})</span>
                            <span>&rarr;</span>
                        </button>
                    </div>

                    <div className="products-grid">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </section>

                {/* 5. Flash Sale Event Callout */}
                <div className="flash-sale-banner">
                    <div className="flash-sale-content">
                        <h3>⚡ Flash Sale Active • 20% Off Everything</h3>
                        <p>Apply code <strong>SHOPKART20</strong> at checkout. Free shipping on all orders over ₹999.</p>
                    </div>
                    <button 
                        className="btn-claim-sale"
                        onClick={() => {
                            handleCopyCoupon();
                            navigate('/products');
                        }}
                    >
                        {copiedCoupon ? "Code Copied! Shop Now 🚀" : "Claim 20% Discount 🚀"}
                    </button>
                </div>

                {/* 6. Why ShopKart? Store Trust Grid */}
                <section className="trust-perks-section">
                    <h3 className="trust-perks-title">Why Creators Choose ShopKart</h3>
                    <div className="trust-perks-grid">
                        <div className="trust-perk-card">
                            <span className="trust-perk-icon">⚡</span>
                            <h4 className="trust-perk-heading">Same-Day Dispatch</h4>
                            <p className="trust-perk-desc">Orders placed before 2 PM ship the very same day with real-time tracking.</p>
                        </div>

                        <div className="trust-perk-card">
                            <span className="trust-perk-icon">🛡️</span>
                            <h4 className="trust-perk-heading">2-Year Warranty</h4>
                            <p className="trust-perk-desc">Full comprehensive replacement coverage on all mechanical and audio tech.</p>
                        </div>

                        <div className="trust-perk-card">
                            <span className="trust-perk-icon">↩️</span>
                            <h4 className="trust-perk-heading">30-Day Easy Returns</h4>
                            <p className="trust-perk-desc">Not feeling the vibe? Return it hassle-free with instant pickup at your door.</p>
                        </div>

                        <div className="trust-perk-card">
                            <span className="trust-perk-icon">🔒</span>
                            <h4 className="trust-perk-heading">Secure Checkout</h4>
                            <p className="trust-perk-desc">256-bit SSL encrypted payments supporting UPI, Cards, and Net Banking.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
