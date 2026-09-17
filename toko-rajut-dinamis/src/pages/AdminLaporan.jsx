// src/pages/AdminLaporan.jsx
import React, { useEffect, useState } from 'react';
import {
    FiRefreshCw, FiDownload, FiTrendingUp, FiPackage,
    FiDollarSign, FiShoppingCart, FiAlertTriangle
} from 'react-icons/fi';
import { laporanAPI } from '../services/api';
import './AdminLaporan.css';

const AdminLaporan = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('harian');

    const [ringkasan, setRingkasan] = useState(null);
    const [harian, setHarian] = useState([]);
    const [bulanan, setBulanan] = useState([]);
    const [terlaris, setTerlaris] = useState([]);
    const [perKategori, setPerKategori] = useState([]);
    const [stokKritis, setStokKritis] = useState([]);
    const [periode, setPeriode] = useState({
        dari: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        sampai: new Date().toISOString().split('T')[0]
    });
    const [laporanPeriode, setLaporanPeriode] = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [resRingkasan, resHarian, resBulanan, resTerlaris, resKategori, resStok] = await Promise.all([
                laporanAPI.ringkasan(),
                laporanAPI.harian(),
                laporanAPI.bulanan(),
                laporanAPI.produkTerlaris(10),
                laporanAPI.perKategori(),
                laporanAPI.stokMenipis()
            ]);

            setRingkasan(resRingkasan.data.data);
            setHarian(resHarian.data.data || []);
            setBulanan(resBulanan.data.data || []);
            setTerlaris(resTerlaris.data.data || []);
            setPerKategori(resKategori.data.data || []);
            setStokKritis(resStok.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat laporan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriode = async () => {
        try {
            setLoading(true);
            const res = await laporanAPI.periode(periode.dari, periode.sampai);
            setLaporanPeriode(res.data.data);
        } catch (err) {
            alert('Gagal memuat laporan periode: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
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

    const formatBulan = (bulan) => {
        if (!bulan) return '-';
        const [tahun, bln] = bulan.split('-');
        const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                           'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${namaBulan[parseInt(bln) - 1]} ${tahun}`;
    };

    const handleExportCSV = (data, namaFile) => {
        if (!data || data.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
        ];
        const csvString = csvRows.join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${namaFile}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const maxHarian = harian.length > 0
        ? Math.max(...harian.map(h => Number(h.total_penjualan) || 0))
        : 0;

    const maxBulanan = bulanan.length > 0
        ? Math.max(...bulanan.map(b => Number(b.total_penjualan) || 0))
        : 0;

    if (loading && !ringkasan) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat laporan...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                {/* HEADER */}
                <div className="admin-header">
                    <div className="admin-badge">Admin</div>
                    <div className="admin-header-row">
                        <div>
                            <h1 className="admin-title">Laporan Penjualan</h1>
                            <p className="admin-subtitle">Rekap penjualan, stok, dan pendapatan toko RajutIndah</p>
                        </div>
                        <button className="admin-refresh" onClick={fetchAll}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* 4 KARTU RINGKASAN */}
                <div className="laporan-stats">
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon purple">
                            <FiShoppingCart />
                        </div>
                        <div>
                            <span className="laporan-stat-label">Total Pesanan</span>
                            <strong className="laporan-stat-value">{ringkasan?.total_pesanan || 0}</strong>
                        </div>
                    </div>
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon green">
                            <FiDollarSign />
                        </div>
                        <div>
                            <span className="laporan-stat-label">Total Pendapatan</span>
                            <strong className="laporan-stat-value">{formatPrice(ringkasan?.total_pendapatan)}</strong>
                        </div>
                    </div>
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon blue">
                            <FiPackage />
                        </div>
                        <div>
                            <span className="laporan-stat-label">Pesanan Selesai</span>
                            <strong className="laporan-stat-value">{ringkasan?.pesanan_selesai || 0}</strong>
                        </div>
                    </div>
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon orange">
                            <FiAlertTriangle />
                        </div>
                        <div>
                            <span className="laporan-stat-label">Stok Kritis</span>
                            <strong className="laporan-stat-value">{ringkasan?.produk_stok_kritis || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* TAB */}
                <div className="laporan-tabs">
                    <button
                        className={`laporan-tab ${activeTab === 'harian' ? 'active' : ''}`}
                        onClick={() => setActiveTab('harian')}
                    >
                        Penjualan Harian
                    </button>
                    <button
                        className={`laporan-tab ${activeTab === 'bulanan' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bulanan')}
                    >
                        Penjualan Bulanan
                    </button>
                    <button
                        className={`laporan-tab ${activeTab === 'terlaris' ? 'active' : ''}`}
                        onClick={() => setActiveTab('terlaris')}
                    >
                        Produk Terlaris
                    </button>
                    <button
                        className={`laporan-tab ${activeTab === 'kategori' ? 'active' : ''}`}
                        onClick={() => setActiveTab('kategori')}
                    >
                        Per Kategori
                    </button>
                    <button
                        className={`laporan-tab ${activeTab === 'stok' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stok')}
                    >
                        Stok Menipis
                    </button>
                    <button
                        className={`laporan-tab ${activeTab === 'periode' ? 'active' : ''}`}
                        onClick={() => setActiveTab('periode')}
                    >
                        Per Periode
                    </button>
                </div>

                {/* TAB: HARIAN */}
                {activeTab === 'harian' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Penjualan 7 Hari Terakhir</h2>
                            <button
                                className="laporan-export-btn"
                                onClick={() => handleExportCSV(harian, 'laporan_harian')}
                            >
                                <FiDownload /> Export CSV
                            </button>
                        </div>

                        {harian.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <>
                                {/* GRAFIK */}
                                <div className="laporan-chart">
                                    {harian.map((h, idx) => {
                                        const tinggi = maxHarian > 0
                                            ? (Number(h.total_penjualan) / maxHarian) * 100
                                            : 0;
                                        return (
                                            <div key={idx} className="chart-col">
                                                <span className="chart-value">{formatPrice(h.total_penjualan)}</span>
                                                <div className="chart-track">
                                                    <div
                                                        className="chart-fill"
                                                        style={{ height: `${tinggi}%` }}
                                                    ></div>
                                                </div>
                                                <span className="chart-label">{formatTanggal(h.tanggal)}</span>
                                                <span className="chart-sub">{h.jumlah_pesanan} pesanan</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* TABEL */}
                                <table className="admin-table" style={{ marginTop: 24 }}>
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Jumlah Pesanan</th>
                                            <th>Total Penjualan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {harian.map((h, idx) => (
                                            <tr key={idx}>
                                                <td>{formatTanggal(h.tanggal)}</td>
                                                <td><strong>{h.jumlah_pesanan}</strong></td>
                                                <td>{formatPrice(h.total_penjualan)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                )}

                {/* TAB: BULANAN */}
                {activeTab === 'bulanan' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Penjualan 12 Bulan Terakhir</h2>
                            <button
                                className="laporan-export-btn"
                                onClick={() => handleExportCSV(bulanan, 'laporan_bulanan')}
                            >
                                <FiDownload /> Export CSV
                            </button>
                        </div>

                        {bulanan.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <>
                                <div className="laporan-chart">
                                    {bulanan.map((b, idx) => {
                                        const tinggi = maxBulanan > 0
                                            ? (Number(b.total_penjualan) / maxBulanan) * 100
                                            : 0;
                                        return (
                                            <div key={idx} className="chart-col">
                                                <span className="chart-value">{formatPrice(b.total_penjualan)}</span>
                                                <div className="chart-track">
                                                    <div
                                                        className="chart-fill"
                                                        style={{ height: `${tinggi}%` }}
                                                    ></div>
                                                </div>
                                                <span className="chart-label">{formatBulan(b.bulan)}</span>
                                                <span className="chart-sub">{b.jumlah_pesanan} pesanan</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <table className="admin-table" style={{ marginTop: 24 }}>
                                    <thead>
                                        <tr>
                                            <th>Bulan</th>
                                            <th>Jumlah Pesanan</th>
                                            <th>Total Penjualan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulanan.map((b, idx) => (
                                            <tr key={idx}>
                                                <td>{formatBulan(b.bulan)}</td>
                                                <td><strong>{b.jumlah_pesanan}</strong></td>
                                                <td>{formatPrice(b.total_penjualan)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                )}

                {/* TAB: PRODUK TERLARIS */}
                {activeTab === 'terlaris' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Produk Terlaris (Top 10)</h2>
                            <button
                                className="laporan-export-btn"
                                onClick={() => handleExportCSV(terlaris, 'produk_terlaris')}
                            >
                                <FiDownload /> Export CSV
                            </button>
                        </div>

                        {terlaris.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Kode</th>
                                        <th>Nama Produk</th>
                                        <th>Terjual</th>
                                        <th>Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {terlaris.map((p, idx) => (
                                        <tr key={p.id}>
                                            <td><strong>#{idx + 1}</strong></td>
                                            <td>{p.kode_produk || '-'}</td>
                                            <td>{p.nama_produk}</td>
                                            <td><strong>{p.total_terjual}</strong> unit</td>
                                            <td>{formatPrice(p.total_pendapatan)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB: PER KATEGORI */}
                {activeTab === 'kategori' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Pendapatan Per Kategori</h2>
                            <button
                                className="laporan-export-btn"
                                onClick={() => handleExportCSV(perKategori, 'per_kategori')}
                            >
                                <FiDownload /> Export CSV
                            </button>
                        </div>

                        {perKategori.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Kategori</th>
                                        <th>Item Terjual</th>
                                        <th>Pendapatan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perKategori.map((k, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{k.nama_kategori || '-'}</strong></td>
                                            <td>{k.total_item_terjual || 0} unit</td>
                                            <td>{formatPrice(k.total_pendapatan)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB: STOK MENIPIS */}
                {activeTab === 'stok' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiAlertTriangle /> Produk Stok Menipis</h2>
                            <button
                                className="laporan-export-btn"
                                onClick={() => handleExportCSV(stokKritis, 'stok_menipis')}
                            >
                                <FiDownload /> Export CSV
                            </button>
                        </div>

                        {stokKritis.length === 0 ? (
                            <p className="admin-empty">Semua stok aman.</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Kode</th>
                                        <th>Produk</th>
                                        <th>Stok</th>
                                        <th>Stok Minimal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stokKritis.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.kode_produk || '-'}</td>
                                            <td>{p.nama_produk}</td>
                                            <td><strong style={{ color: '#ef4444' }}>{p.stok}</strong></td>
                                            <td>{p.stok_minimal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB: PER PERIODE */}
                {activeTab === 'periode' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Laporan Per Periode</h2>
                        </div>

                        <div className="periode-filter">
                            <div className="periode-input">
                                <label>Dari</label>
                                <input
                                    type="date"
                                    value={periode.dari}
                                    onChange={(e) => setPeriode({ ...periode, dari: e.target.value })}
                                />
                            </div>
                            <div className="periode-input">
                                <label>Sampai</label>
                                <input
                                    type="date"
                                    value={periode.sampai}
                                    onChange={(e) => setPeriode({ ...periode, sampai: e.target.value })}
                                />
                            </div>
                            <button className="admin-btn-primary" onClick={fetchPeriode}>
                                <FiRefreshCw /> Tampilkan
                            </button>
                            {laporanPeriode && (
                                <button
                                    className="laporan-export-btn"
                                    onClick={() => handleExportCSV(laporanPeriode.detail, 'laporan_periode')}
                                >
                                    <FiDownload /> Export CSV
                                </button>
                            )}
                        </div>

                        {laporanPeriode ? (
                            <>
                                <div className="periode-summary">
                                    <div>
                                        <span>Jumlah Pesanan</span>
                                        <strong>{laporanPeriode.ringkasan.jumlah_pesanan || 0}</strong>
                                    </div>
                                    <div>
                                        <span>Total Penjualan</span>
                                        <strong>{formatPrice(laporanPeriode.ringkasan.total_penjualan)}</strong>
                                    </div>
                                </div>

                                <table className="admin-table" style={{ marginTop: 20 }}>
                                    <thead>
                                        <tr>
                                            <th>Kode</th>
                                            <th>Tanggal</th>
                                            <th>Pembeli</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(laporanPeriode.detail || []).map(p => (
                                            <tr key={p.id}>
                                                <td><strong>{p.kode_pesanan}</strong></td>
                                                <td>{formatTanggal(p.tanggal)}</td>
                                                <td>{p.nama_pembeli || '-'}</td>
                                                <td>{formatPrice(p.total)}</td>
                                                <td>
                                                    <span className={`badge badge-${p.status}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <p className="admin-empty">Pilih periode, lalu klik Tampilkan.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLaporan;