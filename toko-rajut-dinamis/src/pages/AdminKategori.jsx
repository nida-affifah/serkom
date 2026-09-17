// src/pages/AdminKategori.jsx
import React, { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX
} from 'react-icons/fi';
import { kategoriAPI } from '../services/api';
import './AdminKategori.css';

const FORM_KOSONG = {
    nama_kategori: '',
    deskripsi: '',
    gambar: ''
};

const AdminKategori = () => {
    const [kategori, setKategori] = useState([]);
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
            const res = await kategoriAPI.getAll();
            setKategori(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat kategori: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTambah = () => {
        setEditId(null);
        setForm(FORM_KOSONG);
        setModalOpen(true);
    };

    const handleEdit = (k) => {
        setEditId(k.id);
        setForm({
            nama_kategori: k.nama_kategori || '',
            deskripsi: k.deskripsi || '',
            gambar: k.gambar || ''
        });
        setModalOpen(true);
    };

    const handleHapus = async (k) => {
        if (!window.confirm(`Hapus kategori "${k.nama_kategori}"?`)) return;
        try {
            await kategoriAPI.delete(k.id);
            alert('Kategori dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nama_kategori) {
            alert('Nama kategori wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            if (editId) {
                await kategoriAPI.update(editId, form);
                alert('Kategori diupdate');
            } else {
                await kategoriAPI.create(form);
                alert('Kategori dibuat');
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const kategoriFiltered = kategori.filter(k =>
        !search ||
        (k.nama_kategori && k.nama_kategori.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat kategori...</div>
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
                            <h1 className="admin-title">Kelola Kategori</h1>
                            <p className="admin-subtitle">Daftar kategori produk di toko RajutIndah</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah Kategori
                            </button>
                        </div>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="admin-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Cari kategori..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* TABEL */}
                <div className="admin-card">
                    {kategoriFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada kategori.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nama Kategori</th>
                                    <th>Deskripsi</th>
                                    <th>Jumlah Produk</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kategoriFiltered.map(k => (
                                    <tr key={k.id}>
                                        <td><strong>#{k.id}</strong></td>
                                        <td>{k.nama_kategori}</td>
                                        <td>{k.deskripsi || '-'}</td>
                                        <td>
                                            <span className="badge badge-diproses">
                                                {k.jumlah_produk || 0} produk
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-icon-btn edit"
                                                onClick={() => handleEdit(k)}
                                                title="Edit"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="admin-icon-btn delete"
                                                onClick={() => handleHapus(k)}
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

            {/* MODAL FORM */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Nama Kategori *</label>
                                <input
                                    type="text"
                                    value={form.nama_kategori}
                                    onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
                                    placeholder="Contoh: Sweater"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    rows="3"
                                    value={form.deskripsi}
                                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                    placeholder="Deskripsi kategori..."
                                />
                            </div>

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

export default AdminKategori;