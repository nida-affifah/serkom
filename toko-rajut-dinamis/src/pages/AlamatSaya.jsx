// src/pages/AlamatSaya.jsx
import React, { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX,
    FiMapPin, FiCheckCircle, FiHome
} from 'react-icons/fi';
import { alamatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AlamatSaya.css';

const FORM_KOSONG = {
    label: 'Rumah',
    nama_penerima: '',
    no_hp: '',
    alamat_lengkap: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kode_pos: '',
    is_default: false
};

const AlamatSaya = () => {
    const { isAuthenticated, user } = useAuth();
    const [alamat, setAlamat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(FORM_KOSONG);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) fetchData();
        else setLoading(false);
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await alamatAPI.getAll();
            setAlamat(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat alamat: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTambah = () => {
        setEditId(null);
        setForm({
            ...FORM_KOSONG,
            nama_penerima: user?.nama_lengkap || '',
            no_hp: user?.no_hp || ''
        });
        setModalOpen(true);
    };

    const handleEdit = (a) => {
        setEditId(a.id);
        setForm({
            label: a.label || 'Rumah',
            nama_penerima: a.nama_penerima || '',
            no_hp: a.no_hp || '',
            alamat_lengkap: a.alamat_lengkap || '',
            provinsi: a.provinsi || '',
            kota: a.kota || '',
            kecamatan: a.kecamatan || '',
            kode_pos: a.kode_pos || '',
            is_default: a.is_default || false
        });
        setModalOpen(true);
    };

    const handleHapus = async (a) => {
        if (!window.confirm(`Hapus alamat "${a.label}"?`)) return;
        try {
            await alamatAPI.delete(a.id);
            alert('Alamat dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    const handleSetDefault = async (a) => {
        try {
            await alamatAPI.setDefault(a.id);
            alert('Alamat dijadikan default');
            fetchData();
        } catch (err) {
            alert('Gagal: ' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nama_penerima || !form.no_hp || !form.alamat_lengkap ||
            !form.provinsi || !form.kota || !form.kecamatan || !form.kode_pos) {
            alert('Semua field wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            if (editId) {
                await alamatAPI.update(editId, form);
                alert('Alamat diupdate');
            } else {
                await alamatAPI.create(form);
                alert('Alamat ditambahkan');
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="alamat-page">
                <div className="alamat-container">
                    <div className="alamat-empty">
                        <FiMapPin size={64} style={{ color: '#ccc' }} />
                        <h2>Silakan login dulu</h2>
                        <p>Anda perlu login untuk melihat alamat.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="alamat-page">
                <div className="alamat-container">
                    <div className="alamat-loading">Memuat alamat...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="alamat-page">
            <div className="alamat-container">
                {/* HEADER */}
                <div className="alamat-header">
                    <div className="alamat-badge">Alamat Saya</div>
                    <div className="alamat-header-row">
                        <div>
                            <h1 className="alamat-title">Daftar Alamat Pengiriman</h1>
                            <p className="alamat-subtitle">Kelola alamat untuk pengiriman pesanan</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="alamat-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="alamat-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah Alamat
                            </button>
                        </div>
                    </div>
                </div>

                {/* LIST ALAMAT */}
                {alamat.length === 0 ? (
                    <div className="alamat-empty">
                        <FiMapPin size={64} style={{ color: '#ccc' }} />
                        <h2>Belum ada alamat</h2>
                        <p>Tambahkan alamat pengiriman pertama Anda</p>
                        <button className="alamat-btn-primary" onClick={handleTambah}>
                            <FiPlus /> Tambah Alamat
                        </button>
                    </div>
                ) : (
                    <div className="alamat-grid">
                        {alamat.map(a => (
                            <div key={a.id} className={`alamat-card ${a.is_default ? 'default' : ''}`}>
                                {a.is_default && (
                                    <div className="alamat-default-badge">
                                        <FiCheckCircle /> Default
                                    </div>
                                )}

                                <div className="alamat-label">
                                    <FiHome /> {a.label}
                                </div>

                                <div className="alamat-info">
                                    <p className="alamat-nama"><strong>{a.nama_penerima}</strong></p>
                                    <p className="alamat-hp">{a.no_hp}</p>
                                    <p className="alamat-lengkap">{a.alamat_lengkap}</p>
                                    <p className="alamat-wilayah">
                                        {a.kecamatan}, {a.kota}, {a.provinsi} {a.kode_pos}
                                    </p>
                                </div>

                                <div className="alamat-actions">
                                    {!a.is_default && (
                                        <button
                                            className="alamat-btn-default"
                                            onClick={() => handleSetDefault(a)}
                                            title="Jadikan default"
                                        >
                                            <FiCheckCircle /> Set Default
                                        </button>
                                    )}
                                    <button
                                        className="alamat-btn-edit"
                                        onClick={() => handleEdit(a)}
                                    >
                                        <FiEdit2 /> Edit
                                    </button>
                                    <button
                                        className="alamat-btn-delete"
                                        onClick={() => handleHapus(a)}
                                    >
                                        <FiTrash2 /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {modalOpen && (
                <div className="alamat-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="alamat-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="alamat-modal-header">
                            <h2>{editId ? 'Edit Alamat' : 'Tambah Alamat'}</h2>
                            <button className="alamat-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="alamat-modal-body">
                            <div className="alamat-form-group">
                                <label>Label Alamat *</label>
                                <select
                                    value={form.label}
                                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                                >
                                    <option value="Rumah">Rumah</option>
                                    <option value="Kantor">Kantor</option>
                                    <option value="Kos">Kos</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div className="alamat-form-row">
                                <div className="alamat-form-group">
                                    <label>Nama Penerima *</label>
                                    <input
                                        type="text"
                                        value={form.nama_penerima}
                                        onChange={(e) => setForm({ ...form, nama_penerima: e.target.value })}
                                        placeholder="Nama penerima"
                                        required
                                    />
                                </div>
                                <div className="alamat-form-group">
                                    <label>No. HP *</label>
                                    <input
                                        type="text"
                                        value={form.no_hp}
                                        onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                                        placeholder="08123456789"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="alamat-form-group">
                                <label>Alamat Lengkap *</label>
                                <textarea
                                    rows="2"
                                    value={form.alamat_lengkap}
                                    onChange={(e) => setForm({ ...form, alamat_lengkap: e.target.value })}
                                    placeholder="Jalan, nomor, RT/RW, patokan..."
                                    required
                                />
                            </div>

                            <div className="alamat-form-row">
                                <div className="alamat-form-group">
                                    <label>Provinsi *</label>
                                    <input
                                        type="text"
                                        value={form.provinsi}
                                        onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
                                        placeholder="Jawa Timur"
                                        required
                                    />
                                </div>
                                <div className="alamat-form-group">
                                    <label>Kota *</label>
                                    <input
                                        type="text"
                                        value={form.kota}
                                        onChange={(e) => setForm({ ...form, kota: e.target.value })}
                                        placeholder="Surabaya"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="alamat-form-row">
                                <div className="alamat-form-group">
                                    <label>Kecamatan *</label>
                                    <input
                                        type="text"
                                        value={form.kecamatan}
                                        onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                                        placeholder="Gubeng"
                                        required
                                    />
                                </div>
                                <div className="alamat-form-group">
                                    <label>Kode Pos *</label>
                                    <input
                                        type="text"
                                        value={form.kode_pos}
                                        onChange={(e) => setForm({ ...form, kode_pos: e.target.value })}
                                        placeholder="60281"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="alamat-form-group">
                                <label className="alamat-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={form.is_default}
                                        onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                                    />
                                    Jadikan alamat default
                                </label>
                            </div>

                            <div className="alamat-modal-actions">
                                <button
                                    type="button"
                                    className="alamat-btn-cancel"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="alamat-btn-primary"
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

export default AlamatSaya;