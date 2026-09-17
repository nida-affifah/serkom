// src/components/Cart/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiTrash2, FiPlus, FiMinus, FiShoppingBag,
    FiAlertCircle, FiXCircle
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = ({ isOpen, onClose, onCheckout }) => {
    const navigate = useNavigate();
    const { cart, cartTotal, updateJumlah, hapusItem, loading } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Cek apakah ada item yang bermasalah
    const adaStokHabis = cart.some(i => i.status_stok === 'habis' || i.status_stok === 'tidak_tersedia');
    const adaStokKurang = cart.some(i => i.status_stok === 'kurang');
    const checkoutDisabled = loading || adaStokHabis || adaStokKurang;

    const handleTambah = async (item) => {
        if (item.stok <= 0) {
            alert(`Stok ${item.nama_produk} habis`);
            return;
        }
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

    const handleCheckout = () => {
        if (checkoutDisabled) {
            if (adaStokHabis) {
                alert('Ada produk yang stoknya habis. Hapus dulu sebelum checkout.');
            } else if (adaStokKurang) {
                alert('Ada produk yang jumlahnya melebihi stok. Kurangi dulu sebelum checkout.');
            }
            return;
        }
        if (onClose) onClose();
        if (onCheckout) {
            onCheckout();
        } else {
            navigate('/checkout');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={onClose}></div>
            <div className="cart-sidebar">
                <div className="cart-header">
                    <h2>Keranjang Belanja</h2>
                    <button className="cart-close" onClick={onClose}>✕</button>
                </div>

                <div className="cart-body">
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <FiShoppingBag size={48} style={{ color: '#ccc', marginBottom: 16 }} />
                            <p>Keranjang masih kosong</p>
                            <button
                                className="btn-shop"
                                onClick={() => {
                                    onClose();
                                    navigate('/products');
                                }}
                            >
                                Mulai Belanja
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* WARNING GLOBAL */}
                            {adaStokHabis && (
                                <div className="cart-warning danger">
                                    <FiXCircle />
                                    <span>Ada produk yang <strong>stoknya habis</strong>. Hapus untuk lanjut checkout.</span>
                                </div>
                            )}
                            {adaStokKurang && !adaStokHabis && (
                                <div className="cart-warning warning">
                                    <FiAlertCircle />
                                    <span>Ada produk yang jumlahnya <strong>melebihi stok</strong>. Kurangi dulu.</span>
                                </div>
                            )}

                            <div className="cart-items">
                                {cart.map((item) => {
                                    const stokHabis = item.status_stok === 'habis' || item.status_stok === 'tidak_tersedia';
                                    const stokKurang = item.status_stok === 'kurang';

                                    return (
                                        <div
                                            key={item.id}
                                            className={`cart-item ${stokHabis ? 'item-habis' : ''} ${stokKurang ? 'item-kurang' : ''}`}
                                        >
                                            <div className="cart-item-info">
                                                <h4>{item.nama_produk}</h4>
                                                <p>{formatPrice(item.harga_jual)}</p>
                                                <small style={{ color: '#888' }}>
                                                    Subtotal: {formatPrice(item.subtotal)}
                                                </small>

                                                {/* STATUS STOK */}
                                                {stokHabis && (
                                                    <div className="item-status danger">
                                                        <FiXCircle /> Stok Habis
                                                    </div>
                                                )}
                                                {stokKurang && (
                                                    <div className="item-status warning">
                                                        <FiAlertCircle /> Stok tersisa: {item.stok}
                                                        <br />
                                                        <small>Silakan kurangi jumlah</small>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="cart-item-actions">
                                                <button
                                                    onClick={() => handleKurang(item)}
                                                    className="qty-btn"
                                                    disabled={item.jumlah <= 1 || loading}
                                                >
                                                    <FiMinus />
                                                </button>
                                                <span className="qty-value">{item.jumlah}</span>
                                                <button
                                                    onClick={() => handleTambah(item)}
                                                    className="qty-btn"
                                                    disabled={
                                                        stokHabis ||
                                                        item.jumlah >= item.stok ||
                                                        loading
                                                    }
                                                >
                                                    <FiPlus />
                                                </button>
                                                <button
                                                    onClick={() => handleHapus(item)}
                                                    className="remove-btn"
                                                    disabled={loading}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="cart-summary">
                                <div className="cart-total">
                                    <span>Total ({cart.length} item)</span>
                                    <span>{formatPrice(cartTotal)}</span>
                                </div>
                                <button
                                    className="btn-checkout"
                                    onClick={handleCheckout}
                                    disabled={checkoutDisabled}
                                    title={
                                        adaStokHabis ? 'Ada produk stok habis' :
                                        adaStokKurang ? 'Ada produk yang jumlahnya melebihi stok' :
                                        'Checkout'
                                    }
                                >
                                    {adaStokHabis || adaStokKurang ? 'Perbaiki Keranjang Dulu' : 'Checkout'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;