// src/pages/CategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiTag, FiPackage, FiHome, FiSmile, FiInfo,
    FiArrowRight, FiLock, FiRefreshCw, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { kategoriAPI } from '../services/api';
import './CategoriesPage.css';

const CategoriesPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await kategoriAPI.getAll();
            const categoryData = response.data.data || [];

            // Map icon berdasarkan nama kategori
            const iconMap = {
                'Sweater': FiTag,
                'Topi': FiPackage,
                'Tas': FiHome,
                'Syal': FiSmile,
                'Aksesoris': FiTag,
                'Boneka': FiSmile,
                'Pakaian': FiTag,
                'Dekorasi': FiHome,
                'Mainan': FiSmile
            };

            const mappedCategories = categoryData.map((cat) => ({
                id: cat.id,
                name: cat.nama_kategori,
                deskripsi: cat.deskripsi,
                jumlah_produk: cat.jumlah_produk || 0,
                icon: iconMap[cat.nama_kategori] || FiTag
            }));

            setCategories(mappedCategories);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message || 'Gagal memuat kategori');
        } finally {
            setLoading(false);
        }
    };

    const showNotificationMessage = (message) => {
        setNotificationMessage(message);
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };

    const handleCategoryClick = (categoryName) => {
        if (!isAuthenticated) {
            showNotificationMessage('Silakan login terlebih dahulu untuk melihat produk.');
            return;
        }
        navigate(`/products?category=${encodeURIComponent(categoryName)}`);
    };

    if (loading) {
        return (
            <div className="categories-loading">
                <div className="spinner"></div>
                <p>Memuat kategori...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="categories-error">
                <p>{error}</p>
                <button onClick={fetchCategories} className="btn-retry">
                    <FiRefreshCw /> Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <div className="categories-page">
            <div className="container">

                {showNotification && (
                    <div className="notification-popup">
                        <FiInfo size={20} />
                        <span>{notificationMessage}</span>
                        <button
                            onClick={() => setShowNotification(false)}
                            aria-label="Tutup notifikasi"
                        >
                            <FiX />
                        </button>
                    </div>
                )}

                <div className="categories-header">
                    <h1 className="categories-title">Kategori Produk</h1>
                    <p className="categories-subtitle">
                        Temukan produk rajutan berdasarkan kategori
                    </p>
                    <div className="categories-divider">
                        <span className="divider-line"></span>
                        <span className="divider-dot"></span>
                        <span className="divider-line"></span>
                    </div>
                </div>

                {!isAuthenticated && (
                    <div className="login-warning">
                        <FiInfo size={18} />
                        <span>
                            Silakan <strong>login</strong> terlebih dahulu untuk melihat produk.
                        </span>
                    </div>
                )}

                <div className="categories-grid">
                    {categories.length === 0 ? (
                        <p style={{ textAlign: 'center', width: '100%', color: '#888' }}>
                            Belum ada kategori.
                        </p>
                    ) : (
                        categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <div
                                    key={category.id}
                                    className="category-card"
                                    onClick={() => handleCategoryClick(category.name)}
                                >
                                    <div className="category-icon">
                                        <Icon />
                                    </div>
                                    <h3 className="category-name">{category.name}</h3>
                                    {category.deskripsi && (
                                        <p className="category-desc">{category.deskripsi}</p>
                                    )}
                                    <p className="category-count">
                                        <FiArrowRight /> {category.jumlah_produk} Produk
                                    </p>
                                    {!isAuthenticated && (
                                        <div className="category-lock-badge">
                                            <FiLock /> Login untuk akses
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;