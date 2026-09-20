// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiTag, FiCheckCircle, FiXCircle,
    FiPackage, FiMinus, FiPlus, FiInfo, FiShoppingCart,
    FiZap, FiLock, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { produkAPI } from '../services/api';
import './ProductDetail.css';

import kausKakiRajut from '../assets/products/kausKakiRajut.png';
import mainanRajut from '../assets/products/mainanRajut.png';
import selendangRajut from '../assets/products/selendangRajut.png';
import tasRajut from '../assets/products/tasRajut.png';
import topiRajut from '../assets/products/topiRajut.png';
import bajuRajutWanita from '../assets/products/BajuRajutWanita.jpeg';
import sarungBantalRajut from '../assets/products/SarungBantalRajut.jpeg';
import sweaterRajutCowo from '../assets/products/SweaterRajutCowo.jpeg';
import sweaterCozy from '../assets/products/SweaterCozy.jpeg';
import sweaterHangat from '../assets/products/SweaterHangat.jpeg';
import syalRajut from '../assets/products/SyalRajut.jpeg';
import toteBag from '../assets/products/ToteBag.jpeg';
import bajuPendek from '../assets/products/BajuPendek.jpeg';
import bonekaRajut from '../assets/products/BonekaRajut.jpeg';

const productImages = {
    'Boneka Rajut': bonekaRajut,
    'boneka rajut': bonekaRajut,
    'BonekaRajut': bonekaRajut,
    'boneka': bonekaRajut,

    'Sweater Rajut Cozy': sweaterCozy,
    'sweater rajut cozy': sweaterCozy,
    'SweaterCozy': sweaterCozy,
    'sweaterCozy': sweaterCozy,
    'Sweater Cozy': sweaterCozy,
    'sweater cozy': sweaterCozy,

    'Sweater Bulu Hangat': sweaterHangat,
    'sweater bulu hangat': sweaterHangat,
    'SweaterHangat': sweaterHangat,
    'sweaterHangat': sweaterHangat,
    'Sweater Hangat': sweaterHangat,
    'sweater hangat': sweaterHangat,
    'sweater bulu': sweaterHangat,

    'Sweater Rajut Pria': sweaterRajutCowo,
    'sweater rajut pria': sweaterRajutCowo,
    'SweaterRajutCowo': sweaterRajutCowo,
    'sweater rajut cowo': sweaterRajutCowo,

    'Baju Rajut Wanita': bajuRajutWanita,
    'baju rajut wanita': bajuRajutWanita,
    'BajuRajutWanita': bajuRajutWanita,
    'baju rajut': bajuRajutWanita,

    'Baju Pendek': bajuPendek,
    'baju pendek': bajuPendek,
    'BajuPendek': bajuPendek,

    'Syal Rajut Pastel': syalRajut,
    'syal rajut pastel': syalRajut,
    'Syal Rajut': syalRajut,
    'syal rajut': syalRajut,
    'SyalRajut': syalRajut,
    'Syal': syalRajut,
    'syal': syalRajut,

    'Topi Rajut Aesthetic': topiRajut,
    'topi rajut aesthetic': topiRajut,
    'Topi Rajut': topiRajut,
    'topi rajut': topiRajut,
    'topiRajut': topiRajut,

    'Sarung Bantal Rajut': sarungBantalRajut,
    'sarung bantal rajut': sarungBantalRajut,
    'SarungBantalRajut': sarungBantalRajut,

    'Tote Bag Rajut': toteBag,
    'tote bag rajut': toteBag,
    'Totebag Rajut': toteBag,
    'totebag rajut': toteBag,
    'ToteBag': toteBag,
    'tote bag': toteBag,
    'Tote Bag': toteBag,

    'Kaus Kaki Rajut': kausKakiRajut,
    'kaus kaki rajut': kausKakiRajut,
    'kausKakiRajut': kausKakiRajut,

    'Mainan Rajut': mainanRajut,
    'mainan rajut': mainanRajut,
    'mainanRajut': mainanRajut,

    'Selendang Rajut': selendangRajut,
    'selendang rajut': selendangRajut,
    'selendangRajut': selendangRajut,

    'Tas Rajut': tasRajut,
    'tas rajut': tasRajut,
    'tasRajut': tasRajut,
};

