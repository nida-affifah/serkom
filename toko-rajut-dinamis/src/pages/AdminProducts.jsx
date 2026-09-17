// src/pages/AdminProducts.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiX,
    FiInfo, FiAlertTriangle, FiPackage, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { produkAPI, kategoriAPI, bahanAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminProducts.css';

const FORM_KOSONG = {
    nama_produk: '',
    kategori_id: '',
    margin: 30,
    stok_minimal: 5,
    deskripsi: '',
    jumlah_produksi: 1,
    resep: [{ bahan_id: '', jumlah: 1 }]
};

const AdminProducts = () => {
    const { isAdmin } = useAuth();
    const [produk, setProduk] = useState([]);
    const [kategori, setKategori] = useState([]);
    const [bahan, setBahan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(FORM_KOSONG);
    const [submitting, setSubmitting] = useState(false);

    // Modal produksi ulang
    const [produksiOpen, setProduksiOpen] = useState(false);
    const [produksiProduk, setProduksiProduk] = useState(null);
    const [jumlahProduksi, setJumlahProduksi] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resProduk, resKategori, resBahan] = await Promise.all([
                produkAPI.getAll(),
                kategoriAPI.getAll(),
                bahanAPI.getAll()
            ]);
            setProduk(resProduk.data.data || []);
            setKategori(resKategori.data.data || []);
            setBahan(resBahan.data.data || []);
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

    const isDraft = (p) => !p.harga_jual || p.harga_jual === 0 || !p.stok || p.stok === 0;

    // ═══════════════════════════════════════
    // HITUNG KEBUTUHAN BAHAN (real-time)
    // Return array: [{ bahan, butuh, stok, cukup }]
    // ═══════════════════════════════════════
    const kebutuhanBahan = useMemo(() => {
        return form.resep.map(r => {
            const b = bahan.find(x => x.id === parseInt(r.bahan_id));
            if (!b) return null;

            const jumlahPerUnit = Number(r.jumlah) || 0;
            const jumlahProduksi = Number(form.jumlah_produksi) || 0;
            const butuh = jumlahPerUnit * jumlahProduksi;
            const stok = Number(b.stok) || 0;

            return {
                bahan_id: b.id,
                nama_bahan: b.nama_bahan,
                satuan: b.satuan,
                jumlah_per_unit: jumlahPerUnit,
                butuh,
                stok,
                cukup: butuh <= stok
            };
        }).filter(Boolean);
    }, [form.resep, form.jumlah_produksi, bahan]);

    // Cek apakah semua bahan cukup
    const semuaBahanCukup = kebutuhanBahan.every(k => k.cukup);
    const adaBahanKurang = kebutuhanBahan.some(k => !k.cukup);

    const handleTambah = () => {
        setEditId(null);
        setForm({ ...FORM_KOSONG, resep: [{ bahan_id: '', jumlah: 1 }] });
        setModalOpen(true);
    };

    const handleEdit = async (p) => {
        try {
            const res = await produkAPI.getById(p.id);
            const detail = res.data.data;
            setEditId(p.id);
            setForm({
                nama_produk: detail.nama_produk || '',
                kategori_id: detail.kategori_id || '',
                margin: detail.margin || 30,
                stok_minimal: detail.stok_minimal || 5,
                deskripsi: detail.deskripsi || '',
                jumlah_produksi: 1,
                resep: detail.resep && detail.resep.length > 0
                    ? detail.resep.map(r => ({ bahan_id: r.bahan_id, jumlah: r.jumlah }))
                    : [{ bahan_id: '', jumlah: 1 }]
            });
            setModalOpen(true);
        } catch (err) {
            alert('Gagal buka produk: ' + err.message);
        }
    };

    const handleHapus = async (p) => {
        if (!window.confirm(`Hapus produk "${p.nama_produk}"?`)) return;
        try {
            await produkAPI.delete(p.id);
            alert('Produk dihapus');
            fetchData();
        } catch (err) {
            alert('Gagal hapus: ' + err.message);
        }
    };

    // ═══ RESEP HANDLERS ═══
    const handleTambahResep = () => {
        setForm({ ...form, resep: [...form.resep, { bahan_id: '', jumlah: 1 }] });
    };

    const handleHapusResep = (idx) => {
        if (form.resep.length === 1) {
            alert('Minimal 1 bahan');
            return;
        }
        setForm({ ...form, resep: form.resep.filter((_, i) => i !== idx) });
    };

    const handleUbahResep = (idx, field, value) => {
        const resepBaru = [...form.resep];
        resepBaru[idx][field] = value;
        setForm({ ...form, resep: resepBaru });
    };

    const hitungTotalBahan = () => {
        return form.resep.reduce((sum, r) => {
            const b = bahan.find(x => x.id === parseInt(r.bahan_id));
            if (!b) return sum;
            return sum + (Number(b.harga_beli) || 0) * (Number(r.jumlah) || 0);
        }, 0);
    };

    const totalHargaBahan = hitungTotalBahan();
    const hargaJualPreview = Math.round(totalHargaBahan * (1 + (Number(form.margin) || 0) / 100));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.nama_produk) {
            alert('Nama produk wajib diisi');
            return;
        }
        if (!form.margin || form.margin < 0) {
            alert('Margin wajib diisi');
            return;
        }
        if (form.resep.some(r => !r.bahan_id || !r.jumlah || r.jumlah < 1)) {
            alert('Lengkapi semua bahan di resep');
            return;
        }

        // ═══ VALIDASI STOK BAHAN ═══
        if (adaBahanKurang) {
            const yangKurang = kebutuhanBahan
                .filter(k => !k.cukup)
                .map(k => `- ${k.nama_bahan}: butuh ${k.butuh} ${k.satuan}, stok ${k.stok}`)
                .join('\n');
            alert(`Stok bahan tidak cukup:\n\n${yangKurang}\n\nSilakan kurangi jumlah produksi atau tambah stok bahan dulu.`);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                nama_produk: form.nama_produk,
                kategori_id: form.kategori_id,
                margin: Number(form.margin),
                stok_minimal: Number(form.stok_minimal),
                deskripsi: form.deskripsi,
                jumlah_produksi: Number(form.jumlah_produksi),
                resep: form.resep.map(r => ({
                    bahan_id: Number(r.bahan_id),
                    jumlah: Number(r.jumlah)
                }))
            };

            if (editId) {
                await produkAPI.update(editId, payload);
                alert('Produk diupdate');
            } else {
                await produkAPI.create(payload);
                alert('Produk dibuat & stok bahan sudah dipotong');
            }
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ═══ PRODUKSI ULANG ═══
    const handleBukaProduksi = (p) => {
        setProduksiProduk(p);
        setJumlahProduksi(1);
        setProduksiOpen(true);
    };

    // Hitung kebutuhan bahan untuk produksi ulang
    const kebutuhanProduksiUlang = useMemo(() => {
        if (!produksiProduk || !produksiProduk.resep) return [];
        return produksiProduk.resep.map(r => {
            const b = bahan.find(x => x.id === parseInt(r.bahan_id));
            if (!b) return null;
            const butuh = Number(r.jumlah) * Number(jumlahProduksi);
            const stok = Number(b.stok) || 0;
            return {
                bahan_id: b.id,
                nama_bahan: b.nama_bahan,
                satuan: b.satuan,
                butuh,
                stok,
                cukup: butuh <= stok
            };
        }).filter(Boolean);
    }, [produksiProduk, jumlahProduksi, bahan]);

    const semuaProduksiCukup = kebutuhanProduksiUlang.every(k => k.cukup);

    const handleProduksiUlang = async (e) => {
        e.preventDefault();
        if (!jumlahProduksi || jumlahProduksi < 1) {
            alert('Jumlah minimal 1');
            return;
        }
        if (!semuaProduksiCukup) {
            const yangKurang = kebutuhanProduksiUlang
                .filter(k => !k.cukup)
                .map(k => `- ${k.nama_bahan}: butuh ${k.butuh} ${k.satuan}, stok ${k.stok}`)
                .join('\n');
            alert(`Stok bahan tidak cukup:\n\n${yangKurang}`);
            return;
        }
        try {
            await produkAPI.produksiUlang(produksiProduk.id, {
                jumlah: Number(jumlahProduksi)
            });
            alert(`Produksi ${jumlahProduksi} unit berhasil`);
            setProduksiOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal produksi: ' + err.message);
        }
    };

    const produkFiltered = produk.filter(p =>
        !search ||
        (p.nama_produk && p.nama_produk.toLowerCase().includes(search.toLowerCase())) ||
        (p.kode_produk && p.kode_produk.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat produk...</div>
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
                            <h1 className="admin-title">Kelola Produk</h1>
                            <p className="admin-subtitle">
                                Produk jadi & resep bahan (internal)
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Tambah Produk
                            </button>
                        </div>
                    </div>
                </div>

                {/* INFO BOX */}
                <div className="admin-info-box">
                    <FiInfo />
                    <span>
                        <strong>Info:</strong> Saat tambah produk, Anda pilih <strong>bahan</strong> yang dipakai.
                        Stok bahan akan <strong>otomatis berkurang</strong>.
                        Resep hanya terlihat oleh admin & staff.
                    </span>
                </div>

                {/* SEARCH */}
                <div className="admin-search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Cari produk (nama / kode)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* TABEL */}
                <div className="admin-card">
                    {produkFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada produk.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Nama Produk</th>
                                    <th>Kategori</th>
                                    <th>Harga Beli</th>
                                    <th>Margin</th>
                                    <th>Harga Jual</th>
                                    <th>Stok</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {produkFiltered.map(p => {
                                    const draft = isDraft(p);
                                    return (
                                        <tr key={p.id}>
                                            <td><strong>{p.kode_produk || '-'}</strong></td>
                                            <td>
                                                {p.nama_produk}
                                                {draft && <span className="badge-draft">Draft</span>}
                                            </td>
                                            <td>{p.nama_kategori || '-'}</td>
                                            <td>
                                                {p.harga_beli > 0
                                                    ? formatPrice(p.harga_beli)
                                                    : <span className="text-muted">-</span>
                                                }
                                            </td>
                                            <td>{p.margin || 0}%</td>
                                            <td>
                                                {p.harga_jual > 0
                                                    ? formatPrice(p.harga_jual)
                                                    : <span className="text-muted">-</span>
                                                }
                                            </td>
                                            <td>
                                                {p.stok <= p.stok_minimal && p.stok > 0 ? (
                                                    <span className="badge badge-batal">{p.stok} (kritis)</span>
                                                ) : p.stok === 0 ? (
                                                    <span className="text-muted">0</span>
                                                ) : (
                                                    <span>{p.stok}</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="admin-icon-btn success"
                                                    onClick={() => handleBukaProduksi(p)}
                                                    title="Produksi Ulang"
                                                >
                                                    <FiPackage />
                                                </button>
                                                <button
                                                    className="admin-icon-btn edit"
                                                    onClick={() => handleEdit(p)}
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        className="admin-icon-btn delete"
                                                        onClick={() => handleHapus(p)}
                                                        title="Hapus"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL FORM PRODUK */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>{editId ? 'Edit Produk' : 'Tambah Produk'}</h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Nama Produk *</label>
                                <input
                                    type="text"
                                    value={form.nama_produk}
                                    onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                                    placeholder="Contoh: Sweater Rajut Cozy"
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
                                    <label>Margin (%) *</label>
                                    <input
                                        type="number"
                                        value={form.margin}
                                        onChange={(e) => setForm({ ...form, margin: e.target.value })}
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="admin-form-group">
                                    <label>Stok Minimal</label>
                                    <input
                                        type="number"
                                        value={form.stok_minimal}
                                        onChange={(e) => setForm({ ...form, stok_minimal: e.target.value })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* RESEP */}
                            <div className="admin-form-group">
                                <label>Bahan yang Dipakai (Resep) *</label>
                                <div className="items-list">
                                    {form.resep.map((r, idx) => {
                                        const bahanDipilih = bahan.find(b => b.id === parseInt(r.bahan_id));
                                        const butuh = Number(r.jumlah || 0) * Number(form.jumlah_produksi || 0);
                                        const cukup = bahanDipilih ? butuh <= Number(bahanDipilih.stok) : true;

                                        return (
                                            <div key={idx} className="item-card">
                                                <div className="item-card-header">
                                                    <strong>Bahan #{idx + 1}</strong>
                                                    {form.resep.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="admin-icon-btn delete"
                                                            onClick={() => handleHapusResep(idx)}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="item-field-row">
                                                    <div className="item-field">
                                                        <label className="item-label">Bahan *</label>
                                                        <select
                                                            value={r.bahan_id}
                                                            onChange={(e) => handleUbahResep(idx, 'bahan_id', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">- Pilih Bahan -</option>
                                                            {bahan.map(b => (
                                                                <option key={b.id} value={b.id}>
                                                                    {b.nama_bahan} (stok: {b.stok} {b.satuan})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="item-field">
                                                        <label className="item-label">Jumlah per Unit *</label>
                                                        <input
                                                            type="number"
                                                            value={r.jumlah}
                                                            onChange={(e) => handleUbahResep(idx, 'jumlah', e.target.value)}
                                                            min="0.01"
                                                            step="0.01"
                                                            required
                                                        />
                                                        {bahanDipilih && (
                                                            <small className="item-hint">
                                                                Satuan: {bahanDipilih.satuan}
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* STATUS STOK PER BAHAN */}
                                                {bahanDipilih && butuh > 0 && (
                                                    <div className={`stok-status ${cukup ? 'cukup' : 'kurang'}`}>
                                                        {cukup ? <FiCheckCircle /> : <FiXCircle />}
                                                        <span>
                                                            Butuh: <strong>{butuh} {bahanDipilih.satuan}</strong>
                                                            {' '}| Stok: <strong>{bahanDipilih.stok} {bahanDipilih.satuan}</strong>
                                                            {!cukup && ' — TIDAK CUKUP!'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    className="btn-tambah-item"
                                    onClick={handleTambahResep}
                                >
                                    <FiPlus /> Tambah Bahan
                                </button>
                            </div>

                            {/* JUMLAH PRODUKSI */}
                            <div className="admin-form-group">
                                <label>Jumlah Produksi (stok yang dihasilkan) *</label>
                                <input
                                    type="number"
                                    value={form.jumlah_produksi}
                                    onChange={(e) => setForm({ ...form, jumlah_produksi: e.target.value })}
                                    min="1"
                                    required
                                />
                                <small className="form-hint">
                                    Berapa unit produk yang dihasilkan
                                </small>
                            </div>

                            {/* PREVIEW HARGA */}
                            {totalHargaBahan > 0 && (
                                <div className="admin-info-box" style={{ marginBottom: 16 }}>
                                    <FiInfo />
                                    <span>
                                        <strong>Preview:</strong><br />
                                        Harga beli per unit: <strong>{formatPrice(totalHargaBahan)}</strong><br />
                                        Harga jual ({form.margin}%): <strong>{formatPrice(hargaJualPreview)}</strong><br />
                                        Total bahan terpakai: <strong>{form.jumlah_produksi} unit × resep</strong>
                                    </span>
                                </div>
                            )}

                            {/* WARNING STOK KURANG */}
                            {adaBahanKurang && (
                                <div className="admin-info-box warning" style={{ marginBottom: 16 }}>
                                    <FiAlertTriangle />
                                    <span>
                                        <strong>Stok bahan tidak cukup!</strong> Kurangi jumlah produksi atau
                                        tambah stok bahan dulu. Tombol simpan dinonaktifkan.
                                    </span>
                                </div>
                            )}

                            <div className="admin-form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    rows="3"
                                    value={form.deskripsi}
                                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                    placeholder="Deskripsi produk..."
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
                                    disabled={submitting || adaBahanKurang}
                                    title={adaBahanKurang ? 'Stok bahan tidak cukup' : ''}
                                >
                                    {submitting ? 'Menyimpan...' : (editId ? 'Update' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PRODUKSI ULANG */}
            {produksiOpen && produksiProduk && (
                <div className="admin-modal-overlay" onClick={() => setProduksiOpen(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Produksi Ulang: {produksiProduk.nama_produk}</h2>
                            <button className="admin-modal-close" onClick={() => setProduksiOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleProduksiUlang} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Jumlah Produksi *</label>
                                <input
                                    type="number"
                                    value={jumlahProduksi}
                                    onChange={(e) => setJumlahProduksi(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>

                            {/* KEBUTUHAN BAHAN */}
                            {kebutuhanProduksiUlang.length > 0 && (
                                <div className="admin-form-group">
                                    <label>Kebutuhan Bahan:</label>
                                    <div className="kebutuhan-list">
                                        {kebutuhanProduksiUlang.map((k, i) => (
                                            <div key={i} className={`kebutuhan-item ${k.cukup ? 'cukup' : 'kurang'}`}>
                                                {k.cukup ? <FiCheckCircle /> : <FiXCircle />}
                                                <span>
                                                    <strong>{k.nama_bahan}</strong>: butuh{' '}
                                                    <strong>{k.butuh} {k.satuan}</strong>, stok{' '}
                                                    <strong>{k.stok} {k.satuan}</strong>
                                                    {!k.cukup && ' — TIDAK CUKUP!'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!semuaProduksiCukup && (
                                <div className="admin-info-box warning">
                                    <FiAlertTriangle />
                                    <span>
                                        Stok bahan tidak cukup. Kurangi jumlah produksi
                                        atau tambah stok bahan dulu.
                                    </span>
                                </div>
                            )}

                            <div className="admin-modal-actions">
                                <button
                                    type="button"
                                    className="admin-btn-cancel"
                                    onClick={() => setProduksiOpen(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn-primary"
                                    disabled={!semuaProduksiCukup}
                                    title={!semuaProduksiCukup ? 'Stok bahan tidak cukup' : ''}
                                >
                                    Produksi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;