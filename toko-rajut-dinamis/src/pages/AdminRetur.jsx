// src/pages/AdminRetur.jsx
import React, { useEffect, useState } from 'react';
import {
    FiRefreshCw, FiEye, FiX, FiCheckCircle, FiXCircle,
    FiPackage, FiDollarSign, FiAlertCircle, FiMapPin
} from 'react-icons/fi';
import { returAPI } from '../services/api';
import './AdminRetur.css';

const STATUS_OPTIONS = [
    { value: 'diajukan', label: 'Diajukan', color: 'pending' },
    { value: 'disetujui', label: 'Disetujui', color: 'diproses' },
    { value: 'ditolak', label: 'Ditolak', color: 'batal' },
    { value: 'barang_dikirim', label: 'Barang Dikirim', color: 'dikirim' },
    { value: 'barang_diterima', label: 'Barang Diterima', color: 'diproses' },
    { value: 'selesai', label: 'Selesai', color: 'selesai' }
];

const AdminRetur = () => {
    const [retur, setRetur] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');
    const [detailOpen, setDetailOpen] = useState(false);
    const [returDetail, setReturDetail] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [catatan, setCatatan] = useState('');
    const [formRefund, setFormRefund] = useState({
        jumlah: 0,
        metode: 'Transfer BCA',
        bukti: ''
    });

    useEffect(() => {
        fetchRetur();
    }, []);

    const fetchRetur = async () => {
        setLoading(true);
        try {
            const res = await returAPI.getAll();
            setRetur(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat retur: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetail = async (id) => {
        try {
            const res = await returAPI.getById(id);
            setReturDetail(res.data.data);
            setCatatan(res.data.data.catatan_admin || '');
            // Pre-fill jumlah refund
            const totalRetur = (res.data.data.detail || []).reduce(
                (sum, d) => sum + Number(d.subtotal || 0), 0
            );
            setFormRefund({
                jumlah: totalRetur,
                metode: 'Transfer BCA',
                bukti: ''
            });
        } catch (err) {
            alert('Gagal memuat detail: ' + err.message);
        }
    };

    const handleBukaDetail = async (r) => {
        await fetchDetail(r.id);
        setDetailOpen(true);
    };

    const handleSetujui = async () => {
        if (!window.confirm('Setujui pengajuan retur ini?')) return;
        try {
            setSubmitting(true);
            await returAPI.setujui(returDetail.id, { catatan_admin: catatan });
            alert('Retur disetujui');
            await fetchDetail(returDetail.id);
            await fetchRetur();
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTolak = async () => {
        if (!catatan.trim()) {
            alert('Catatan alasan penolakan wajib diisi');
            return;
        }
        if (!window.confirm('Tolak pengajuan retur ini?')) return;
        try {
            setSubmitting(true);
            await returAPI.tolak(returDetail.id, { catatan_admin: catatan });
            alert('Retur ditolak');
            await fetchDetail(returDetail.id);
            await fetchRetur();
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTerimaBarang = async () => {
        if (!window.confirm('Tandai barang retur sudah diterima di toko?')) return;
        try {
            setSubmitting(true);
            await returAPI.terimaBarang(returDetail.id, { catatan_admin: catatan });
            alert('Barang retur diterima');
            await fetchDetail(returDetail.id);
            await fetchRetur();
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleProsesRefund = async () => {
        if (!formRefund.jumlah || formRefund.jumlah <= 0) {
            alert('Jumlah refund wajib diisi');
            return;
        }
        if (!window.confirm(`Proses refund Rp ${Number(formRefund.jumlah).toLocaleString('id-ID')}?`)) return;
        try {
            setSubmitting(true);
            await returAPI.prosesRefund(returDetail.id, formRefund);
            alert('Refund berhasil diproses');
            await fetchDetail(returDetail.id);
            await fetchRetur();
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const opt = STATUS_OPTIONS.find(o => o.value === status);
        return <span className={`badge badge-${opt?.color || 'pending'}`}>{opt?.label || status}</span>;
    };

    const returFiltered = filter === 'semua'
        ? retur
        : retur.filter(r => r.status === filter);

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat retur...</div>
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
                            <h1 className="admin-title">Kelola Retur</h1>
                            <p className="admin-subtitle">Daftar pengajuan retur dari pembeli</p>
                        </div>
                        <button className="admin-refresh" onClick={fetchRetur}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* FILTER */}
                <div className="admin-filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'semua' ? 'active' : ''}`}
                        onClick={() => setFilter('semua')}
                    >
                        Semua ({retur.length})
                    </button>
                    {STATUS_OPTIONS.map(s => {
                        const jumlah = retur.filter(r => r.status === s.value).length;
                        return (
                            <button
                                key={s.value}
                                className={`filter-tab ${filter === s.value ? 'active' : ''}`}
                                onClick={() => setFilter(s.value)}
                            >
                                {s.label} ({jumlah})
                            </button>
                        );
                    })}
                </div>

                {/* TABEL */}
                <div className="admin-card">
                    {returFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada retur.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Kode Retur</th>
                                    <th>Pesanan</th>
                                    <th>Pembeli</th>
                                    <th>Alasan</th>
                                    <th>Jenis</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returFiltered.map(r => (
                                    <tr key={r.id}>
                                        <td><strong>{r.kode_retur}</strong></td>
                                        <td>{r.kode_pesanan}</td>
                                        <td>{r.nama_pembeli || '-'}</td>
                                        <td>{r.nama_alasan || '-'}</td>
                                        <td>
                                            <span className="badge badge-dikirim">
                                                {r.jenis === 'refund' ? 'Refund' : 'Tukar Barang'}
                                            </span>
                                        </td>
                                        <td>{getStatusBadge(r.status)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-icon-btn edit"
                                                onClick={() => handleBukaDetail(r)}
                                                title="Detail"
                                            >
                                                <FiEye />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL DETAIL */}
            {detailOpen && returDetail && (
                <div className="admin-modal-overlay" onClick={() => setDetailOpen(false)}>
                    <div className="admin-modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Detail Retur {returDetail.kode_retur}</h2>
                            <button className="admin-modal-close" onClick={() => setDetailOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            {/* INFO RETUR */}
                            <div className="detail-section">
                                <h3><FiPackage /> Info Retur</h3>
                                <div className="detail-grid">
                                    <div>
                                        <span className="detail-label">Kode Retur</span>
                                        <strong>{returDetail.kode_retur}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Pesanan</span>
                                        <strong>{returDetail.kode_pesanan}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Pembeli</span>
                                        <strong>{returDetail.nama_pembeli || '-'}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Alasan</span>
                                        <strong>{returDetail.nama_alasan || '-'}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Jenis</span>
                                        <strong>{returDetail.jenis === 'refund' ? 'Refund (uang kembali)' : 'Tukar Barang'}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Status</span>
                                        {getStatusBadge(returDetail.status)}
                                    </div>
                                </div>
                                {returDetail.catatan && (
                                    <div className="detail-catatan-box">
                                        <span className="detail-label">Catatan Pembeli:</span>
                                        <p>{returDetail.catatan}</p>
                                    </div>
                                )}
                            </div>

                            {/* ITEM RETUR */}
                            <div className="detail-section">
                                <h3><FiPackage /> Item Retur</h3>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Jumlah</th>
                                            <th>Kondisi</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(returDetail.detail || []).map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.nama_produk}</td>
                                                <td>{d.jumlah}</td>
                                                <td>
                                                    <span className={`badge ${d.kondisi === 'bagus' ? 'badge-selesai' : 'badge-batal'}`}>
                                                        {d.kondisi}
                                                    </span>
                                                </td>
                                                <td>{formatPrice(d.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* CATATAN ADMIN */}
                            <div className="detail-section">
                                <h3><FiMapPin /> Catatan Admin</h3>
                                <textarea
                                    rows="2"
                                    className="admin-textarea"
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Catatan untuk pembeli..."
                                />
                            </div>

                            {/* AKSI: PENGAJUAN */}
                            {returDetail.status === 'diajukan' && (
                                <div className="detail-section">
                                    <h3><FiAlertCircle /> Aksi</h3>
                                    <div className="detail-actions">
                                        <button
                                            className="admin-btn-success"
                                            onClick={handleSetujui}
                                            disabled={submitting}
                                        >
                                            <FiCheckCircle /> Setujui Retur
                                        </button>
                                        <button
                                            className="admin-btn-danger"
                                            onClick={handleTolak}
                                            disabled={submitting}
                                        >
                                            <FiXCircle /> Tolak Retur
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* AKSI: DISETUJUI */}
                            {returDetail.status === 'disetujui' && (
                                <div className="detail-section">
                                    <h3><FiAlertCircle /> Aksi</h3>
                                    <p className="detail-hint">
                                        Menunggu pembeli mengirim barang balik. Klik tombol di bawah jika barang sudah diterima di toko.
                                    </p>
                                    <div className="detail-actions">
                                        <button
                                            className="admin-btn-primary"
                                            onClick={handleTerimaBarang}
                                            disabled={submitting}
                                        >
                                            <FiCheckCircle /> Terima Barang Retur
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* AKSI: BARANG DITERIMA → REFUND */}
                            {returDetail.status === 'barang_diterima' && returDetail.jenis === 'refund' && (
                                <div className="detail-section">
                                    <h3><FiDollarSign /> Proses Refund</h3>
                                    <div className="admin-form-row">
                                        <div className="admin-form-group">
                                            <label>Jumlah Refund *</label>
                                            <input
                                                type="number"
                                                value={formRefund.jumlah}
                                                onChange={(e) => setFormRefund({ ...formRefund, jumlah: e.target.value })}
                                            />
                                        </div>
                                        <div className="admin-form-group">
                                            <label>Metode</label>
                                            <select
                                                value={formRefund.metode}
                                                onChange={(e) => setFormRefund({ ...formRefund, metode: e.target.value })}
                                            >
                                                <option value="Transfer BCA">Transfer BCA</option>
                                                <option value="Transfer BRI">Transfer BRI</option>
                                                <option value="Transfer Mandiri">Transfer Mandiri</option>
                                                <option value="GoPay">GoPay</option>
                                                <option value="OVO">OVO</option>
                                                <option value="Dana">Dana</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Bukti Transfer (opsional)</label>
                                        <input
                                            type="text"
                                            value={formRefund.bukti}
                                            onChange={(e) => setFormRefund({ ...formRefund, bukti: e.target.value })}
                                            placeholder="Nama file bukti transfer..."
                                        />
                                    </div>
                                    <div className="detail-actions">
                                        <button
                                            className="admin-btn-primary"
                                            onClick={handleProsesRefund}
                                            disabled={submitting}
                                        >
                                            <FiDollarSign /> Proses Refund
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* INFO REFUND (kalau sudah selesai) */}
                            {returDetail.refund && (
                                <div className="detail-section">
                                    <h3><FiDollarSign /> Info Refund</h3>
                                    <div className="detail-grid">
                                        <div>
                                            <span className="detail-label">Jumlah</span>
                                            <strong>{formatPrice(returDetail.refund.jumlah)}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Metode</span>
                                            <strong>{returDetail.refund.metode}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Status</span>
                                            <strong>{returDetail.refund.status}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Tanggal</span>
                                            <strong>{formatTanggal(returDetail.refund.tanggal)}</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRetur;