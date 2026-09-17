// src/pages/AdminBahan.jsx
import React, { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX,
    FiInfo, FiAlertTriangle
} from 'react-icons/fi';
import { bahanAPI, kategoriAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminBahan.css';

const FORM_KOSONG = {
    nama_bahan: '',
    kategori_id: '',
    satuan: 'pcs',
    stok_minimal: 0,
    deskripsi: ''
};

const AdminBahan = () => {
    const { isAdmin } = useAuth();
    const [bahan, setBahan] = useState([]);
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
            const [resBahan, resKategori] = await Promise.all([
                bahanAPI.getAll(),
                kategoriAPI.getAll()
            ]);
            setBahan(resBahan.data.data || []);
            setKategori(resKategori.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat data: ' + err.message);
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

    const handleTambah = () => {
        setEditId(null);
        setForm(FORM_KOSONG);
        setModalOpen(true);
    };

    const handleEdit = (b) => {
        setEditId(b.id);
        setForm({
            nama_bahan: b.nama_bahan || '',
            kategori_id: b.kategori_id || '',
            satuan: b.satuan || 'pcs',
            stok_minimal: b.stok_minimal || 0,
            deskripsi: b.deskripsi || ''
        });
        setModalOpen(true);
    };

    const handleHapus = async (b) => {
        if (!window.confirm(`Hapus bahan "${b.nama_bahan}"?`)) return;
        try {
            await bahanAPI.delete(b.id);
            alert('Bahan dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.nama_bahan) {
            alert('Nama bahan wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                nama_bahan: form.nama_bahan,
                kategori_id: form.kategori_id,
                satuan: form.satuan,
                stok_minimal: Number(form.stok_minimal) || 0,
                deskripsi: form.deskripsi
            };

            if (editId) {
                await bahanAPI.update(editId, payload);
                alert('Bahan diupdate');
            } else {
                await bahanAPI.create(payload);
                alert(
                    'Bahan dibuat.\n\n' +
                    'Stok & harga beli akan terisi otomatis setelah PO di Pembelian Bahan diterima.'
                );
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const bahanFiltered = bahan.filter(b =>
        !search ||
        (b.nama_bahan && b.nama_bahan.toLowerCase().includes(search.toLowerCase())) ||
        (b.kode_bahan && b.kode_bahan.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat bahan...</div>
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
                            <h1 className="admin-title">Kelola Bahan</h1>
                            <p className="admin-subtitle">
                                Daftar bahan mentah (benang, kain, dll) di gudang
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah Bahan
                            </button>
                        </div>
                    </div>
                </div>

                {/* INFO BOX */}
                <div className="admin-info-box">
                    <FiInfo />
                    <span>
                        <strong>Info:</strong> Stok & harga beli bahan <strong>otomatis</strong> dari
                        <strong> Pembelian Bahan</strong> saat PO diterima.
                        Bahan yang belum ada PO akan tampil dengan stok <strong>0</strong>.
                    </span>
                </div>

                {/* SEARCH */}
                <div className="admin-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Cari bahan (nama / kode)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* TABEL */}
                <div className="admin-card">
                    {bahanFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada bahan.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Nama Bahan</th>
                                    <th>Kategori</th>
                                    <th>Satuan</th>
                                    <th>Stok</th>
                                    <th>Stok Minimal</th>
                                    <th>Harga Beli</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bahanFiltered.map(b => (
                                    <tr key={b.id}>
                                        <td><strong>{b.kode_bahan || '-'}</strong></td>
                                        <td>{b.nama_bahan}</td>
                                        <td>{b.nama_kategori || '-'}</td>
                                        <td>{b.satuan || 'pcs'}</td>
                                        <td>
                                            {Number(b.stok) <= Number(b.stok_minimal) && Number(b.stok) > 0 ? (
                                                <span className="badge badge-batal">{b.stok} (kritis)</span>
                                            ) : Number(b.stok) === 0 ? (
                                                <span className="text-muted">0</span>
                                            ) : (
                                                <span>{b.stok}</span>
                                            )}
                                        </td>
                                        <td>{b.stok_minimal || 0}</td>
                                        <td>
                                            {b.harga_beli > 0
                                                ? formatPrice(b.harga_beli)
                                                : <span className="text-muted">-</span>
                                            }
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-icon-btn edit"
                                                onClick={() => handleEdit(b)}
                                                title="Edit"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    className="admin-icon-btn delete"
                                                    onClick={() => handleHapus(b)}
                                                    title="Hapus"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
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
                            <h2>{editId ? 'Edit Bahan' : 'Tambah Bahan'}</h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Nama Bahan *</label>
                                <input
                                    type="text"
                                    value={form.nama_bahan}
                                    onChange={(e) => setForm({ ...form, nama_bahan: e.target.value })}
                                    placeholder="Contoh: Benang Katun Premium"
                                    required
                                />
                            </div>

                            <div className="admin-form-group">
                                <label>Kategori</label>
                                <select
                                    value={form.kategori_id}
                                    onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
                                >
                                    <option value="">- Pilih Kategori -</option>
                                    {kategori.map(k => (
                                        <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Satuan</label>
                                    <select
                                        value={form.satuan}
                                        onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                                    >
                                        <option value="pcs">pcs</option>
                                        <option value="kg">kg</option>
                                        <option value="gram">gram</option>
                                        <option value="meter">meter</option>
                                        <option value="yard">yard</option>
                                        <option value="roll">roll</option>
                                        <option value="lusin">lusin</option>
                                    </select>
                                </div>
                                <div className="admin-form-group">
                                    <label>Stok Minimal</label>
                                    <input
                                        type="number"
                                        value={form.stok_minimal}
                                        onChange={(e) => setForm({ ...form, stok_minimal: e.target.value })}
                                        min="0"
                                    />
                                    <small className="form-hint">
                                        Alert kalau stok kurang dari ini
                                    </small>
                                </div>
                            </div>

                            {!editId && (
                                <div className="admin-info-box" style={{ marginBottom: 16 }}>
                                    <FiAlertTriangle />
                                    <span>
                                        <strong>Catatan:</strong> Stok & harga beli bahan
                                        akan terisi otomatis setelah Anda membuat
                                        <strong> Pembelian Bahan</strong> ke supplier dan
                                        mengklik <strong>Terima Barang</strong>.
                                    </span>
                                </div>
                            )}

                            <div className="admin-form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    rows="3"
                                    value={form.deskripsi}
                                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                    placeholder="Deskripsi bahan..."
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

export default AdminBahan;