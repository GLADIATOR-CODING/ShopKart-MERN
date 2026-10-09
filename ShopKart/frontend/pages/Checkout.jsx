import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../services/api.js";
import Navbar from "../Components/Navbar.jsx";

const Checkout = () => {
    const { cartItems, cartCount, subtotal, clearCart, cartLoading } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (!cartLoading && cartCount === 0) {
            navigate('/cart');
        }
    }, [cartLoading, cartCount, navigate]);

    const [shippingAddress, setShippingAddress] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState(null);

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

    const handleInputChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!shippingAddress.fullName.trim() || !shippingAddress.phone.trim() || !shippingAddress.addressLine1.trim() || !shippingAddress.city.trim() || !shippingAddress.state.trim() || !shippingAddress.pincode.trim()) {
            return "All fields are required.";
        }
        if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
            return "Phone must be a valid 10-digit number.";
        }
        if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
            return "Pincode must be exactly 6 digits.";
        }
        return null;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError(null);

        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/orders/create-payment-order", { shippingAddress });
            const data = res.data;

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setError("Failed to load Razorpay checkout.");
                setLoading(false);
                return;
            }

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "ShopKart",
                description: "ShopKart Order",
                order_id: data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post("/orders/verify-payment", {
                            shopKartOrderId: data.shopKartOrderId,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        
                        if (verifyRes.data.success) {
                            clearCart();
                            navigate(`/orders/${data.shopKartOrderId}`, { state: { isNewOrder: true } });
                        }
                    } catch (verifyErr) {
                        setError("Payment verification failed. Your cart has not been cleared.");
                    }
                },
                prefill: {
                    name: shippingAddress.fullName,
                    contact: shippingAddress.phone
                },
                theme: { color: "#ffe600" } // neo-brutalist yellow
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on("payment.failed", function (response) {
                setError("Payment failed. Your cart has not been cleared. Please try again.");
            });
            paymentObject.open();

        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Navbar customer={customer} />
            <main className="main-content">
                <div className="cart-header">
                    <div>
                        <h2 className="cart-title">Checkout</h2>
                    </div>
                    <button className="btn-back" onClick={() => navigate('/cart')}>&larr; Back to Cart</button>
                </div>

                <div className="cart-layout">
                    {/* Shipping Form */}
                    <div style={{ flex: '1 1 60%', background: 'var(--white)', border: '4px solid var(--black)', borderRadius: 'var(--radius)', padding: '2rem', boxShadow: 'var(--shadow-main)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Shipping Details</h2>
                        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
                        
                        <form onSubmit={handlePlaceOrder}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input type="text" name="phone" value={shippingAddress.phone} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address Line 1</label>
                                <input type="text" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input type="text" name="city" value={shippingAddress.city} onChange={handleInputChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input type="text" name="state" value={shippingAddress.state} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pincode</label>
                                <input type="text" name="pincode" value={shippingAddress.pincode} onChange={handleInputChange} className="form-input" required />
                            </div>
                            
                            <button type="submit" disabled={loading || cartCount === 0} className="btn-primary" style={{ marginTop: '1rem' }}>
                                {loading ? 'Processing...' : 'Place Order & Pay'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary" style={{ flex: '1 1 35%' }}>
                        <h3 className="order-summary-title">Order Summary</h3>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cartItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #d1d5db', paddingBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{item.product?.name} × {item.quantity}</span>
                                    <span style={{ fontWeight: 800 }}>₹{((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="order-summary-row">
                            <span>Items</span>
                            <span>{cartCount}</span>
                        </div>
                        <div className="order-summary-divider"></div>
                        <div className="order-summary-row order-summary-total">
                            <span>Total</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
