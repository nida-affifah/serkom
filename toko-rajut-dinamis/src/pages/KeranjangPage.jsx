// src/pages/KeranjangPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiTrash2, FiPlus, FiMinus,
    FiShoppingBag, FiCheckCircle
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/Checkout/CheckoutModal';
import './KeranjangPage.css';

const KeranjangPage = () => {
    const navigate = useNavigate();
    const { cart, cartTotal, updateJumlah, hapusItem, kosongkanKeranjang, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleTambah = async (item) => {
        if (item.jumlah >= item.stok) {
            alert(`Stok tidak cukup. Maksimal: ${item.stok}`);
            return;
        }
        const hasil = await updateJumlah(item.id, item.jumlah + 1);
        if (!hasil.success) alert(hasil.message);
    };

    const handleKurang = async (item) => {
        if (item.jumlah <= 1) return;
        const hasil = await updateJumlah(item.id, item.jumlah - 1);
        if (!hasil.success) alert(hasil.message);
    };

    const handleHapus = async (item) => {
        if (!window.confirm(`Hapus "${item.nama_produk}" dari keranjang?`)) return;
        const hasil = await hapusItem(item.id);
        if (!hasil.success) alert(hasil.message);
    };

    const handleKosongkan = async () => {
        if (!window.confirm('Kosongkan seluruh keranjang?')) return;
        await kosongkanKeranjang();
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            if (window.confirm('Anda harus login terlebih dahulu. Login sekarang?')) {
                navigate('/login');
            }
            return;
        }
        if (cart.length === 0) {
            alert('Keranjang masih kosong');
            return;
        }
        setCheckoutOpen(true);
    };

    const handleCheckoutSukses = () => {
        setCheckoutOpen(false);
        navigate('/purchase-history');
    };

    // Kalau belum login
    if (!isAuthenticated) {
        return (
            <div className="keranjang-page">
                <div className="container">
                    <div className="keranjang-empty">
                        <FiShoppingBag size={64} style={{ color: '#ccc' }} />
                        <h2>Silakan login dulu</h2>
                        <p>Anda perlu login untuk melihat keranjang belanja.</p>
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Login Sekarang
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="keranjang-page">
            <div className="container">
                <button
                    className="btn-back"
                    onClick={() => navigate('/products')}
                >
                    <FiArrowLeft /> Lanjut Belanja
                </button>

                <h1 className="keranjang-title">Keranjang Belanja</h1>

                {cart.length === 0 ? (
                    <div className="keranjang-empty">
                        <FiShoppingBag size={64} style={{ color: '#ccc' }} />
                        <h2>Keranjang masih kosong</h2>
                        <p>Yuk mulai belanja produk rajut favoritmu!</p>
                        <button className="btn-primary" onClick={() => navigate('/products')}>
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="keranjang-grid">
                        {/* LIST ITEM */}
                        <div className="keranjang-list">
                            <div className="keranjang-list-header">
                                <span>{cart.length} produk di keranjang</span>
                                <button
                                    className="btn-kosongkan"
                                    onClick={handleKosongkan}
                                    disabled={loading}
                                >
                                    <FiTrash2 /> Kosongkan
                                </button>
                            </div>

                            {cart.map((item) => (
                                <div key={item.id} className="keranjang-item">
                                    <div className="keranjang-item-info">
                                        <h3>{item.nama_produk}</h3>
                                        <p className="item-harga">{formatPrice(item.harga_jual)}</p>
                                        <p className="item-stok">Stok: {item.stok}</p>
                                    </div>

                                    <div className="keranjang-item-actions">
                                        <button
                                            onClick={() => handleKurang(item)}
                                            disabled={item.jumlah <= 1 || loading}
                                            className="qty-btn"
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="qty-value">{item.jumlah}</span>
                                        <button
                                            onClick={() => handleTambah(item)}
                                            disabled={item.jumlah >= item.stok || loading}
                                            className="qty-btn"
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>

                                    <div className="keranjang-item-subtotal">
                                        <span className="subtotal-label">Subtotal</span>
                                        <strong>{formatPrice(item.subtotal)}</strong>
                                    </div>

                                    <button
                                        className="btn-hapus"
                                        onClick={() => handleHapus(item)}
                                        disabled={loading}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* RINGKASAN */}
                        <div className="keranjang-summary">
                            <h2>Ringkasan Belanja</h2>

                            <div className="summary-row">
                                <span>Total Item</span>
                                <span>{cart.length} produk</span>
                            </div>

                            <div className="summary-row">
                                <span>Total Harga</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Ongkir</span>
                                <span className="text-muted">Dihitung saat checkout</span>
                            </div>

                            <hr />

                            <div className="summary-total">
                                <span>Total</span>
                                <strong>{formatPrice(cartTotal)}</strong>
                            </div>

                            <button
                                className="btn-checkout"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                <FiCheckCircle /> Lanjut ke Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {checkoutOpen && (
                <CheckoutModal
                    onClose={() => setCheckoutOpen(false)}
                    onSuccess={handleCheckoutSukses}
                />
            )}
        </div>
    );
};

export default KeranjangPage;