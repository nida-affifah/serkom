// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiLogIn, FiAlertCircle, FiLoader, FiLock, FiUser
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(username, password);

            if (!result.success) {
                setError(result.message || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-icon">
                            <FiLock />
                        </div>
                        <h1 className="auth-title">Login</h1>
                        <p className="auth-subtitle">Masuk ke akun Anda</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Masukkan username Anda"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password Anda"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="spin-icon" /> Loading...
                                </>
                            ) : (
                                <>
                                    <FiLogIn /> Login
                                </>
                            )}
                        </button>
                    </form>

                    <p className="auth-link">
                        Belum punya akun? <Link to="/register">Daftar di sini</Link>
                    </p>

                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        background: '#f0f9ff',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0369a1'
                    }}>
                        <strong>Info Login:</strong>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                            <li>Admin: <code>admin</code> / <code>admin123</code></li>
                            <li>Pembeli: <code>bagas</code> / <code>pembeli123</code></li>
                            <li>Perajin: <code>perajin1</code> / <code>perajin123</code></li>
                            <li>Kasir: <code>kasir1</code> / <code>kasir123</code></li>
                            <li>Staff Gudang: <code>staff1</code> / <code>staffgudang123</code></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;