// src/pages/AdminSupplier.jsx
import React, { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX
} from 'react-icons/fi';
import { supplierAPI } from '../services/api';
import './AdminSupplier.css';

const FORM_KOSONG = {
    nama_supplier: '',
    no_hp: '',
    alamat: '',
    bahan_dipasok: ''
};

const AdminSupplier = () => {
    const [supplier, setSupplier] = useState([]);
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
            const res = await supplierAPI.getAll();
            setSupplier(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat supplier: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTambah = () => {
        setEditId(null);
        setForm(FORM_KOSONG);
        setModalOpen(true);
    };

    const handleEdit = (s) => {
        setEditId(s.id);
        setForm({
            nama_supplier: s.nama_supplier || '',
            no_hp: s.no_hp || '',
            alamat: s.alamat || '',
            bahan_dipasok: s.bahan_dipasok || ''
        });
        setModalOpen(true);
    };

    const handleHapus = async (s) => {
        if (!window.confirm(`Hapus supplier "${s.nama_supplier}"?`)) return;
        try {
            await supplierAPI.delete(s.id);
            alert('Supplier dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nama_supplier) {
            alert('Nama supplier wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            if (editId) {
                await supplierAPI.update(editId, form);
                alert('Supplier diupdate');
            } else {
                await supplierAPI.create(form);
                alert('Supplier dibuat');
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const supplierFiltered = supplier.filter(s =>
        !search ||
        (s.nama_supplier && s.nama_supplier.toLowerCase().includes(search.toLowerCase())) ||
        (s.bahan_dipasok && s.bahan_dipasok.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat supplier...</div>
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
                            <h1 className="admin-title">Kelola Supplier</h1>
                            <p className="admin-subtitle">Daftar supplier bahan rajut di toko RajutIndah</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah Supplier
                            </button>
                        </div>
                    </div>
                </div>

                <div className="admin-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Cari supplier (nama / bahan)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="admin-card">
                    {supplierFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada supplier.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nama Supplier</th>
                                    <th>No. HP</th>
                                    <th>Alamat</th>
                                    <th>Bahan Dipasok</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierFiltered.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>#{s.id}</strong></td>
                                        <td>{s.nama_supplier}</td>
                                        <td>{s.no_hp || '-'}</td>
                                        <td>{s.alamat || '-'}</td>
                                        <td>
                                            <span className="badge badge-diproses">
                                                {s.bahan_dipasok || '-'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-icon-btn edit"
                                                onClick={() => handleEdit(s)}
                                                title="Edit"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="admin-icon-btn delete"
                                                onClick={() => handleHapus(s)}
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
                            <h2>{editId ? 'Edit Supplier' : 'Tambah Supplier'}</h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Nama Supplier *</label>
                                <input
                                    type="text"
                                    value={form.nama_supplier}
                                    onChange={(e) => setForm({ ...form, nama_supplier: e.target.value })}
                                    placeholder="Contoh: Toko Benang Jaya"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>No. HP</label>
                                <input
                                    type="text"
                                    value={form.no_hp}
                                    onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                    placeholder="Contoh: 08123456789"
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Alamat</label>
                                <textarea
                                    rows="2"
                                    value={form.alamat}
                                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                                    placeholder="Alamat supplier..."
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Bahan Dipasok</label>
                                <input
                                    type="text"
                                    value={form.bahan_dipasok}
                                    onChange={(e) => setForm({ ...form, bahan_dipasok: e.target.value })}
                                    placeholder="Contoh: Benang katun, benang wol"
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

export default AdminSupplier;