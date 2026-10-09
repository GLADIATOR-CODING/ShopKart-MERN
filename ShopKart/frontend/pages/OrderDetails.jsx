import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../Components/Navbar.jsx";

const OrderDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const isNewOrder = location.state?.isNewOrder;
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const customerRes = await api.get('/customers/me');
                setCustomer(customerRes.data?.customer || customerRes.data);
                
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.order);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError("Failed to load order details.");
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate]);

    return (
        <div className="page-container">
            <Navbar customer={customer} />
            <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {loading ? (
                    <div className="state-container loading-state">
                        <div className="spinner"></div>
                        <p>Loading order details...</p>
                    </div>
                ) : error ? (
                    <div className="state-container error-state">
                        <div className="error-icon">❌</div>
                        <h2>Error</h2>
                        <p>{error}</p>
                        <button className="btn-primary" style={{ maxWidth: '240px' }} onClick={() => navigate('/orders')}>Back to Orders</button>
                    </div>
                ) : !order ? (
                    <div className="state-container error-state">
                        <div className="error-icon">❓</div>
                        <h2>Not Found</h2>
                        <p>Order not found.</p>
                        <button className="btn-primary" style={{ maxWidth: '240px' }} onClick={() => navigate('/orders')}>Back to Orders</button>
                    </div>
                ) : (
                    <>
                        {isNewOrder && (
                            <div style={{ background: 'var(--green)', border: '4px solid var(--black)', borderRadius: 'var(--radius)', padding: '2rem', marginBottom: '2rem', textAlign: 'center', boxShadow: 'var(--shadow-main)' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
                                <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem' }}>Your order has been saved successfully and is being processed.</p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Link to="/orders" className="btn-primary" style={{ background: 'var(--white)', textDecoration: 'none', display: 'inline-block', width: 'auto' }}>View My Orders</Link>
                                    <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', width: 'auto' }}>Continue Shopping</Link>
                                </div>
                            </div>
                        )}

                        <div className="cart-header">
                            <h2 className="cart-title">Order Details</h2>
                            {!isNewOrder && <button className="btn-back" onClick={() => navigate('/orders')}>&larr; Back</button>}
                        </div>

                        <div style={{ background: 'var(--white)', border: '4px solid var(--black)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-main)', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '3px solid var(--black)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', background: 'var(--gray-light)' }}>
                                <div>
                                    <p className="form-label">Order ID</p>
                                    <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{order._id}</p>
                                </div>
                                <div>
                                    <p className="form-label">Date Placed</p>
                                    <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="form-label">Status</p>
                                    <span style={{ background: order.status === 'PLACED' ? 'var(--green)' : 'var(--yellow)', color: 'var(--black)', padding: '0.2rem 0.8rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.9rem', border: '2px solid var(--black)' }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Items Summary</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '2px dashed #d1d5db', paddingBottom: '1rem' }}>
                                            {item.image && <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--black)' }} />}
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.name}</p>
                                                <p style={{ fontWeight: 600, color: '#4b5563' }}>Qty: {item.quantity}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                                <p style={{ fontWeight: 600, color: '#4b5563', fontSize: '0.9rem' }}>₹{item.price.toLocaleString('en-IN')} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', borderTop: '3px solid var(--black)', paddingTop: '2rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>Shipping Address</h3>
                                        <div style={{ fontWeight: 600, lineHeight: 1.6 }}>
                                            <p style={{ fontWeight: 800 }}>{order.shippingAddress.fullName}</p>
                                            <p>{order.shippingAddress.phone}</p>
                                            <p>{order.shippingAddress.addressLine1}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                        </div>
                                    </div>
                                    <div style={{ background: 'var(--yellow)', border: '3px solid var(--black)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', boxShadow: '4px 4px 0px var(--black)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>Total</span>
                                            <span style={{ fontWeight: 800, fontSize: '1.5rem' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
                                            <span>Payment Status</span>
                                            <span>{order.paymentStatus}</span>
                                        </div>
                                        {order.razorpayPaymentId && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>
                                                <span>Txn ID</span>
                                                <span>{order.razorpayPaymentId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default OrderDetails;
