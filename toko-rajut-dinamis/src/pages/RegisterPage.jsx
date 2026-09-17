// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiUserPlus, FiAlertCircle, FiLoader
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        nama_lengkap: '',
        email: '',
        no_hp: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [sukses, setSukses] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSukses('');

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak sama');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter');
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                username: formData.username,
                nama_lengkap: formData.nama_lengkap,
                email: formData.email,
                no_hp: formData.no_hp,
                password: formData.password
            });

            if (result.success) {
                setSukses('Registrasi berhasil! Silakan login.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.message || 'Registrasi gagal');
            }
        } catch (err) {
            setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
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
                            <FiUserPlus />
                        </div>
                        <h1 className="auth-title">Daftar</h1>
                        <p className="auth-subtitle">Buat akun pelanggan baru</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    {sukses && (
                        <div className="auth-error" style={{ background: '#d1fae5', color: '#065f46' }}>
                            <span>{sukses}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="username">Username *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Username untuk login"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nama_lengkap">Nama Lengkap *</label>
                            <input
                                type="text"
                                id="nama_lengkap"
                                name="nama_lengkap"
                                value={formData.nama_lengkap}
                                onChange={handleChange}
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Masukkan email Anda"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="no_hp">No. Telepon</label>
                            <input
                                type="text"
                                id="no_hp"
                                name="no_hp"
                                value={formData.no_hp}
                                onChange={handleChange}
                                placeholder="Masukkan no. telepon"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimal 6 karakter"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Konfirmasi Password *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Konfirmasi password"
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
                                    <FiUserPlus /> Daftar
                                </>
                            )}
                        </button>
                    </form>

                    <p className="auth-link">
                        Sudah punya akun? <Link to="/login">Login di sini</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;