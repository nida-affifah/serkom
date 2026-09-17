// src/pages/UlasanSaya.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiStar, FiRefreshCw, FiLock, FiMessageCircle
} from 'react-icons/fi';
import { ulasanAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './UlasanSaya.css';

const UlasanSaya = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [ulasan, setUlasan] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) fetchData();
        else setLoading(false);
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await ulasanAPI.getSaya();
            setUlasan(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat ulasan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatTanggal = (tgl) => {
        if (!tgl) return '-';
        return new Date(tgl).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar
                key={i}
                className={i < rating ? 'star active' : 'star'}
            />
        ));
    };

    if (!isAuthenticated) {
        return (
            <div className="ulasan-page">
                <div className="ulasan-container">
                    <div className="ulasan-access-denied">
                        <FiLock size={64} />
                        <h2>Silakan Login</h2>
                        <p>Anda harus login untuk melihat ulasan.</p>
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Login Sekarang
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="ulasan-page">
                <div className="ulasan-container">
                    <div className="ulasan-loading">Memuat ulasan...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="ulasan-page">
            <div className="ulasan-container">
                {/* HEADER */}
                <div className="ulasan-header">
                    <div className="ulasan-badge">Ulasan Saya</div>
                    <div className="ulasan-header-row">
                        <div>
                            <h1 className="ulasan-title">Ulasan Produk</h1>
                            <p className="ulasan-subtitle">
                                Daftar ulasan yang sudah Anda berikan untuk produk
                            </p>
                        </div>
                        <button className="btn-refresh" onClick={fetchData}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* LIST ULASAN */}
                {ulasan.length === 0 ? (
                    <div className="ulasan-empty">
                        <FiMessageCircle size={64} style={{ color: '#ccc' }} />
                        <h2>Belum ada ulasan</h2>
                        <p>Ulasan yang Anda berikan akan muncul di sini.</p>
                        <button className="btn-primary" onClick={() => navigate('/purchase-history')}>
                            Lihat Riwayat Pesanan
                        </button>
                    </div>
                ) : (
                    <div className="ulasan-list">
                        {ulasan.map(u => (
                            <div key={u.id} className="ulasan-card">
                                <div className="ulasan-card-header">
                                    <div className="ulasan-produk">
                                        <h3>{u.nama_produk}</h3>
                                        <span className="ulasan-kode">{u.kode_produk}</span>
                                    </div>
                                    <span className="ulasan-tanggal">{formatTanggal(u.tanggal)}</span>
                                </div>

                                <div className="ulasan-rating">
                                    {renderStars(u.rating)}
                                    <span className="rating-value">{u.rating}/5</span>
                                </div>

                                {u.komentar && (
                                    <p className="ulasan-komentar">"{u.komentar}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UlasanSaya;