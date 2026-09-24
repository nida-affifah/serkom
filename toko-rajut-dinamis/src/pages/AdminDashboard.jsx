// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPackage, FiShoppingCart, FiDollarSign, FiUsers,
    FiAlertTriangle, FiTrendingUp, FiClock, FiRefreshCw, FiCalendar
} from 'react-icons/fi';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { laporanAPI, produkAPI } from '../services/api';
import './AdminDashboard.css';

const WARNA_DONUT = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#14b8a6', '#a855f7'];

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [produkAll, setProdukAll] = useState([]);
    const [terlaris, setTerlaris] = useState([]);
    const [perKategori, setPerKategori] = useState([]);
    const [laporanPeriode, setLaporanPeriode] = useState(null);

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const [filterDari, setFilterDari] = useState(firstOfMonth);
    const [filterSampai, setFilterSampai] = useState(today);
    const [preset, setPreset] = useState('bulan-ini');

    const roleConfig = {
        admin: { badge: 'Admin Dashboard', subtitle: 'Statistik & grafik aktivitas toko RajutIndah' },
        staff_gudang: { badge: 'Staff Gudang Dashboard', subtitle: 'Statistik stok & gudang RajutIndah' },
        kasir: { badge: 'Kasir Dashboard', subtitle: 'Statistik transaksi & pembayaran RajutIndah' },
        perajin: { badge: 'Perajin Dashboard', subtitle: 'Statistik produk & laporan RajutIndah' }
    };
    const config = roleConfig[user?.role] || roleConfig.admin;

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        let dari = todayStr, sampai = todayStr;

        if (preset === 'hari-ini') { dari = todayStr; sampai = todayStr; }
        else if (preset === '7-hari') {
            const d = new Date(now); d.setDate(d.getDate() - 6);
            dari = d.toISOString().split('T')[0]; sampai = todayStr;
        } else if (preset === '30-hari') {
            const d = new Date(now); d.setDate(d.getDate() - 29);
            dari = d.toISOString().split('T')[0]; sampai = todayStr;
        } else if (preset === 'bulan-ini') {
            dari = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            sampai = todayStr;
        } else if (preset === 'bulan-lalu') {
            const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const last = new Date(now.getFullYear(), now.getMonth(), 0);
            dari = first.toISOString().split('T')[0];
            sampai = last.toISOString().split('T')[0];
        } else if (preset === 'tahun-ini') {
            dari = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            sampai = todayStr;
        } else return;

        setFilterDari(dari);
        setFilterSampai(sampai);
    }, [preset]);

    useEffect(() => {
        if (!loading) fetchPeriode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterDari, filterSampai]);

    const fetchAll = async () => {
        setLoading(true);
        const fetchSafe = async (p) => { try { return await p; } catch { return null; } };

        try {
            const [resTerlaris, resKategori, resPeriode, resProduk] = await Promise.all([
                fetchSafe(laporanAPI.produkTerlaris(5, filterDari, filterSampai)),
                fetchSafe(laporanAPI.perKategori(filterDari, filterSampai)),
                fetchSafe(laporanAPI.periode(filterDari, filterSampai)),
                fetchSafe(produkAPI.getAll())
            ]);

            if (resTerlaris) setTerlaris(resTerlaris.data.data || []);
            if (resKategori) setPerKategori(resKategori.data.data || []);
            if (resPeriode) setLaporanPeriode(resPeriode.data.data);
            if (resProduk) setProdukAll(resProduk.data.data || []);
        } catch (err) {
            console.error('Error fetch dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriode = async () => {
        try {
            const [resPeriode, resKategori, resTerlaris] = await Promise.all([
                laporanAPI.periode(filterDari, filterSampai),
                laporanAPI.perKategori(filterDari, filterSampai),
                laporanAPI.produkTerlaris(5, filterDari, filterSampai)
            ]);
            setLaporanPeriode(resPeriode.data.data);
            setPerKategori(resKategori.data.data || []);
            setTerlaris(resTerlaris.data.data || []);
        } catch (err) {
            console.error('Gagal fetch periode:', err);
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(price || 0);

    const formatPriceShort = (val) => {
        const n = Number(val) || 0;
        if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
        if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
        return `Rp ${n}`;
    };

    const formatTanggal = (tgl) => {
        if (!tgl) return '-';
        return new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTanggalSingkat = (tgl) => {
        if (!tgl) return '-';
        const d = new Date(tgl);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    const formatBulanLabel = (yyyyMM) => {
        if (!yyyyMM) return '-';
        const [tahun, bln] = yyyyMM.split('-');
        const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${namaBulan[parseInt(bln) - 1]} ${tahun}`;
    };

    // ═══════════════════════════════════════
    // RINGKASAN PERIODE
    // ═══════════════════════════════════════
    const ringkasanPeriode = useMemo(() => {
        const detail = laporanPeriode?.detail || [];
        const totalPesanan = detail.length;
        const totalPendapatan = detail.reduce((s, p) => s + (Number(p.total) || 0), 0);
        const pending = detail.filter(p => p.status === 'pending').length;
        const diproses = detail.filter(p => p.status === 'diproses').length;
        const dikirim = detail.filter(p => p.status === 'dikirim').length;
        const selesai = detail.filter(p => p.status === 'selesai').length;
        const pembeliUnik = new Set(detail.map(p => p.nama_pembeli).filter(Boolean));
        return {
            total_pesanan: totalPesanan,
            total_pendapatan: totalPendapatan,
            pesanan_pending: pending,
            pesanan_diproses: diproses,
            pesanan_dikirim: dikirim,
            pesanan_selesai: selesai,
            total_pembeli: pembeliUnik.size
        };
    }, [laporanPeriode]);

    // ═══════════════════════════════════════
    // STOK KRITIS BERDASARKAN PERIODE
    // Ambil dari produk terlaris periode ini yang stoknya <= minimal
    // ═══════════════════════════════════════
    const stokKritisPeriode = useMemo(() => {
        if (!produkAll.length) return [];
        if (!terlaris.length) return [];
        const idTerlaris = new Set(terlaris.map(t => t.id));
        return produkAll.filter(p =>
            idTerlaris.has(p.id) &&
            Number(p.stok) <= Number(p.stok_minimal) &&
            p.status === 'aktif'
        );
    }, [produkAll, terlaris]);

    // ═══════════════════════════════════════
    // DATA UNTUK GRAFIK
    // ═══════════════════════════════════════

    // Bar harian - dari detail
    const dataHarian = useMemo(() => {
        const detail = laporanPeriode?.detail || [];
        const map = {};
        detail.forEach(p => {
            const tgl = String(p.tanggal).split(' ')[0];
            if (!map[tgl]) map[tgl] = { tanggal: tgl, total: 0, jumlah: 0 };
            map[tgl].total += Number(p.total) || 0;
            map[tgl].jumlah += 1;
        });
        return Object.values(map).sort((a, b) => a.tanggal.localeCompare(b.tanggal))
            .map(d => ({ ...d, label: formatTanggalSingkat(d.tanggal), fullLabel: formatTanggal(d.tanggal) }));
    }, [laporanPeriode]);

    // Line bulanan - dari detail periode (dikelompokkan per bulan)
    const dataBulanan = useMemo(() => {
        const detail = laporanPeriode?.detail || [];
        const map = {};
        detail.forEach(p => {
            const bulan = String(p.tanggal).slice(0, 7); // YYYY-MM
            if (!map[bulan]) map[bulan] = { bulan, total: 0, jumlah: 0 };
            map[bulan].total += Number(p.total) || 0;
            map[bulan].jumlah += 1;
        });
        return Object.values(map).sort((a, b) => a.bulan.localeCompare(b.bulan))
            .map(d => ({ ...d, label: formatBulanLabel(d.bulan) }));
    }, [laporanPeriode]);

    const dataStatus = useMemo(() => {
        const r = ringkasanPeriode;
        return [
            { name: 'Pending', value: r.pesanan_pending || 0 },
            { name: 'Diproses', value: r.pesanan_diproses || 0 },
            { name: 'Dikirim', value: r.pesanan_dikirim || 0 },
            { name: 'Selesai', value: r.pesanan_selesai || 0 }
        ].filter(d => d.value > 0);
    }, [ringkasanPeriode]);

    const dataKategori = useMemo(() => perKategori.map(k => ({
        name: k.nama_kategori || '-', value: Number(k.total_pendapatan) || 0
    })).filter(d => d.value > 0), [perKategori]);

    const dataTerlaris = useMemo(() => terlaris.map(p => ({
        name: p.nama_produk, value: Number(p.total_terjual) || 0, pendapatan: Number(p.total_pendapatan) || 0
    })), [terlaris]);

    const dataKategoriTerjual = useMemo(() => perKategori.map(k => ({
        name: k.nama_kategori || '-',
        value: Number(k.total_item_terjual) || 0,
        pendapatan: Number(k.total_pendapatan) || 0
    })).filter(d => d.value > 0), [perKategori]);

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
                            <h1 className="admin-title">Selamat Datang, {user?.nama_lengkap || 'User'}</h1>
                            <p className="admin-subtitle">{config.subtitle}</p>
                        </div>
                        <button className="admin-refresh" onClick={fetchAll}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* FILTER */}
                <div className="dashboard-filter">
                    <div className="dashboard-filter-label"><FiCalendar /> Filter Periode:</div>
                    <div className="dashboard-filter-presets">
                        {[
                            { val: 'hari-ini', label: 'Hari Ini' },
                            { val: '7-hari', label: '7 Hari' },
                            { val: '30-hari', label: '30 Hari' },
                            { val: 'bulan-ini', label: 'Bulan Ini' },
                            { val: 'bulan-lalu', label: 'Bulan Lalu' },
                            { val: 'tahun-ini', label: 'Tahun Ini' }
                        ].map(p => (
                            <button key={p.val} className={`dashboard-filter-btn ${preset === p.val ? 'active' : ''}`} onClick={() => setPreset(p.val)}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="dashboard-filter-dates">
                        <label>Dari
                            <input type="date" value={filterDari} onChange={(e) => { setFilterDari(e.target.value); setPreset(''); }} />
                        </label>
                        <label>Sampai
                            <input type="date" value={filterSampai} onChange={(e) => { setFilterSampai(e.target.value); setPreset(''); }} />
                        </label>
                    </div>
                </div>

                {laporanPeriode?.ringkasan && (
                    <div className="dashboard-periode-info">
                        Menampilkan data <strong>{formatTanggal(filterDari)}</strong> s/d <strong>{formatTanggal(filterSampai)}</strong>
                        {' '}— <strong>{ringkasanPeriode.total_pesanan}</strong> pesanan,
                        {' '}total <strong>{formatPrice(ringkasanPeriode.total_pendapatan)}</strong>
                    </div>
                )}

                {/* 5 KARTU */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon purple"><FiShoppingCart /></div>
                        <h3 className="admin-stat-label">Total Pesanan</h3>
                        <p className="admin-stat-value">{ringkasanPeriode.total_pesanan}</p>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon green"><FiDollarSign /></div>
                        <h3 className="admin-stat-label">Total Pendapatan</h3>
                        <p className="admin-stat-value">{formatPrice(ringkasanPeriode.total_pendapatan)}</p>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon pink"><FiClock /></div>
                        <h3 className="admin-stat-label">Pesanan Pending</h3>
                        <p className="admin-stat-value">{ringkasanPeriode.pesanan_pending}</p>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon orange"><FiAlertTriangle /></div>
                        <h3 className="admin-stat-label">Stok Kritis</h3>
                        <p className="admin-stat-value">{stokKritisPeriode.length}</p>
                        <span style={{ fontSize: '0.62rem', color: '#9ca3af', display: 'block', marginTop: 2 }}>
                            (produk terjual periode ini)
                        </span>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon blue"><FiUsers /></div>
                        <h3 className="admin-stat-label">Total Pembeli</h3>
                        <p className="admin-stat-value">{ringkasanPeriode.total_pembeli}</p>
                    </div>
                </div>

                {/* 2 DONUT */}
                <div className="dashboard-grid-2">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Status Pesanan</h2>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700 }}>
                                (periode terpilih)
                            </span>
                        </div>
                        {dataStatus.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <div className="dashboard-chart-box">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={dataStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}
                                            label={({ name, value }) => `${name}: ${value}`}>
                                            {dataStatus.map((_, i) => <Cell key={i} fill={WARNA_DONUT[i % WARNA_DONUT.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [`${v} pesanan`, n]} contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 10, fontWeight: 700 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Pendapatan per Kategori</h2>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700 }}>
                                (periode terpilih)
                            </span>
                        </div>
                        {dataKategori.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <div className="dashboard-chart-box">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={dataKategori} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}
                                            label={({ name }) => name}>
                                            {dataKategori.map((_, i) => <Cell key={i} fill={WARNA_DONUT[i % WARNA_DONUT.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 10, fontWeight: 700 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                {/* BAR HARIAN */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2><FiTrendingUp /> Penjualan Harian ({formatTanggal(filterDari)} – {formatTanggal(filterSampai)})</h2>
                    </div>
                    {dataHarian.length === 0 ? (
                        <p className="admin-empty">Tidak ada penjualan di periode ini.</p>
                    ) : (
                        <div className="dashboard-chart-box">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dataHarian} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700 }} />
                                    <YAxis tickFormatter={formatPriceShort} tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => [formatPrice(v), 'Penjualan']}
                                        labelFormatter={(l, p) => p?.[0]?.payload?.fullLabel || l}
                                        contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 10, fontWeight: 700 }} />
                                    <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* LINE BULANAN - dari periode */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <h2><FiTrendingUp /> Tren Penjualan Bulanan</h2>
                        <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700 }}>
                            (dari periode terpilih)
                        </span>
                    </div>
                    {dataBulanan.length === 0 ? (
                        <p className="admin-empty">Belum ada data pada periode ini.</p>
                    ) : (
                        <div className="dashboard-chart-box">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dataBulanan} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700 }} />
                                    <YAxis tickFormatter={formatPriceShort} tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => [formatPrice(v), 'Penjualan']}
                                        contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 10, fontWeight: 700 }} />
                                    <Line type="monotone" dataKey="total" stroke="#ec4899" strokeWidth={3}
                                        dot={{ r: 5, fill: '#8b5cf6', stroke: '#1a1a1a', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* PRODUK TERLARIS + KATEGORI TERJUAL */}
                <div className="dashboard-grid-2">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Produk Terlaris (Top 5)</h2>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700 }}>
                                (periode terpilih)
                            </span>
                        </div>
                        {dataTerlaris.length === 0 ? (
                            <p className="admin-empty">Belum ada data pada periode ini.</p>
                        ) : (
                            <div className="dashboard-chart-box">
                                <ResponsiveContainer width="100%" height={Math.max(220, dataTerlaris.length * 50)}>
                                    <BarChart data={dataTerlaris} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip formatter={(v, n, p) => [`${v} unit - ${formatPrice(p.payload.pendapatan)}`, 'Terjual']}
                                            contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 10, fontWeight: 700 }} />
                                        <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Kategori Terjual</h2>
                            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 700 }}>
                                (periode terpilih)
                            </span>
                        </div>
                        {dataKategoriTerjual.length === 0 ? (
                            <p className="admin-empty">Belum ada data pada periode ini.</p>
                        ) : (
                            <div className="dashboard-chart-box">
                                <ResponsiveContainer width="100%" height={Math.max(220, dataKategoriTerjual.length * 50)}>
                                    <BarChart data={dataKategoriTerjual} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fontWeight: 700 }} />
                                        <Tooltip formatter={(v, n, p) => [`${v} item - ${formatPrice(p.payload.pendapatan)}`, 'Terjual']}
                                            contentStyle={{ border: '2px solid #1a1a1a', borderRadius: 10, fontWeight: 700 }} />
                                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;