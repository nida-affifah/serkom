// src/pages/Notifikasi.jsx
import React, { useEffect, useState } from 'react';
import {
    FiBell, FiCheckCircle, FiTrash2, FiRefreshCw,
    FiPackage, FiDollarSign, FiCornerUpLeft, FiGift, FiInfo
} from 'react-icons/fi';
import { notifikasiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Notifikasi.css';

const TIPE_ICON = {
    pesanan: FiPackage,
    pembayaran: FiDollarSign,
    retur: FiCornerUpLeft,
    promo: FiGift,
    sistem: FiInfo
};

const TIPE_COLOR = {
    pesanan: 'purple',
    pembayaran: 'green',
    retur: 'orange',
    promo: 'pink',
    sistem: 'blue'
};

const Notifikasi = () => {
    const { isAuthenticated } = useAuth();
    const [notifikasi, setNotifikasi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');
    const [jumlahBelum, setJumlahBelum] = useState(0);

    useEffect(() => {
        if (isAuthenticated) fetchData();
        else setLoading(false);
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resAll, resCount] = await Promise.all([
                notifikasiAPI.getAll(),
                notifikasiAPI.belumDibaca()
            ]);
            setNotifikasi(resAll.data.data || []);
            setJumlahBelum(resCount.data.jumlah_belum_dibaca || 0);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat notifikasi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTandaiBaca = async (n) => {
        if (n.sudah_dibaca) return;
        try {
            await notifikasiAPI.tandaiBaca(n.id);
            fetchData();
        } catch (err) {
            alert('Gagal: ' + err.message);
        }
    };

    const handleTandaiSemuaBaca = async () => {
        if (jumlahBelum === 0) {
            alert('Tidak ada notifikasi yang belum dibaca');
            return;
        }
        if (!window.confirm('Tandai semua notifikasi sudah dibaca?')) return;
        try {
            await notifikasiAPI.tandaiSemuaBaca();
            alert('Semua notifikasi ditandai sudah dibaca');
            fetchData();
        } catch (err) {
            alert('Gagal: ' + err.message);
        }
    };

    const handleHapus = async (n) => {
        if (!window.confirm('Hapus notifikasi ini?')) return;
        try {
            await notifikasiAPI.hapus(n.id);
            fetchData();
        } catch (err) {
            alert('Gagal: ' + err.message);
        }
    };

    const handleHapusSemua = async () => {
        if (notifikasi.length === 0) return;
        if (!window.confirm('Hapus semua notifikasi?')) return;
        try {
            await notifikasiAPI.hapusSemua();
            alert('Semua notifikasi dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal: ' + err.message);
        }
    };

    const formatTanggal = (tgl) => {
        if (!tgl) return '-';
        const d = new Date(tgl);
        const sekarang = new Date();
        const selisih = Math.floor((sekarang - d) / 1000); // detik

        if (selisih < 60) return 'Baru saja';
        if (selisih < 3600) return `${Math.floor(selisih / 60)} menit lalu`;
        if (selisih < 86400) return `${Math.floor(selisih / 3600)} jam lalu`;
        if (selisih < 604800) return `${Math.floor(selisih / 86400)} hari lalu`;

        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const notifikasiFiltered = filter === 'semua'
        ? notifikasi
        : filter === 'belum'
        ? notifikasi.filter(n => !n.sudah_dibaca)
        : notifikasi.filter(n => n.tipe === filter);

    if (!isAuthenticated) {
        return (
            <div className="notif-page">
                <div className="notif-container">
                    <div className="notif-empty">
                        <FiBell size={64} style={{ color: '#ccc' }} />
                        <h2>Silakan login dulu</h2>
                        <p>Anda perlu login untuk melihat notifikasi.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="notif-page">
                <div className="notif-container">
                    <div className="notif-loading">Memuat notifikasi...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="notif-page">
            <div className="notif-container">
                {/* HEADER */}
                <div className="notif-header">
                    <div className="notif-badge">Notifikasi</div>
                    <div className="notif-header-row">
                        <div>
                            <h1 className="notif-title">
                                Notifikasi Saya
                                {jumlahBelum > 0 && (
                                    <span className="notif-count-badge">{jumlahBelum}</span>
                                )}
                            </h1>
                            <p className="notif-subtitle">
                                Info pesanan, pembayaran, retur, dan promo
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="notif-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            {jumlahBelum > 0 && (
                                <button className="notif-btn-primary" onClick={handleTandaiSemuaBaca}>
                                    <FiCheckCircle /> Tandai Semua Baca
                                </button>
                            )}
                            {notifikasi.length > 0 && (
                                <button className="notif-btn-danger" onClick={handleHapusSemua}>
                                    <FiTrash2 /> Hapus Semua
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* FILTER */}
                <div className="notif-filter-tabs">
                    <button
                        className={`notif-filter-tab ${filter === 'semua' ? 'active' : ''}`}
                        onClick={() => setFilter('semua')}
                    >
                        Semua ({notifikasi.length})
                    </button>
                    <button
                        className={`notif-filter-tab ${filter === 'belum' ? 'active' : ''}`}
                        onClick={() => setFilter('belum')}
                    >
                        Belum Dibaca ({jumlahBelum})
                    </button>
                    {['pesanan', 'pembayaran', 'retur', 'promo', 'sistem'].map(t => {
                        const jumlah = notifikasi.filter(n => n.tipe === t).length;
                        if (jumlah === 0) return null;
                        return (
                            <button
                                key={t}
                                className={`notif-filter-tab ${filter === t ? 'active' : ''}`}
                                onClick={() => setFilter(t)}
                            >
                                {t} ({jumlah})
                            </button>
                        );
                    })}
                </div>

                {/* LIST NOTIFIKASI */}
                {notifikasiFiltered.length === 0 ? (
                    <div className="notif-empty">
                        <FiBell size={64} style={{ color: '#ccc' }} />
                        <h2>Tidak ada notifikasi</h2>
                        <p>Notifikasi akan muncul di sini saat ada aktivitas</p>
                    </div>
                ) : (
                    <div className="notif-list">
                        {notifikasiFiltered.map(n => {
                            const Icon = TIPE_ICON[n.tipe] || FiBell;
                            const color = TIPE_COLOR[n.tipe] || 'purple';
                            return (
                                <div
                                    key={n.id}
                                    className={`notif-item ${!n.sudah_dibaca ? 'unread' : ''}`}
                                    onClick={() => handleTandaiBaca(n)}
                                >
                                    <div className={`notif-icon notif-icon-${color}`}>
                                        <Icon />
                                    </div>

                                    <div className="notif-content">
                                        <div className="notif-item-header">
                                            <h3>{n.judul}</h3>
                                            {!n.sudah_dibaca && (
                                                <span className="notif-unread-dot"></span>
                                            )}
                                        </div>
                                        <p className="notif-pesan">{n.pesan}</p>
                                        <div className="notif-meta">
                                            <span className="notif-tipe">{n.tipe}</span>
                                            <span className="notif-waktu">
                                                {formatTanggal(n.tanggal)}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        className="notif-hapus-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleHapus(n);
                                        }}
                                        title="Hapus"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifikasi;