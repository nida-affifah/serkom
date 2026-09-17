// src/pages/AdminPembelian.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    FiPlus, FiEye, FiX, FiRefreshCw, FiPackage,
    FiCheckCircle, FiTrash2, FiTruck
} from 'react-icons/fi';
import { pembelianAPI, supplierAPI, bahanAPI, kategoriAPI } from '../services/api';
import './AdminPembelian.css';

const FORM_KOSONG = {
    supplier_id: '',
    catatan: ''
};

const ITEM_KOSONG = {
    nama_bahan: '',
    kategori_id: '',
    satuan: 'pcs',
    jumlah: 1,
    harga_beli: 0
};

const AdminPembelian = () => {
    const [pembelian, setPembelian] = useState([]);
    const [supplier, setSupplier] = useState([]);
    const [bahan, setBahan] = useState([]);
    const [kategori, setKategori] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(FORM_KOSONG);
    const [items, setItems] = useState([{ ...ITEM_KOSONG }]);
    const [submitting, setSubmitting] = useState(false);

    const [detailOpen, setDetailOpen] = useState(false);
    const [pembelianDetail, setPembelianDetail] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resPembelian, resSupplier, resBahan, resKategori] = await Promise.all([
                pembelianAPI.getAll(),
                supplierAPI.getAll(),
                bahanAPI.getAll(),
                kategoriAPI.getAll()
            ]);
            setPembelian(resPembelian.data.data || []);
            setSupplier(resSupplier.data.data || []);
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

    const formatTanggal = (tgl) => {
        if (!tgl) return '-';
        return new Date(tgl).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Daftar nama bahan yang sudah ada (untuk datalist autocomplete)
    const daftarNamaBahan = useMemo(() => {
        return bahan.map(b => b.nama_bahan);
    }, [bahan]);

    const handleTambah = () => {
        setForm(FORM_KOSONG);
        setItems([{ ...ITEM_KOSONG }]);
        setModalOpen(true);
    };

    const handleTambahItem = () => {
        setItems([...items, { ...ITEM_KOSONG }]);
    };

    const handleHapusItem = (idx) => {
        if (items.length === 1) {
            alert('Minimal 1 item');
            return;
        }
        setItems(items.filter((_, i) => i !== idx));
    };

    const handleUbahItem = (idx, field, value) => {
        const itemsBaru = [...items];
        itemsBaru[idx][field] = value;

        // Kalau nama_bahan cocok dengan bahan yang ada, auto-isi harga_beli
        if (field === 'nama_bahan' && value) {
            const existing = bahan.find(
                b => b.nama_bahan.toLowerCase() === value.toLowerCase().trim()
            );
            if (existing) {
                itemsBaru[idx].harga_beli = existing.harga_beli || 0;
                itemsBaru[idx].satuan = existing.satuan || 'pcs';
                itemsBaru[idx].kategori_id = existing.kategori_id || '';
            }
        }

        setItems(itemsBaru);
    };

    const totalPO = items.reduce(
        (sum, item) => sum + (Number(item.harga_beli) * Number(item.jumlah)),
        0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.supplier_id) {
            alert('Pilih supplier dulu');
            return;
        }
        if (items.some(i => !i.nama_bahan || !i.nama_bahan.trim())) {
            alert('Lengkapi nama bahan untuk semua item');
            return;
        }
        if (items.some(i => !i.jumlah || i.jumlah < 1)) {
            alert('Jumlah minimal 1');
            return;
        }
        if (items.some(i => !i.harga_beli || i.harga_beli < 1)) {
            alert('Harga beli wajib diisi');
            return;
        }

        setSubmitting(true);
        try {
            await pembelianAPI.create({
                supplier_id: form.supplier_id,
                catatan: form.catatan,
                items: items.map(i => ({
                    nama_bahan: i.nama_bahan.trim(),
                    kategori_id: i.kategori_id || null,
                    satuan: i.satuan || 'pcs',
                    jumlah: Number(i.jumlah),
                    harga_beli: Number(i.harga_beli)
                }))
            });
            alert('PO berhasil dibuat');
            setModalOpen(false);
            fetchData();
        } catch (err) {
            alert('Gagal simpan: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTerima = async (p) => {
        if (!window.confirm(`Tandai PO ${p.kode_pembelian} sudah diterima? Stok bahan akan otomatis bertambah.`)) return;
        try {
            await pembelianAPI.terima(p.id);
            alert('Barang diterima, stok bahan sudah bertambah');
            fetchData();
            if (pembelianDetail && pembelianDetail.id === p.id) {
                const res = await pembelianAPI.getById(p.id);
                setPembelianDetail(res.data.data);
            }
        } catch (err) {
            alert('Gagal terima: ' + err.message);
        }
    };

    const handleBukaDetail = async (p) => {
        try {
            const res = await pembelianAPI.getById(p.id);
            setPembelianDetail(res.data.data);
            setDetailOpen(true);
        } catch (err) {
            alert('Gagal buka detail: ' + err.message);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            draft: 'pending',
            dipesan: 'diproses',
            diterima: 'selesai'
        };
        return <span className={`badge badge-${map[status] || 'pending'}`}>{status}</span>;
    };

    const pembelianFiltered = filter === 'semua'
        ? pembelian
        : pembelian.filter(p => p.status === filter);

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat pembelian...</div>
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
                            <h1 className="admin-title">Pembelian Bahan</h1>
                            <p className="admin-subtitle">PO ke supplier dan penerimaan barang</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="admin-refresh" onClick={fetchData}>
                                <FiRefreshCw /> Refresh
                            </button>
                            <button className="admin-btn-primary" onClick={handleTambah}>
                                <FiPlus /> Buat PO
                            </button>
                        </div>
                    </div>
                </div>

                {/* FILTER */}
                <div className="admin-filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'semua' ? 'active' : ''}`}
                        onClick={() => setFilter('semua')}
                    >
                        Semua ({pembelian.length})
                    </button>
                    {['draft', 'dipesan', 'diterima'].map(s => {
                        const jumlah = pembelian.filter(p => p.status === s).length;
                        return (
                            <button
                                key={s}
                                className={`filter-tab ${filter === s ? 'active' : ''}`}
                                onClick={() => setFilter(s)}
                            >
                                {s} ({jumlah})
                            </button>
                        );
                    })}
                </div>

                {/* TABEL */}
                <div className="admin-card">
                    {pembelianFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada PO.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Kode PO</th>
                                    <th>Supplier</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pembelianFiltered.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.kode_pembelian}</strong></td>
                                        <td>{p.nama_supplier || '-'}</td>
                                        <td>{formatPrice(p.total)}</td>
                                        <td>{getStatusBadge(p.status)}</td>
                                        <td>{formatTanggal(p.tanggal)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="admin-icon-btn edit"
                                                onClick={() => handleBukaDetail(p)}
                                                title="Detail"
                                            >
                                                <FiEye />
                                            </button>
                                            {p.status === 'dipesan' && (
                                                <button
                                                    className="admin-icon-btn success"
                                                    onClick={() => handleTerima(p)}
                                                    title="Terima Barang"
                                                >
                                                    <FiCheckCircle />
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

            {/* MODAL BUAT PO */}
            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Buat PO Baru</h2>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-modal-body">
                            <div className="admin-form-group">
                                <label>Supplier *</label>
                                <select
                                    value={form.supplier_id}
                                    onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                                    required
                                >
                                    <option value="">- Pilih Supplier -</option>
                                    {supplier.map(s => (
                                        <option key={s.id} value={s.id}>{s.nama_supplier}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-form-group">
                                <label>Catatan</label>
                                <textarea
                                    rows="2"
                                    value={form.catatan}
                                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                                    placeholder="Catatan PO..."
                                />
                            </div>

                            {/* ITEM PO */}
                            <div className="admin-form-group">
                                <label>Item PO *</label>

                                <div className="items-list">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="item-card">
                                            {/* Header item */}
                                            <div className="item-card-header">
                                                <strong>Item #{idx + 1}</strong>
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="admin-icon-btn delete"
                                                        onClick={() => handleHapusItem(idx)}
                                                        title="Hapus item"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Field: Nama Bahan */}
                                            <div className="item-field">
                                                <label className="item-label">Nama Bahan *</label>
                                                <input
                                                    type="text"
                                                    list={`bahan-list-${idx}`}
                                                    value={item.nama_bahan}
                                                    onChange={(e) => handleUbahItem(idx, 'nama_bahan', e.target.value)}
                                                    placeholder="Ketik nama bahan, misal: Benang Katun Premium"
                                                    required
                                                />
                                                <datalist id={`bahan-list-${idx}`}>
                                                    {daftarNamaBahan.map((nama, i) => (
                                                        <option key={i} value={nama} />
                                                    ))}
                                                </datalist>
                                                <small className="item-hint">
                                                    💡 Kalau bahan belum ada di daftar, otomatis dibuat baru.
                                                </small>
                                            </div>

                                            {/* Field: Kategori & Satuan */}
                                            <div className="item-field-row">
                                                <div className="item-field">
                                                    <label className="item-label">Kategori</label>
                                                    <select
                                                        value={item.kategori_id}
                                                        onChange={(e) => handleUbahItem(idx, 'kategori_id', e.target.value)}
                                                    >
                                                        <option value="">- Pilih Kategori -</option>
                                                        {kategori.map(k => (
                                                            <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="item-field">
                                                    <label className="item-label">Satuan</label>
                                                    <select
                                                        value={item.satuan}
                                                        onChange={(e) => handleUbahItem(idx, 'satuan', e.target.value)}
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
                                            </div>

                                            {/* Field: Jumlah & Harga */}
                                            <div className="item-field-row">
                                                <div className="item-field">
                                                    <label className="item-label">Jumlah *</label>
                                                    <input
                                                        type="number"
                                                        value={item.jumlah}
                                                        onChange={(e) => handleUbahItem(idx, 'jumlah', e.target.value)}
                                                        min="1"
                                                        required
                                                    />
                                                </div>
                                                <div className="item-field">
                                                    <label className="item-label">Harga Beli Satuan (Rp) *</label>
                                                    <input
                                                        type="number"
                                                        value={item.harga_beli}
                                                        onChange={(e) => handleUbahItem(idx, 'harga_beli', e.target.value)}
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Subtotal preview */}
                                            <div className="item-subtotal">
                                                <span>Subtotal:</span>
                                                <strong>
                                                    {formatPrice(Number(item.harga_beli || 0) * Number(item.jumlah || 0))}
                                                </strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className="btn-tambah-item"
                                    onClick={handleTambahItem}
                                >
                                    <FiPlus /> Tambah Item
                                </button>
                            </div>

                            {/* Total PO */}
                            <div className="po-total">
                                <span>Total PO:</span>
                                <strong>{formatPrice(totalPO)}</strong>
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
                                    {submitting ? 'Menyimpan...' : 'Simpan PO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL */}
            {detailOpen && pembelianDetail && (
                <div className="admin-modal-overlay" onClick={() => setDetailOpen(false)}>
                    <div className="admin-modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Detail PO {pembelianDetail.kode_pembelian}</h2>
                            <button className="admin-modal-close" onClick={() => setDetailOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="detail-section">
                                <h3><FiTruck /> Info PO</h3>
                                <div className="detail-grid">
                                    <div>
                                        <span className="detail-label">Kode PO</span>
                                        <strong>{pembelianDetail.kode_pembelian}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Supplier</span>
                                        <strong>{pembelianDetail.nama_supplier}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Status</span>
                                        {getStatusBadge(pembelianDetail.status)}
                                    </div>
                                    <div>
                                        <span className="detail-label">Tanggal</span>
                                        <strong>{formatTanggal(pembelianDetail.tanggal)}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3><FiPackage /> Item PO</h3>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Bahan</th>
                                            <th>Jumlah</th>
                                            <th>Harga Beli</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(pembelianDetail.detail || []).map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.nama_bahan}</td>
                                                <td>{d.jumlah} {d.satuan || ''}</td>
                                                <td>{formatPrice(d.harga_beli)}</td>
                                                <td>{formatPrice(d.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="po-total">
                                    <span>Total:</span>
                                    <strong>{formatPrice(pembelianDetail.total)}</strong>
                                </div>
                            </div>

                            {pembelianDetail.status === 'dipesan' && (
                                <div className="detail-section">
                                    <h3><FiCheckCircle /> Aksi</h3>
                                    <button
                                        className="admin-btn-success"
                                        onClick={() => handleTerima(pembelianDetail)}
                                    >
                                        <FiCheckCircle /> Terima Barang
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPembelian;