// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPackage, FiShoppingCart, FiDollarSign, FiUsers,
    FiAlertTriangle, FiTrendingUp, FiClock, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { laporanAPI, pesananAPI } from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [ringkasan, setRingkasan] = useState(null);
    const [harian, setHarian] = useState([]);
    const [terlaris, setTerlaris] = useState([]);
    const [stokKritis, setStokKritis] = useState([]);
    const [pesananTerbaru, setPesananTerbaru] = useState([]);

    // ═══════════════════════════════════════
    // KONFIGURASI PER ROLE
    // ═══════════════════════════════════════
    const roleConfig = {
        admin: {
            badge: 'Admin Dashboard',
            subtitle: 'Ringkasan lengkap aktivitas toko RajutIndah'
        },
        staff_gudang: {
            badge: 'Staff Gudang Dashboard',
            subtitle: 'Ringkasan stok & gudang toko RajutIndah'
        },
        kasir: {
            badge: 'Kasir Dashboard',
            subtitle: 'Ringkasan transaksi & pembayaran toko RajutIndah'
        },
        perajin: {
            badge: 'Perajin Dashboard',
            subtitle: 'Ringkasan produk & laporan toko RajutIndah'
        }
    };

    const config = roleConfig[user?.role] || roleConfig.admin;

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);

        // Cek role user
        const role = user?.role;
        const bolehAksesPesanan = role === 'admin' || role === 'kasir';

        // Helper: fetch yang aman
        const fetchSafe = async (promise) => {
            try {
                return await promise;
            } catch (err) {
                return null;
            }
        };

        try {
            const promises = [
                fetchSafe(laporanAPI.ringkasan()),
                fetchSafe(laporanAPI.harian()),
                fetchSafe(laporanAPI.produkTerlaris(5)),
                fetchSafe(laporanAPI.stokMenipis()),
                // Hanya fetch pesanan kalau role boleh
                bolehAksesPesanan ? fetchSafe(pesananAPI.getAll()) : Promise.resolve(null)
            ];

            const [resRingkasan, resHarian, resTerlaris, resStok, resPesanan] = await Promise.all(promises);

            if (resRingkasan) setRingkasan(resRingkasan.data.data);
            if (resHarian) setHarian(resHarian.data.data || []);
            if (resTerlaris) setTerlaris(resTerlaris.data.data || []);
            if (resStok) setStokKritis(resStok.data.data || []);
            if (resPesanan) setPesananTerbaru((resPesanan.data.data || []).slice(0, 5));
        } catch (err) {
            console.error('Error fetch dashboard:', err);
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
        }).format(price || 0);
    };

    const formatTanggal = (tgl) => {
        if (!tgl) return '-';
        return new Date(tgl).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Cari nilai max di harian untuk scaling grafik
    const maxHarian = harian.length > 0
        ? Math.max(...harian.map(h => Number(h.total_penjualan) || 0))
        : 0;

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="admin-header">
                    <div className="admin-badge">{config.badge}</div>
                    <div className="admin-header-row">
                        <div>
                            <h1 className="admin-title">
                                Selamat Datang, {user?.nama_lengkap || 'User'}
                            </h1>
                            <p className="admin-subtitle">{config.subtitle}</p>
                        </div>
                        <button className="admin-refresh" onClick={fetchAll}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* 5 KARTU RINGKASAN */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon purple">
                            <FiShoppingCart />
                        </div>
                        <h3 className="admin-stat-label">Total Pesanan</h3>
                        <p className="admin-stat-value">
                            {ringkasan?.total_pesanan || 0}
                        </p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon green">
                            <FiDollarSign />
                        </div>
                        <h3 className="admin-stat-label">Total Pendapatan</h3>
                        <p className="admin-stat-value">
                            {formatPrice(ringkasan?.total_pendapatan)}
                        </p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon pink">
                            <FiClock />
                        </div>
                        <h3 className="admin-stat-label">Pesanan Pending</h3>
                        <p className="admin-stat-value">
                            {ringkasan?.pesanan_pending || 0}
                        </p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon orange">
                            <FiAlertTriangle />
                        </div>
                        <h3 className="admin-stat-label">Stok Kritis</h3>
                        <p className="admin-stat-value">
                            {ringkasan?.produk_stok_kritis || 0}
                        </p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon blue">
                            <FiUsers />
                        </div>
                        <h3 className="admin-stat-label">Total Pembeli</h3>
                        <p className="admin-stat-value">
                            {ringkasan?.total_pembeli || 0}
                        </p>
                    </div>
                </div>

                {/* STATUS PESANAN */}
                <div className="admin-row">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Status Pesanan</h2>
                        </div>
                        <div className="admin-status-grid">
                            <div className="status-item">
                                <span className="status-label">Pending</span>
                                <span className="status-value status-pending">
                                    {ringkasan?.pesanan_pending || 0}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Diproses</span>
                                <span className="status-value status-diproses">
                                    {ringkasan?.pesanan_diproses || 0}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Dikirim</span>
                                <span className="status-value status-dikirim">
                                    {ringkasan?.pesanan_dikirim || 0}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Selesai</span>
                                <span className="status-value status-selesai">
                                    {ringkasan?.pesanan_selesai || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* GRAFIK PENJUALAN HARIAN */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2><FiTrendingUp /> Penjualan 7 Hari Terakhir</h2>
                    </div>
                    {harian.length === 0 ? (
                        <p className="admin-empty">Belum ada data penjualan.</p>
                    ) : (
                        <div className="admin-chart">
                            {harian.map((h, idx) => {
                                const tinggi = maxHarian > 0
                                    ? (Number(h.total_penjualan) / maxHarian) * 100
                                    : 0;
                                return (
                                    <div key={idx} className="chart-bar-wrapper">
                                        <div className="chart-bar-value">
                                            {formatPrice(h.total_penjualan)}
                                        </div>
                                        <div className="chart-bar-container">
                                            <div
                                                className="chart-bar"
                                                style={{ height: `${tinggi}%` }}
                                            ></div>
                                        </div>
                                        <div className="chart-bar-label">
                                            {formatTanggal(h.tanggal)}
                                        </div>
                                        <div className="chart-bar-count">
                                            {h.jumlah_pesanan} pesanan
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 2 KOLOM: PRODUK TERLARIS + STOK MENIPIS */}
                <div className="admin-row-2">
                    {/* Produk Terlaris */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Produk Terlaris</h2>
                        </div>
                        {terlaris.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Produk</th>
                                        <th>Terjual</th>
                                        <th>Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {terlaris.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.nama_produk}</td>
                                            <td><strong>{p.total_terjual}</strong></td>
                                            <td>{formatPrice(p.total_pendapatan)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Stok Menipis */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiAlertTriangle /> Stok Menipis</h2>
                        </div>
                        {stokKritis.length === 0 ? (
                            <p className="admin-empty">Semua stok aman.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Produk</th>
                                        <th>Stok</th>
                                        <th>Min</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stokKritis.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.nama_produk}</td>
                                            <td><strong style={{ color: '#ef4444' }}>{p.stok}</strong></td>
                                            <td>{p.stok_minimal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* PESANAN TERBARU */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2><FiShoppingCart /> Pesanan Terbaru</h2>
                        <button
                            className="admin-link-btn"
                            onClick={() => navigate('/admin/pesanan')}
                        >
                            Lihat Semua →
                        </button>
                    </div>
                    {pesananTerbaru.length === 0 ? (
                        <p className="admin-empty">Belum ada pesanan.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Pembeli</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pesananTerbaru.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.kode_pesanan}</strong></td>
                                        <td>{p.nama_pembeli || '-'}</td>
                                        <td>{formatPrice(p.total)}</td>
                                        <td>
                                            <span className={`badge badge-${p.status}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td>{formatTanggal(p.tanggal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;