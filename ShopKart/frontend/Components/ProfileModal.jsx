import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const ProfileModal = ({ isOpen, onClose, customer, onLogout }) => {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!oldPassword || !newPassword) {
            setError('Please enter both current and new password');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const res = await api.patch('/customers/change-password', {
                oldPassword,
                newPassword
            });
            setMessage(res.data?.message || 'Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutClick = async () => {
        if (onLogout) {
            onLogout();
            return;
        }
        try {
            setIsLoggingOut(true);
            await api.post('/customers/logout');
        } catch {
        } finally {
            setIsLoggingOut(false);
            onClose();
            navigate('/login');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="brand-badge">
                        <span>👤 Account Details</span>
                    </div>
                    <button className="btn-close-modal" onClick={onClose} aria-label="Close modal">✕</button>
                </div>

                <div className="profile-details-box">
                    <div className="profile-row">
                        <span className="profile-row-label">Full Name</span>
                        <span className="profile-row-value">{customer?.fullName || '—'}</span>
                    </div>
                    <div className="profile-row">
                        <span className="profile-row-label">Email Address</span>
                        <span className="profile-row-value">{customer?.email || '—'}</span>
                    </div>
                    <div className="profile-row">
                        <span className="profile-row-label">Phone</span>
                        <span className="profile-row-value">{customer?.phone || '—'}</span>
                    </div>
                </div>

                <div className="modal-divider">
                    <span>🔐 Change Password</span>
                </div>

                {message && <div className="alert alert-success"><span>✅ {message}</span></div>}
                {error && <div className="alert alert-error"><span>❌ {error}</span></div>}

                <form onSubmit={handlePasswordChange} className="change-password-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="oldPassword">Current Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="oldPassword"
                                type={showOldPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter current password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                aria-label="Toggle password"
                            >
                                {showOldPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="newPassword">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="Enter new password (min 6 chars)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                aria-label="Toggle password"
                            >
                                {showNewPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                </form>

                {/* Logout Button Down Below Change Password */}
                <div className="modal-footer-actions">
                    <button 
                        type="button" 
                        className="btn-modal-logout" 
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        title="Sign out of your account"
                    >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        <span>{isLoggingOut ? 'Signing out...' : 'Log Out of Account'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
