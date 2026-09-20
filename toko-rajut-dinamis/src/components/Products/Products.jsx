// src/components/Products/Products.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { produkAPI } from '../../services/api';
import './Products.css';

import kausKakiRajut from '../../assets/products/kausKakiRajut.png';
import mainanRajut from '../../assets/products/mainanRajut.png';
import selendangRajut from '../../assets/products/selendangRajut.png';
import tasRajut from '../../assets/products/tasRajut.png';
import topiRajut from '../../assets/products/topiRajut.png';
import bajuRajutWanita from '../../assets/products/BajuRajutWanita.jpeg';
import sarungBantalRajut from '../../assets/products/SarungBantalRajut.jpeg';
import sweaterRajutCowo from '../../assets/products/SweaterRajutCowo.jpeg';
import sweaterCozy from '../../assets/products/SweaterCozy.jpeg';
import sweaterHangat from '../../assets/products/SweaterHangat.jpeg';
import syalRajut from '../../assets/products/SyalRajut.jpeg';
import toteBag from '../../assets/products/ToteBag.jpeg';
import bajuPendek from '../../assets/products/BajuPendek.jpeg';

const productImages = {
    'kausKakiRajut': kausKakiRajut,
    'mainanRajut': mainanRajut,
    'selendangRajut': selendangRajut,
    'tasRajut': tasRajut,
    'topiRajut': topiRajut,
    'BajuRajutWanita': bajuRajutWanita,
    'SarungBantalRajut': sarungBantalRajut,
    'SweaterRajutCowo': sweaterRajutCowo,
    'baju rajut wanita': bajuRajutWanita,
    'sarung bantal rajut': sarungBantalRajut,
    'sweater rajut pria': sweaterRajutCowo,
    'sweater rajut cowo': sweaterRajutCowo,
    'SweaterCozy': sweaterCozy,
    'sweater cozy': sweaterCozy,
    'SweaterHangat': sweaterHangat,
    'sweater hangat': sweaterHangat,
    'SyalRajut': syalRajut,
    'syal rajut': syalRajut,
    'Syal': syalRajut,
    'ToteBag': toteBag,
    'tote bag': toteBag,
    'Tote Bag': toteBag,
    'BajuPendek': bajuPendek,
    'Baju Pendek': bajuPendek,
    'baju pendek': bajuPendek,
    'Sweater Bulu Hangat': sweaterHangat,
    'sweater bulu hangat': sweaterHangat,
    'sweater bulu': sweaterHangat,
};

const getProductImage = (productName) => {
    if (!productName) return null;

    const lowerName = productName.toLowerCase();

    if (productImages[productName]) {
        return productImages[productName];
    }

    for (const [key, image] of Object.entries(productImages)) {
        const lowerKey = key.toLowerCase();
        if (lowerName.includes(lowerKey) || lowerKey.includes(lowerName)) {
            return image;
        }
    }

    const cleanName = lowerName.replace(/\s/g, '');
    for (const [key, image] of Object.entries(productImages)) {
        const cleanKey = key.toLowerCase().replace(/\s/g, '');
        if (cleanName.includes(cleanKey) || cleanKey.includes(cleanName)) {
            return image;
        }
    }

    return null;
};

