// src/pages/AdminVoucher.jsx
import React, { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX
} from 'react-icons/fi';
import { voucherAPI } from '../services/api';
import './AdminVoucher.css';

const FORM_KOSONG = {
    kode: '',
    diskon_persen: 0,
    diskon_nominal: 0,
    min_belanja: 0,
    tanggal_mulai: '',
    tanggal_selesai: '',
    kuota: 0,
    status: 'aktif'
};

const AdminVoucher = () => {
    const [voucher, setVoucher] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(FORM_KOSONG);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await voucherAPI.getAll();
            setVoucher(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat voucher: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTambah = () => {
        setEditId(null);
        setForm(FORM_KOSONG);
        setModalOpen(true);
    };

    const handleEdit = (v) => {
        setEditId(v.id);
        setForm({
            kode: v.kode || '',
            diskon_persen: v.diskon_persen || 0,
            diskon_nominal: v.diskon_nominal || 0,
            min_belanja: v.min_belanja || 0,
            tanggal_mulai: v.tanggal_mulai ? v.tanggal_mulai.split('T')[0] : '',
            tanggal_selesai: v.tanggal_selesai ? v.tanggal_selesai.split('T')[0] : '',
            kuota: v.kuota || 0,
            status: v.status || 'aktif'
        });
        setModalOpen(true);
    };

    const handleHapus = async (v) => {
        if (!window.confirm(`Hapus voucher "${v.kode}"?`)) return;
        try {
            await voucherAPI.delete(v.id);
            alert('Voucher dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.kode) {
            alert('Kode voucher wajib diisi');
            return;
        }
        if (!form.diskon_persen && !form.diskon_nominal) {
            alert('Isi salah satu: diskon persen atau diskon nominal');
            return;
        }

        setSubmitting(true);
        try {
            if (editId) {
                await voucherAPI.update(editId, form);
                alert('Voucher diupdate');
            } else {
                await voucherAPI.create(form);
                alert('Voucher dibuat');
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
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
            year: 'numeric'
        });
    };

    const getDiskonLabel = (v) => {
        if (v.diskon_persen > 0) return `${v.diskon_persen}%`;
        if (v.diskon_nominal > 0) return formatPrice(v.diskon_nominal);
        return '-';
    };

    const voucherFiltered = voucher.filter(v =>
        !search ||
        (v.kode && v.kode.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat voucher...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="admin-header">
                    <div className="admin-badge">Admin</div>
                    <div className="admin-header-row">
                        <div>
                            <h1 className="admin-title">Kelola Voucher</h1>
                            <p className="admin-subtitle">Daftar kode promo & diskon toko RajutIndah</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah Voucher
                            </button>
                        </div>
                    </div>
                </div>

                <div className="admin-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Cari kode voucher..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="admin-card">
                    {voucherFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada voucher.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Diskon</th>
                                    <th>Min. Belanja</th>
                                    <th>Berlaku</th>
                                    <th>Kuota</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {voucherFiltered.map(v => (
                                    <tr key={v.id}>
                                        <td><strong>{v.kode}</strong></td>
                                        <td>
                                            <span className="badge badge-diproses">
                                                {getDiskonLabel(v)}
                                            </span>
                                        </td>
                                        <td>{formatPrice(v.min_belanja)}</td>
                                        <td style={{ fontSize: '0.78rem' }}>
                                            {formatTanggal(v.tanggal_mulai)} - {formatTanggal(v.tanggal_selesai)}
                                        </td>
                                        <td>{v.kuota}</td>
                                        <td>
                                            <span className={`badge ${v.status === 'aktif' ? 'badge-selesai' : 'badge-batal'}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-icon-btn edit"
                                                onClick={() => handleEdit(v)}
                                                title="Edit"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="admin-icon-btn delete"
                                                onClick={() => handleHapus(v)}
                                                title="Hapus"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>{editId ? 'Edit Voucher' : 'Tambah Voucher'}</h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Kode Voucher *</label>
                                <input
                                    type="text"
                                    value={form.kode}
                                    onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                                    placeholder="Contoh: RAJUT10"
                                    required
                                />
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Diskon Persen (%)</label>
                                    <input
                                        type="number"
                                        value={form.diskon_persen}
                                        onChange={(e) => setForm({ ...form, diskon_persen: e.target.value })}
                                        placeholder="Contoh: 10"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Diskon Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        value={form.diskon_nominal}
                                        onChange={(e) => setForm({ ...form, diskon_nominal: e.target.value })}
                                        placeholder="Contoh: 15000"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Min. Belanja</label>
                                    <input
                                        type="number"
                                        value={form.min_belanja}
                                        onChange={(e) => setForm({ ...form, min_belanja: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Kuota</label>
                                    <input
                                        type="number"
                                        value={form.kuota}
                                        onChange={(e) => setForm({ ...form, kuota: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        value={form.tanggal_mulai}
                                        onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        value={form.tanggal_selesai}
                                        onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })}
                                    />
                                </div>
                            </div>

                            {editId && (
                                <div className="admin-form-group">
                                    <label>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Nonaktif</option>
                                    </select>
                                </div>
                            )}

                            <div className="admin-modal-actions">
                                <button
                                    type="button"
                                    className="admin-btn-cancel"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Menyimpan...' : (editId ? 'Update' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVoucher;