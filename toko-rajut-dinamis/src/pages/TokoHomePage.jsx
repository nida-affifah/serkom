// src/pages/TokoHomePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGift, FiCopy, FiArrowRight } from 'react-icons/fi';
import { produkAPI, voucherAPI } from '../services/api';
import './TokoHomePage.css';

import logoToko from '../assets/images/logoToko.jpeg';
import nida from '../assets/images/nida.jpeg';
import kausKakiRajut from '../assets/products/kausKakiRajut.png';
import mainanRajut from '../assets/products/mainanRajut.png';
import selendangRajut from '../assets/products/selendangRajut.png';
import topiRajut from '../assets/products/topiRajut.png';
import tasRajut from '../assets/products/tasRajut.png';
import bajuRajutWanita from '../assets/products/BajuRajutWanita.jpeg';
import sarungBantalRajut from '../assets/products/SarungBantalRajut.jpeg';
import sweaterRajutCowo from '../assets/products/SweaterRajutCowo.jpeg';
import sweaterCozy from '../assets/products/SweaterCozy.jpeg';
import sweaterHangat from '../assets/products/SweaterHangat.jpeg';
import syalRajut from '../assets/products/SyalRajut.jpeg';
import toteBag from '../assets/products/ToteBag.jpeg';
import bajuPendek from '../assets/products/BajuPendek.jpeg';

const productImages = {
    'Kaus Kaki Rajut': kausKakiRajut,
    'kausKakiRajut': kausKakiRajut,
    'kaus kaki rajut': kausKakiRajut,
    'Mainan Rajut': mainanRajut,
    'mainanRajut': mainanRajut,
    'mainan rajut': mainanRajut,
    'Selendang Rajut': selendangRajut,
    'selendangRajut': selendangRajut,
    'selendang rajut': selendangRajut,
    'Topi Rajut': topiRajut,
    'topiRajut': topiRajut,
    'topi rajut': topiRajut,
    'Tas Rajut': tasRajut,
    'tasRajut': tasRajut,
    'tas rajut': tasRajut,
    'Baju Rajut Wanita': bajuRajutWanita,
    'bajuRajutWanita': bajuRajutWanita,
    'baju rajut wanita': bajuRajutWanita,
    'Sarung Bantal Rajut': sarungBantalRajut,
    'sarungBantalRajut': sarungBantalRajut,
    'sarung bantal rajut': sarungBantalRajut,
    'Sweater Rajut Pria': sweaterRajutCowo,
    'sweaterRajutCowo': sweaterRajutCowo,
    'sweater rajut pria': sweaterRajutCowo,
    'sweater rajut cowo': sweaterRajutCowo,
    'Sweater Cozy': sweaterCozy,
    'sweaterCozy': sweaterCozy,
    'sweater cozy': sweaterCozy,
    'Sweater Rajut Cozy': sweaterCozy,
    'sweater rajut cozy': sweaterCozy,
    'Sweater Hangat': sweaterHangat,
    'sweaterHangat': sweaterHangat,
    'sweater hangat': sweaterHangat,
    'Sweater Bulu Hangat': sweaterHangat,
    'sweater bulu hangat': sweaterHangat,
    'sweater bulu': sweaterHangat,
    'Syal Rajut': syalRajut,
    'syalRajut': syalRajut,
    'syal rajut': syalRajut,
    'Syal Rajut Pastel': syalRajut,
    'syal rajut pastel': syalRajut,
    'Syal': syalRajut,
    'Tote Bag': toteBag,
    'toteBag': toteBag,
    'Tote Bag Rajut': toteBag,
    'tote bag rajut': toteBag,
    'Totebag Rajut': toteBag,
    'totebag rajut': toteBag,
    'BajuPendek': bajuPendek,
    'Baju Pendek': bajuPendek,
    'baju pendek': bajuPendek,
    'Topi Rajut Aesthetic': topiRajut,
    'topi rajut aesthetic': topiRajut,
};

const getProductImage = (productName) => {
    if (!productName) return null;

    const lowerName = productName.toLowerCase();

    // 1. Exact match
    if (productImages[productName]) {
        return productImages[productName];
    }

    // 2. Includes match
    for (const [key, image] of Object.entries(productImages)) {
        const lowerKey = key.toLowerCase();
        if (lowerName.includes(lowerKey) || lowerKey.includes(lowerName)) {
            return image;
        }
    }

    // 3. Clean name match (tanpa spasi)
    const cleanName = lowerName.replace(/\s/g, '');
    for (const [key, image] of Object.entries(productImages)) {
        const cleanKey = key.toLowerCase().replace(/\s/g, '');
        if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
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
            <section className="toko-banner">
                <div className="container">
                    <div className="banner-content">
                        <div className="banner-text">
                            <span className="banner-badge">
                                <img 
                                    src={logoToko} 
                                    alt="Logo RajutIndah" 
                                    className="banner-badge-logo"
                                />
                                RajutIndah
                            </span>
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
                            <img 
                                src={nida} 
                                alt="Nida - RajutIndah" 
                                className="banner-photo"
                            />
                        </div>
                    </div>
                </div>
            </section>

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