const getProductImage = (productName) => {
    if (!productName) return null;
    if (productImages[productName]) return productImages[productName];

    const lowerName = productName.toLowerCase();
    for (const [key, image] of Object.entries(productImages)) {
        if (key.toLowerCase() === lowerName) return image;
    }
    for (const [key, image] of Object.entries(productImages)) {
        const lowerKey = key.toLowerCase();
        if (lowerName.includes(lowerKey) || lowerKey.includes(lowerName)) return image;
    }
    const cleanName = lowerName.replace(/\s/g, '');
    for (const [key, image] of Object.entries(productImages)) {
        const cleanKey = key.toLowerCase().replace(/\s/g, '');
        if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) return image;
    }
    return null;
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { tambahKeKeranjang, loading: cartLoading } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await produkAPI.getById(id);
            setProduct(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Gagal memuat produk');
        } finally {
            setLoading(false);
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

    const increaseQuantity = () => {
        if (product && quantity < product.stok) setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            if (window.confirm('Anda harus login terlebih dahulu. Login sekarang?')) {
                navigate('/login');
            }
            return;
        }

        if (!product) return;
        if (quantity > product.stok) {
            alert(`Stok tidak mencukupi! Tersisa: ${product.stok}`);
            return;
        }

        setAdding(true);
        const hasil = await tambahKeKeranjang(product.id, quantity);
        setAdding(false);

        if (hasil.success) {
            alert(hasil.message || 'Produk ditambahkan ke keranjang');
            setQuantity(1);
        } else {
            alert('Gagal: ' + hasil.message);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            if (window.confirm('Anda harus login terlebih dahulu. Login sekarang?')) {
                navigate('/login');
            }
            return;
        }

        if (!product) return;
        if (quantity > product.stok) {
            alert(`Stok tidak mencukupi! Tersisa: ${product.stok}`);
            return;
        }

        setAdding(true);
        const hasil = await tambahKeKeranjang(product.id, quantity);
        setAdding(false);

        if (hasil.success) {
            navigate('/keranjang');
        } else {
            alert('Gagal: ' + hasil.message);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-loading">
                <div className="spinner"></div>
                <p>Memuat produk...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-error">
                <p>{error || 'Produk tidak ditemukan'}</p>
                <button onClick={() => navigate('/products')} className="btn-back">
                    <FiArrowLeft /> Kembali ke Produk
                </button>
            </div>
        );
    }

    const productImage = getProductImage(product.nama_produk);

    return (
        <div className="product-detail-page">
            <div className="container">
                <button
                    className="btn-back-products"
                    onClick={() => navigate('/products')}
                >
                    <FiArrowLeft /> Kembali ke Produk
                </button>

                {!isAuthenticated && (
                    <div className="login-warning">
                        <FiAlertCircle />
                        <span>
                            Silakan <strong>login</strong> terlebih dahulu untuk membeli produk.
                        </span>
                    </div>
                )}

                <div className="product-detail-grid">
                    <div className="product-detail-image">
                        {productImage ? (
                            <img
                                src={productImage}
                                alt={product.nama_produk}
                                className="product-detail-img"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                                    if (placeholder) placeholder.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="image-placeholder"
                            style={{ display: productImage ? 'none' : 'flex' }}
                        >
                            <span>{product.nama_produk ? product.nama_produk.charAt(0) : '?'}</span>
                        </div>
                        {product.stok <= 0 && (
                            <span className="out-of-stock-badge">
                                <FiXCircle /> Habis
                            </span>
                        )}
                    </div>

                    <div className="product-detail-info">
                        <span className="product-category">
                            <FiTag /> {product.nama_kategori || 'Umum'}
                        </span>
                        <h1 className="product-name">{product.nama_produk}</h1>
                        <div className="product-price">{formatPrice(product.harga_jual)}</div>

                        <div className="product-stock-info">
                            <span className={`stock-status ${product.stok > 0 ? 'in-stock' : 'out-stock'}`}>
                                {product.stok > 0 ? (
                                    <><FiCheckCircle /> Tersedia</>
                                ) : (
                                    <><FiXCircle /> Habis</>
                                )}
                            </span>
                            <span className="stock-count">
                                <FiPackage /> Stok: {product.stok} unit
                            </span>
                        </div>

                        <p className="product-description">{product.deskripsi}</p>

                        <div className="quantity-section">
                            <label>
                                <FiPackage /> Jumlah:
                            </label>
                            <div className="quantity-controls">
                                <button
                                    className="qty-btn"
                                    onClick={decreaseQuantity}
                                    disabled={quantity <= 1}
                                >
                                    <FiMinus />
                                </button>
                                <span className="qty-value">{quantity}</span>
                                <button
                                    className="qty-btn"
                                    onClick={increaseQuantity}
                                    disabled={quantity >= product.stok || product.stok <= 0}
                                >
                                    <FiPlus />
                                </button>
                            </div>
                            <span className="max-stock">
                                <FiInfo /> Maks: {product.stok}
                            </span>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn-add-cart"
                                onClick={handleAddToCart}
                                disabled={product.stok <= 0 || !isAuthenticated || adding}
                                title={!isAuthenticated ? 'Login untuk membeli' : ''}
                            >
                                <FiShoppingCart /> {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                            </button>
                            <button
                                className="btn-buy-now"
                                onClick={handleBuyNow}
                                disabled={product.stok <= 0 || !isAuthenticated || adding}
                                title={!isAuthenticated ? 'Login untuk membeli' : ''}
                            >
                                <FiZap /> Beli Sekarang
                            </button>
                        </div>

                        {!isAuthenticated && (
                            <div className="login-hint-box">
                                <FiLock /> Silakan{' '}
                                <span
                                    className="login-link"
                                    onClick={() => navigate('/login')}
                                >
                                    login
                                </span>{' '}
                                untuk membeli produk
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;