const Products = ({ onAddToCart, onBuyNow }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');

    useEffect(() => {
        if (searchParam) {
            fetchProductsBySearch(searchParam);
        } else if (categoryParam) {
            fetchProductsByCategory(categoryParam);
        } else {
            fetchProducts();
        }
    }, [location.search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await produkAPI.getAll();
            setProducts(response.data.data || []);
        } catch (err) {
            console.error('Error fetching all products:', err);
            setError(err.message || 'Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsByCategory = async (category) => {
        try {
            setLoading(true);
            setError(null);

            const allRes = await produkAPI.getAll();
            const allProducts = allRes.data.data || [];
            const catLower = category.toLowerCase().trim();

            const filtered = allProducts.filter(p => {
                if (!p.nama_kategori) return false;
                const pCat = p.nama_kategori.toLowerCase().trim();
                return pCat === catLower ||
                       pCat.includes(catLower) ||
                       catLower.includes(pCat);
            });

            setProducts(filtered);
        } catch (err) {
            console.error('Error fetching by category:', err);
            setError(err.message || 'Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsBySearch = async (query) => {
        try {
            setLoading(true);
            setError(null);

            const allRes = await produkAPI.getAll();
            const allProducts = allRes.data.data || [];
            const queryLower = query.toLowerCase().trim();

            const filtered = allProducts.filter(p => {
                const nameMatch = p.nama_produk && p.nama_produk.toLowerCase().includes(queryLower);
                const descMatch = p.deskripsi && p.deskripsi.toLowerCase().includes(queryLower);
                const categoryMatch = p.nama_kategori && p.nama_kategori.toLowerCase().includes(queryLower);
                return nameMatch || descMatch || categoryMatch;
            });

            setProducts(filtered);
        } catch (err) {
            console.error('Error searching:', err);
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

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const handleResetSearch = () => {
        navigate('/products');
    };

    if (loading) {
        return (
            <div className="products-loading">
                <div className="spinner"></div>
                <p>Memuat produk...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="products-error">
                <p>{error}</p>
                <button onClick={fetchProducts} className="btn-retry">
                    <i className="fas fa-redo"></i> Coba Lagi
                </button>
            </div>
        );
    }

    return (
        <section id="products" className="products-section">
            <div className="container">
                <h2 className="section-title">Produk <span>Unggulan</span></h2>
                <p className="section-subtitle">Koleksi produk rajutan tangan berkualitas</p>

                {(searchParam || categoryParam) && (
                    <div className="active-search-info">
                        <i className="fas fa-search"></i>
                        <span>
                            {searchParam && (
                                <>Hasil untuk produk: <strong>"{searchParam}"</strong></>
                            )}
                            {categoryParam && (
                                <>Kategori: <strong>"{categoryParam}"</strong></>
                            )}
                        </span>
                        <button
                            className="btn-clear-search"
                            onClick={handleResetSearch}
                            title="Hapus filter pencarian"
                        >
                            <i className="fas fa-times"></i> Hapus Filter
                        </button>
                    </div>
                )}

                {!isAuthenticated && (
                    <div className="login-warning">
                        <i className="fas fa-info-circle"></i>
                        <span>Silakan <strong>login</strong> terlebih dahulu untuk membeli produk.</span>
                    </div>
                )}

                {products.length === 0 ? (
                    <div className="no-products">
                        <p>
                            {searchParam
                                ? `Tidak ada produk dengan nama "${searchParam}"`
                                : categoryParam
                                ? `Tidak ada produk di kategori "${categoryParam}"`
                                : 'Tidak ada produk ditemukan'
                            }
                        </p>
                        {(searchParam || categoryParam) && (
                            <button
                                className="btn-reset-search"
                                onClick={handleResetSearch}
                            >
                                <i className="fas fa-redo"></i> Reset Pencarian
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => {
                            const productImage = getProductImage(product.nama_produk);
                            return (
                                <div
                                    key={product.id}
                                    className="product-card"
                                    onClick={() => handleProductClick(product.id)}
                                >
                                    <div className="product-image">
                                        {productImage ? (
                                            <img
                                                src={productImage}
                                                alt={product.nama_produk}
                                                className="product-img"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const placeholder = e.target.parentElement.querySelector('.product-placeholder');
                                                    if (placeholder) placeholder.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <span
                                            className="product-placeholder"
                                            style={{ display: productImage ? 'none' : 'flex' }}
                                        >
                                            {product.nama_produk ? product.nama_produk.charAt(0) : '?'}
                                        </span>
                                        <span className="product-badge">
                                            <i className="fas fa-tag"></i> {product.nama_kategori || 'Umum'}
                                        </span>
                                        {product.stok <= 0 && (
                                            <span className="product-stock-badge">
                                                <i className="fas fa-times-circle"></i> Habis
                                            </span>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{product.nama_produk}</h3>
                                        <p className="product-description">{product.deskripsi}</p>
                                        <div className="product-price">{formatPrice(product.harga_jual)}</div>
                                        <div className="product-stock">
                                            <i className="fas fa-box"></i> Stok: {product.stok} unit
                                        </div>
                                        <div className="product-card-footer">
                                            <button
                                                className="btn-view-detail"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProductClick(product.id);
                                                }}
                                            >
                                                <i className="fas fa-eye"></i> Lihat Detail
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Products;