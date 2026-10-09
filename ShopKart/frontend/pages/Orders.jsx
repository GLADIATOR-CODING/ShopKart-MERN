import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Navbar from "../Components/Navbar.jsx";

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        const loadCustomerAndOrders = async () => {
            try {
                const customerRes = await api.get('/customers/me');
                setCustomer(customerRes.data?.customer || customerRes.data);
                
                const ordersRes = await api.get("/orders");
                setOrders(ordersRes.data.orders);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError("Failed to load your orders.");
                }
            } finally {
                setLoading(false);
            }
        };
        loadCustomerAndOrders();
    }, [navigate]);

    return (
        <div className="page-container">
            <Navbar customer={customer} />
            <main className="main-content">
                <div className="cart-header">
                    <h2 className="cart-title">My Orders</h2>
                </div>

                {loading ? (
                    <div className="state-container loading-state">
                        <div className="spinner"></div>
                        <p>Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="state-container error-state">
                        <div className="error-icon">❌</div>
                        <h2>Error</h2>
                        <p>{error}</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="state-container empty-state">
                        <div className="empty-icon">📦</div>
                        <h2>No orders found</h2>
                        <p>You haven't placed any orders yet.</p>
                        <button className="btn-primary" style={{ maxWidth: '260px' }} onClick={() => navigate('/products')}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {orders.map(order => (
                            <div key={order._id} style={{ background: 'var(--white)', border: '4px solid var(--black)', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.25rem' }}>Order #{order._id}</p>
                                    <p style={{ color: '#4b5563', fontWeight: 600, marginBottom: '0.5rem' }}>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <span style={{ background: order.status === 'PLACED' ? 'var(--green)' : 'var(--yellow)', color: 'var(--black)', padding: '0.2rem 0.8rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem', border: '2px solid var(--black)' }}>
                                            {order.status}
                                        </span>
                                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                                <div>
                                    <Link to={`/orders/${order._id}`} className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Orders;
