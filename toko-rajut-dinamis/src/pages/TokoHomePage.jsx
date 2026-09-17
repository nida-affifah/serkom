// src/pages/TokoHomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGift, FiCopy, FiArrowRight } from 'react-icons/fi';
import { produkAPI, voucherAPI } from '../services/api';
import './TokoHomePage.css';

// IMPORT GAMBAR PRODUK
import kausKakiRajut from '../assets/products/kausKakiRajut.png';
import selendangRajut from '../assets/products/selendangRajut.png';
import topiRajut from '../assets/products/topiRajut.png';
import tasRajut from '../assets/products/tasRajut.png';
import sarungBantalRajut from '../assets/products/SarungBantalRajut.jpeg';

// MAP GAMBAR
const productImages = {
    'Kaus Kaki Rajut': kausKakiRajut,
    'Selendang Rajut': selendangRajut,
    'Topi Rajut': topiRajut,
    'Tas Rajut': tasRajut,
    'Sarung Bantal Rajut': sarungBantalRajut,
    'sarungBantalRajut': sarungBantalRajut,
};

const getProductImage = (productName) => {
    if (!productName) return null;
    const lowerName = productName.toLowerCase();
    for (const [key, image] of Object.entries(productImages)) {
        const lowerKey = key.toLowerCase();
        if (lowerName.includes(lowerKey) || lowerKey.includes(lowerName)) {
            return image;
        }
    }
    return null;
};

const TokoHomePage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchVouchers();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await produkAPI.getAll();
            const dataProduk = response.data.data || [];
            setProducts(dataProduk);
            setFeaturedProducts(dataProduk.slice(0, 4));
        } catch (error) {
            console.error('Gagal memuat produk:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVouchers = async () => {
        try {
            const res = await voucherAPI.getAktif();
            setVouchers(res.data.data || []);
        } catch (err) {
            console.error('Gagal memuat voucher:', err);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatTanggal = (tgl) => {
        if (!tgl) return '-';
        return new Date(tgl).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDiskon = (v) => {
        if (v.diskon_persen > 0) return `Diskon ${v.diskon_persen}%`;
        if (v.diskon_nominal > 0) return `Potongan ${formatPrice(v.diskon_nominal)}`;
        return 'Promo Spesial';
    };

    const handleSalinKode = (kode) => {
        navigator.clipboard.writeText(kode).then(() => {
            alert(`Kode voucher "${kode}" berhasil disalin!`);
        }).catch(() => {
            const input = document.createElement('input');
            input.value = kode;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert(`Kode voucher "${kode}" berhasil disalin!`);
        });
    };

    const handlePakaiVoucher = (kode) => {
        navigator.clipboard.writeText(kode).catch(() => {});
        localStorage.setItem('voucher_kode', kode);
        navigate('/products');
    };

    return (
        <div className="toko-home-page">
            {/* BANNER */}
            <section className="toko-banner">
                <div className="container">
                    <div className="banner-content">
                        <div className="banner-text">
                            <span className="banner-badge">RajutIndah</span>
                            <h1 className="banner-title">
                                Produk Rajutan <br />
                                <span>Berkualitas</span>
                            </h1>
                            <p className="banner-desc">
                                Temukan berbagai produk rajutan tangan berkualitas tinggi 
                                dengan desain yang elegan dan nyaman.
                            </p>
                            <button 
                                className="banner-btn"
                                onClick={() => navigate('/products')}
                            >
                                Belanja Sekarang
                            </button>
                        </div>
                        <div className="banner-image">
                            <div className="banner-placeholder">
                                <i className="fas fa-tshirt"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VOUCHER SECTION */}
            {vouchers.length > 0 && (
                <section className="voucher-section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">
                                <FiGift className="section-icon" /> Voucher <span>Spesial</span>
                            </h2>
                            <p className="section-subtitle">
                                Pakai kode voucher di bawah ini saat checkout untuk dapat diskon!
                            </p>
                        </div>

                        <div className="voucher-grid">
                            {vouchers.slice(0, 3).map(v => (
                                <div key={v.id} className="voucher-card">
                                    <div className="voucher-card-header">
                                        <FiGift className="voucher-icon" />
                                        <span className="voucher-kode">{v.kode}</span>
                                    </div>

                                    <div className="voucher-card-body">
                                        <p className="voucher-diskon">{formatDiskon(v)}</p>

                                        {v.min_belanja > 0 && (
                                            <p className="voucher-syarat">
                                                Min. belanja {formatPrice(v.min_belanja)}
                                            </p>
                                        )}

                                        {v.tanggal_selesai && (
                                            <p className="voucher-berlaku">
                                                Berlaku s/d {formatTanggal(v.tanggal_selesai)}
                                            </p>
                                        )}

                                        {v.kuota !== null && v.kuota !== undefined && v.kuota > 0 && (
                                            <p className="voucher-kuota">
                                                Sisa kuota: {v.kuota}
                                            </p>
                                        )}
                                    </div>

                                    <div className="voucher-card-actions">
                                        <button
                                            type="button"
                                            className="voucher-btn-copy"
                                            onClick={() => handleSalinKode(v.kode)}
                                        >
                                            <FiCopy /> Salin
                                        </button>
                                        <button
                                            type="button"
                                            className="voucher-btn-pakai"
                                            onClick={() => handlePakaiVoucher(v.kode)}
                                        >
                                            Pakai <FiArrowRight />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PRODUK UNGGULAN */}
            <section className="featured-products">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Produk <span>Unggulan</span></h2>
                        <p className="section-subtitle">Koleksi produk rajut terbaik pilihan kami</p>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Memuat produk...</p>
                        </div>
                    ) : (
                        <div className="featured-grid">
                            {featuredProducts.map((product) => {
                                const productImage = getProductImage(product.nama_produk);
                                return (
                                    <div 
                                        key={product.id} 
                                        className="featured-card"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <div className="featured-image">
                                            {productImage ? (
                                                <img 
                                                    src={productImage} 
                                                    alt={product.nama_produk}
                                                    className="featured-img"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const placeholder = e.target.parentElement.querySelector('.featured-placeholder');
                                                        if (placeholder) placeholder.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <span 
                                                className="featured-placeholder" 
                                                style={{ display: productImage ? 'none' : 'flex' }}
                                            >
                                                {product.nama_produk.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="featured-info">
                                            <h3 className="featured-name">{product.nama_produk}</h3>
                                            <p className="featured-price">{formatPrice(product.harga_jual)}</p>
                                            <button className="featured-btn">Lihat Detail</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="view-all">
                        <button 
                            className="view-all-btn"
                            onClick={() => navigate('/products')}
                        >
                            Lihat Semua Produk →
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TokoHomePage;