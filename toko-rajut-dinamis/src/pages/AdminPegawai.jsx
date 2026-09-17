// src/pages/AdminPegawai.jsx
import React, { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX,
    FiScissors, FiDollarSign, FiPackage
} from 'react-icons/fi';
import { pegawaiAPI } from '../services/api';
import './AdminPegawai.css';

const TABS = [
    { key: 'perajin', label: 'Perajin', icon: FiScissors },
    { key: 'kasir', label: 'Kasir', icon: FiDollarSign },
    { key: 'staff', label: 'Staff Gudang', icon: FiPackage }
];

const FORM_KOSONG = {
    perajin: { nama_perajin: '', no_hp: '', alamat: '', keahlian: '', upah_per_pcs: 0 },
    kasir: { nama: '', no_hp: '', shift: 'pagi' },
    staff: { nama: '', no_hp: '', alamat: '' }
};

const AdminPegawai = () => {
    const [activeTab, setActiveTab] = useState('perajin');
    const [data, setData] = useState({ perajin: [], kasir: [], staff: [] });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(FORM_KOSONG.perajin);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [resPerajin, resKasir, resStaff] = await Promise.all([
                pegawaiAPI.perajin.getAll(),
                pegawaiAPI.kasir.getAll(),
                pegawaiAPI.staff.getAll()
            ]);
            setData({
                perajin: resPerajin.data.data || [],
                kasir: resKasir.data.data || [],
                staff: resStaff.data.data || []
            });
        } catch (err) {
            console.error(err);
            alert('Gagal memuat data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTambah = () => {
        setEditId(null);
        setForm(FORM_KOSONG[activeTab]);
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditId(item.id);
        if (activeTab === 'perajin') {
            setForm({
                nama_perajin: item.nama_perajin || '',
                no_hp: item.no_hp || '',
                alamat: item.alamat || '',
                keahlian: item.keahlian || '',
                upah_per_pcs: item.upah_per_pcs || 0
            });
        } else if (activeTab === 'kasir') {
            setForm({
                nama: item.nama || '',
                no_hp: item.no_hp || '',
                shift: item.shift || 'pagi'
            });
        } else {
            setForm({
                nama: item.nama || '',
                no_hp: item.no_hp || '',
                alamat: item.alamat || ''
            });
        }
        setModalOpen(true);
    };

    const handleHapus = async (item) => {
        const nama = activeTab === 'perajin' ? item.nama_perajin : item.nama;
        if (!window.confirm(`Hapus "${nama}"?`)) return;
        try {
            await pegawaiAPI[activeTab].delete(item.id);
            alert('Berhasil dihapus');
            fetchAll();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi
        if (activeTab === 'perajin' && !form.nama_perajin) {
            alert('Nama perajin wajib diisi');
            return;
        }
        if ((activeTab === 'kasir' || activeTab === 'staff') && !form.nama) {
            alert('Nama wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            if (editId) {
                await pegawaiAPI[activeTab].update(editId, form);
                alert('Berhasil diupdate');
            } else {
                await pegawaiAPI[activeTab].create(form);
                alert('Berhasil ditambahkan');
            }
            setModalOpen(false);
            fetchAll();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getNamaPegawai = (item) => {
        return activeTab === 'perajin' ? item.nama_perajin : item.nama;
    };

    const dataFiltered = data[activeTab].filter(item => {
        if (!search) return true;
        const nama = (activeTab === 'perajin' ? item.nama_perajin : item.nama) || '';
        return nama.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat data pegawai...</div>
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
                            <h1 className="admin-title">Kelola Pegawai</h1>
                            <p className="admin-subtitle">Data perajin, kasir, dan staff gudang</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchAll}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah {TABS.find(t => t.key === activeTab)?.label}
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="admin-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
                        >
                            <tab.icon /> {tab.label} ({data[tab.key].length})
                        </button>
                    ))}
                </div>

                {/* SEARCH */}
                <div className="admin-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder={`Cari ${TABS.find(t => t.key === activeTab)?.label.toLowerCase()}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* TABEL */}
                <div className="admin-card">
                    {dataFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada data.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                {activeTab === 'perajin' && (
                                    <tr>
                                        <th>Nama Perajin</th>
                                        <th>No. HP</th>
                                        <th>Keahlian</th>
                                        <th>Upah/pcs</th>
                                        <th style={{ textAlign: 'right' }}>Aksi</th>
                                    </tr>
                                )}
                                {activeTab === 'kasir' && (
                                    <tr>
                                        <th>Nama Kasir</th>
                                        <th>No. HP</th>
                                        <th>Shift</th>
                                        <th style={{ textAlign: 'right' }}>Aksi</th>
                                    </tr>
                                )}
                                {activeTab === 'staff' && (
                                    <tr>
                                        <th>Nama Staff</th>
                                        <th>No. HP</th>
                                        <th>Alamat</th>
                                        <th style={{ textAlign: 'right' }}>Aksi</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {dataFiltered.map(item => (
                                    <tr key={item.id}>
                                        <td><strong>{getNamaPegawai(item)}</strong></td>
                                        <td>{item.no_hp || '-'}</td>
                                        {activeTab === 'perajin' && (
                                            <>
                                                <td>
                                                    <span className="badge badge-diproses">
                                                        {item.keahlian || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    Rp {Number(item.upah_per_pcs || 0).toLocaleString('id-ID')}
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'kasir' && (
                                            <td>
                                                <span className="badge badge-selesai">
                                                    Shift {item.shift}
                                                </span>
                                            </td>
                                        )}
                                        {activeTab === 'staff' && (
                                            <td>{item.alamat || '-'}</td>
                                        )}
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-icon-btn edit"
                                                onClick={() => handleEdit(item)}
                                                title="Edit"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="admin-icon-btn delete"
                                                onClick={() => handleHapus(item)}
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

            {/* MODAL */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>
                                {editId ? 'Edit' : 'Tambah'} {TABS.find(t => t.key === activeTab)?.label}
                            </h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            {/* PERAJIN */}
                            {activeTab === 'perajin' && (
                                <>
                                    <div className="admin-form-group">
                                        <label>Nama Perajin *</label>
                                        <input
                                            type="text"
                                            value={form.nama_perajin || ''}
                                            onChange={(e) => setForm({ ...form, nama_perajin: e.target.value })}
                                            placeholder="Contoh: Bu Sri"
                                            required
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>No. HP</label>
                                        <input
                                            type="text"
                                            value={form.no_hp || ''}
                                            onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Keahlian</label>
                                        <input
                                            type="text"
                                            value={form.keahlian || ''}
                                            onChange={(e) => setForm({ ...form, keahlian: e.target.value })}
                                            placeholder="Contoh: Sweater & Baju Rajut"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Upah Per Pcs (Rp)</label>
                                        <input
                                            type="number"
                                            value={form.upah_per_pcs || 0}
                                            onChange={(e) => setForm({ ...form, upah_per_pcs: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Alamat</label>
                                        <textarea
                                            rows="2"
                                            value={form.alamat || ''}
                                            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                                            placeholder="Alamat perajin..."
                                        />
                                    </div>
                                </>
                            )}

                            {/* KASIR */}
                            {activeTab === 'kasir' && (
                                <>
                                    <div className="admin-form-group">
                                        <label>Nama Kasir *</label>
                                        <input
                                            type="text"
                                            value={form.nama || ''}
                                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                            placeholder="Contoh: Mbak Ayu"
                                            required
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>No. HP</label>
                                        <input
                                            type="text"
                                            value={form.no_hp || ''}
                                            onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Shift</label>
                                        <select
                                            value={form.shift || 'pagi'}
                                            onChange={(e) => setForm({ ...form, shift: e.target.value })}
                                        >
                                            <option value="pagi">Pagi</option>
                                            <option value="siang">Siang</option>
                                            <option value="malam">Malam</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* STAFF GUDANG */}
                            {activeTab === 'staff' && (
                                <>
                                    <div className="admin-form-group">
                                        <label>Nama Staff *</label>
                                        <input
                                            type="text"
                                            value={form.nama || ''}
                                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                            placeholder="Contoh: Pak Joko"
                                            required
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>No. HP</label>
                                        <input
                                            type="text"
                                            value={form.no_hp || ''}
                                            onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                            placeholder="Contoh: 08123456789"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Alamat</label>
                                        <textarea
                                            rows="2"
                                            value={form.alamat || ''}
                                            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                                            placeholder="Alamat staff..."
                                        />
                                    </div>
                                </>
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

export default AdminPegawai;