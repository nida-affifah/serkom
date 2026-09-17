// src/App.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Cart from './components/Cart/Cart';
import CheckoutModal from './components/Checkout/CheckoutModal';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import TokoHomePage from './pages/TokoHomePage';
import AboutTokoPage from './pages/AboutTokoPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetail from './pages/ProductDetail';
import Products from './components/Products/Products';
import AdminBahan from './pages/AdminBahan';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import KeranjangPage from './pages/KeranjangPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import AlamatSaya from './pages/AlamatSaya';
import Notifikasi from './pages/Notifikasi';
import UlasanSaya from './pages/UlasanSaya';

import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminKategori from './pages/AdminKategori';
import AdminPesanan from './pages/AdminPesanan';
import AdminLaporan from './pages/AdminLaporan';
import AdminRetur from './pages/AdminRetur';
import AdminSupplier from './pages/AdminSupplier';
import AdminPembelian from './pages/AdminPembelian';
import AdminVoucher from './pages/AdminVoucher';
import AdminPegawai from './pages/AdminPegawai';
import AdminKelolaUser from './pages/AdminKelolaUser/AdminKelolaUser';

import './App.css';

// Role groups
const ADMIN_ONLY    = ['admin'];
const STAFF_ROLES   = ['admin', 'staff_gudang'];
const KASIR_ROLES   = ['admin', 'kasir'];
const PEGAWAI_ROLES = ['admin', 'staff_gudang', 'kasir', 'perajin'];

function App() {
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const handleCheckoutDariCart = () => {
        setCartOpen(false);
        setCheckoutOpen(true);
    };

    const handleCheckoutSukses = () => {
        setCheckoutOpen(false);
        window.location.href = '/purchase-history';
    };

    return (
        <>
            <Navbar onCartClick={() => setCartOpen(true)} />

            <Routes>
                {/* ═══ PUBLIK ═══ */}
                <Route path="/" element={<TokoHomePage />} />
                <Route path="/toko" element={<TokoHomePage />} />
                <Route path="/products" element={<Products />} />
                <Route path="/admin/bahan" element={<AdminBahan />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/about-toko" element={<AboutTokoPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* ═══ PEMBELI (butuh login) ═══ */}
                <Route
                    path="/keranjang"
                    element={
                        <ProtectedRoute allow={['pembeli', 'admin', 'staff_gudang', 'kasir', 'perajin']}>
                            <KeranjangPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/purchase-history"
                    element={
                        <ProtectedRoute allow={['pembeli', 'admin', 'staff_gudang', 'kasir', 'perajin']}>
                            <PurchaseHistoryPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/alamat"
                    element={
                        <ProtectedRoute allow={['pembeli', 'admin', 'staff_gudang', 'kasir', 'perajin']}>
                            <AlamatSaya />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/notifikasi"
                    element={
                        <ProtectedRoute allow={['pembeli', 'admin', 'staff_gudang', 'kasir', 'perajin']}>
                            <Notifikasi />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ulasan"
                    element={
                        <ProtectedRoute allow={['pembeli', 'admin', 'staff_gudang', 'kasir', 'perajin']}>
                            <UlasanSaya />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ ADMIN DASHBOARD (semua pegawai) ═══ */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allow={PEGAWAI_ROLES}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ PRODUK (admin + staff_gudang) ═══ */}
                <Route
                    path="/admin/products"
                    element={
                        <ProtectedRoute allow={STAFF_ROLES}>
                            <AdminProducts />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ KATEGORI (admin) ═══ */}
                <Route
                    path="/admin/kategori"
                    element={
                        <ProtectedRoute allow={ADMIN_ONLY}>
                            <AdminKategori />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ PESANAN (admin + kasir) ═══ */}
                <Route
                    path="/admin/pesanan"
                    element={
                        <ProtectedRoute allow={KASIR_ROLES}>
                            <AdminPesanan />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ RETUR (admin + kasir) ═══ */}
                <Route
                    path="/admin/retur"
                    element={
                        <ProtectedRoute allow={KASIR_ROLES}>
                            <AdminRetur />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ SUPPLIER (admin + staff) ═══ */}
                <Route
                    path="/admin/supplier"
                    element={
                        <ProtectedRoute allow={STAFF_ROLES}>
                            <AdminSupplier />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ PEMBELIAN (admin + staff) ═══ */}
                <Route
                    path="/admin/pembelian"
                    element={
                        <ProtectedRoute allow={STAFF_ROLES}>
                            <AdminPembelian />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ LAPORAN (semua pegawai) ═══ */}
                <Route
                    path="/admin/laporan"
                    element={
                        <ProtectedRoute allow={PEGAWAI_ROLES}>
                            <AdminLaporan />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ VOUCHER (admin) ═══ */}
                <Route
                    path="/admin/voucher"
                    element={
                        <ProtectedRoute allow={ADMIN_ONLY}>
                            <AdminVoucher />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ PEGAWAI (admin) ═══ */}
                <Route
                    path="/admin/pegawai"
                    element={
                        <ProtectedRoute allow={ADMIN_ONLY}>
                            <AdminPegawai />
                        </ProtectedRoute>
                    }
                />

                {/* ═══ KELOLA USER (admin) ═══ */}
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allow={ADMIN_ONLY}>
                            <AdminKelolaUser />
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Cart
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
                onCheckout={handleCheckoutDariCart}
            />

            {checkoutOpen && (
                <CheckoutModal
                    onClose={() => setCheckoutOpen(false)}
                    onSuccess={handleCheckoutSukses}
                />
            )}
        </>
    );
}

export default App;