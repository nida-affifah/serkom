// src/pages/PurchaseHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiLock, FiRefreshCw, FiInbox, FiShoppingBag, FiEye,
    FiX, FiPackage, FiMapPin, FiCreditCard, FiTruck,
    FiStar, FiCornerUpLeft, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
    pesananAPI, pembayaranAPI, pengirimanAPI,
    returAPI, ulasanAPI, masterAPI
} from '../services/api';
import './PurchaseHistoryPage.css';

const STATUS_MAP = {
    pending:  { label: 'Menunggu Bayar', color: 'pending' },
    diproses: { label: 'Diproses', color: 'diproses' },
    dikirim:  { label: 'Dikirim', color: 'dikirim' },
    selesai:  { label: 'Selesai', color: 'selesai' },
    batal:    { label: 'Dibatalkan', color: 'batal' }
};

const PurchaseHistoryPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin, user } = useAuth();

    const [pesanan, setPesanan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('semua');

    const [detailOpen, setDetailOpen] = useState(false);
    const [detail, setDetail] = useState(null);
    const [pembayaran, setPembayaran] = useState(null);
    const [pengiriman, setPengiriman] = useState(null);
    const [metodeBayar, setMetodeBayar] = useState([]);
    const [alasanRetur, setAlasanRetur] = useState([]);

    const [modalBayar, setModalBayar] = useState(false);
    const [formBayar, setFormBayar] = useState({ metode_id: '', jumlah_bayar: 0, bukti_transfer: '' });

    const [modalRetur, setModalRetur] = useState(false);
    const [formRetur, setFormRetur] = useState({ alasan_id: '', jenis: 'refund', catatan: '', items: [] });

    const [modalUlasan, setModalUlasan] = useState(false);
    const [formUlasan, setFormUlasan] = useState({ produk_id: '', rating: 5, komentar: '' });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated && !isAdmin) {
            fetchPesanan();
            fetchMaster();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, isAdmin]);

    const fetchPesanan = async () => {
        setLoading(true);
        try {
            const res = await pesananAPI.getSaya();
            setPesanan(res.data.data || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Gagal memuat riwayat pesanan');
        } finally {
            setLoading(false);
        }
    };

    const fetchMaster = async () => {
        try {
            const [resMetode, resAlasan] = await Promise.all([
                masterAPI.metodeBayar(),
                masterAPI.alasanRetur()
            ]);
            setMetodeBayar(resMetode.data.data || []);
            setAlasanRetur(resAlasan.data.data || []);
        } catch (err) {
            console.error('Gagal load master:', err);
        }
    };

    const handleBukaDetail = async (p) => {
        try {
            const res = await pesananAPI.getById(p.id);
            setDetail(res.data.data);

            // Ambil pembayaran
            try {
                const rBayar = await pembayaranAPI.getByPesanan(p.id);
                setPembayaran(rBayar.data.data);
            } catch { setPembayaran(null); }

            // Ambil pengiriman
            try {
                const rKirim = await pengirimanAPI.getByPesanan(p.id);
                setPengiriman(rKirim.data.data);
            } catch { setPengiriman(null); }

            setDetailOpen(true);
        } catch (err) {
            alert('Gagal membuka detail: ' + err.message);
        }
    };

    const handleBukaBayar = () => {
        setFormBayar({
            metode_id: metodeBayar[0]?.id || '',
            jumlah_bayar: detail.total,
            bukti_transfer: ''
        });
        setModalBayar(true);
    };

    const handleSubmitBayar = async (e) => {
        e.preventDefault();
        if (!formBayar.metode_id) {
            alert('Pilih metode bayar');
            return;
        }
        setSubmitting(true);
        try {
            await pembayaranAPI.create({
                pesanan_id: detail.id,
                metode_id: formBayar.metode_id,
                jumlah_bayar: formBayar.jumlah_bayar,
                bukti_transfer: formBayar.bukti_transfer
            });
            alert('Pembayaran dikirim, menunggu verifikasi admin');
            setModalBayar(false);
            await fetchPesanan();
            const rBayar = await pembayaranAPI.getByPesanan(detail.id);
            setPembayaran(rBayar.data.data);
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBukaRetur = () => {
        setFormRetur({
            alasan_id: alasanRetur[0]?.id || '',
            jenis: 'refund',
            catatan: '',
            items: (detail.detail || []).map(d => ({
                produk_id: d.produk_id,
                nama_produk: d.nama_produk,
                jumlah: d.jumlah,
                subtotal: d.subtotal,
                kondisi: 'rusak'
            }))
        });
        setModalRetur(true);
    };

    const handleSubmitRetur = async (e) => {
        e.preventDefault();
        if (!formRetur.alasan_id) {
            alert('Pilih alasan retur');
            return;
        }
        setSubmitting(true);
        try {
            await returAPI.create({
                pesanan_id: detail.id,
                alasan_id: formRetur.alasan_id,
                jenis: formRetur.jenis,
                catatan: formRetur.catatan,
                items: formRetur.items.map(i => ({
                    produk_id: i.produk_id,
                    jumlah: i.jumlah,
                    kondisi: i.kondisi,
                    subtotal: i.subtotal
                }))
            });
            alert('Pengajuan retur berhasil dikirim');
            setModalRetur(false);
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBukaUlasan = () => {
        const produkPertama = detail.detail?.[0];
        setFormUlasan({
            produk_id: produkPertama?.produk_id || '',
            rating: 5,
            komentar: ''
        });
        setModalUlasan(true);
    };

    const handleSubmitUlasan = async (e) => {
        e.preventDefault();
        if (!formUlasan.produk_id || !formUlasan.rating) {
            alert('Lengkapi data ulasan');
            return;
        }
        setSubmitting(true);
        try {
            await ulasanAPI.create(formUlasan);
            alert('Ulasan berhasil dikirim');
            setModalUlasan(false);
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
        const s = STATUS_MAP[status] || { label: status, color: 'pending' };
        return <span className={`badge badge-${s.color}`}>{s.label}</span>;
    };

    if (!isAuthenticated) {
        return (
            <div className="history-page">
                <div className="history-container">
                    <div className="history-access-denied">
                        <FiLock size={64} />
                        <h2>Silakan Login</h2>
                        <p>Anda harus login untuk melihat riwayat pesanan.</p>
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Login Sekarang
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return (
            <div className="history-page">
                <div className="history-container">
                    <div className="history-access-denied">
                        <FiAlertCircle size={64} />
                        <h2>Bukan Halaman Admin</h2>
                        <p>Admin gunakan halaman <strong>Kelola Pesanan</strong> di dashboard.</p>
                        <button className="btn-primary" onClick={() => navigate('/admin/pesanan')}>
                            Ke Dashboard Admin
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="history-page">
                <div className="history-container">
                    <div className="history-loading">Memuat riwayat pesanan...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="history-page">
                <div className="history-container">
                    <div className="history-error">
                        <p>{error}</p>
                        <button onClick={fetchPesanan} className="btn-primary">
                            <FiRefreshCw /> Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const pesananFiltered = filter === 'semua'
        ? pesanan
        : pesanan.filter(p => p.status === filter);

    return (
        <div className="history-page">
            <div className="history-container">
                <div className="history-header">
                    <div className="history-badge">Riwayat Pesanan</div>
                    <div className="history-header-row">
                        <div>
                            <h1 className="history-title">Pesanan Saya</h1>
                            <p className="history-subtitle">Daftar semua transaksi pembelian Anda</p>
                        </div>
                        <button className="btn-refresh" onClick={fetchPesanan}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* FILTER */}
                <div className="history-filter">
                    <button
                        className={`filter-btn ${filter === 'semua' ? 'active' : ''}`}
                        onClick={() => setFilter('semua')}
                    >
                        Semua ({pesanan.length})
                    </button>
                    {Object.keys(STATUS_MAP).map(s => {
                        const jml = pesanan.filter(p => p.status === s).length;
                        if (jml === 0) return null;
                        return (
                            <button
                                key={s}
                                className={`filter-btn ${filter === s ? 'active' : ''}`}
                                onClick={() => setFilter(s)}
                            >
                                {STATUS_MAP[s].label} ({jml})
                            </button>
                        );
                    })}
                </div>

                {pesananFiltered.length === 0 ? (
                    <div className="history-empty">
                        <FiInbox size={64} style={{ color: '#ccc' }} />
                        <h2>Belum ada pesanan</h2>
                        <p>Yuk mulai belanja produk rajut favoritmu!</p>
                        <button className="btn-primary" onClick={() => navigate('/products')}>
                            <FiShoppingBag /> Belanja Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="history-list">
                        {pesananFiltered.map(p => (
                            <div key={p.id} className="history-card">
                                <div className="history-card-header">
                                    <div>
                                        <strong className="order-number">{p.kode_pesanan}</strong>
                                        <span className="order-date">{formatTanggal(p.tanggal)}</span>
                                    </div>
                                    {getStatusBadge(p.status)}
                                </div>

                                <div className="history-card-body">
                                    <div className="order-row">
                                        <span>Tipe Pesanan</span>
                                        <strong>{p.tipe_pesanan}</strong>
                                    </div>
                                    <div className="order-row">
                                        <span>Total</span>
                                        <strong className="total-amount">{formatPrice(p.total)}</strong>
                                    </div>
                                </div>

                                <div className="history-card-footer">
                                    <button
                                        className="btn-detail"
                                        onClick={() => handleBukaDetail(p)}
                                    >
                                        <FiEye /> Lihat Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL DETAIL */}
            {detailOpen && detail && (
                <div className="history-modal-overlay" onClick={() => setDetailOpen(false)}>
                    <div className="history-modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="history-modal-header">
                            <h2>Detail Pesanan {detail.kode_pesanan}</h2>
                            <button className="history-modal-close" onClick={() => setDetailOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="history-modal-body">
                            {/* INFO PESANAN */}
                            <div className="detail-section">
                                <h3><FiPackage /> Info Pesanan</h3>
                                <div className="detail-grid">
                                    <div>
                                        <span className="detail-label">Kode</span>
                                        <strong>{detail.kode_pesanan}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Tanggal</span>
                                        <strong>{formatTanggal(detail.tanggal)}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Status</span>
                                        {getStatusBadge(detail.status)}
                                    </div>
                                    <div>
                                        <span className="detail-label">Tipe</span>
                                        <strong>{detail.tipe_pesanan}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* ITEM */}
                            <div className="detail-section">
                                <h3><FiPackage /> Item Pesanan</h3>
                                <table className="detail-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Jumlah</th>
                                            <th>Harga</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(detail.detail || []).map((d, i) => (
                                            <tr key={i}>
                                                <td>{d.nama_produk}</td>
                                                <td>{d.jumlah}</td>
                                                <td>{formatPrice(d.harga_satuan)}</td>
                                                <td>{formatPrice(d.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="detail-total">
                                    <span>Total:</span>
                                    <strong>{formatPrice(detail.total)}</strong>
                                </div>
                            </div>

                            {/* CATATAN */}
                            {detail.catatan && (
                                <div className="detail-section">
                                    <h3><FiMapPin /> Alamat / Catatan</h3>
                                    <p className="detail-catatan">{detail.catatan}</p>
                                </div>
                            )}

                            {/* PEMBAYARAN */}
                            <div className="detail-section">
                                <h3><FiCreditCard /> Pembayaran</h3>
                                {pembayaran ? (
                                    <div className="detail-grid">
                                        <div>
                                            <span className="detail-label">Metode</span>
                                            <strong>{pembayaran.nama_metode || '-'}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Jumlah</span>
                                            <strong>{formatPrice(pembayaran.jumlah_bayar)}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Status</span>
                                            <strong>{pembayaran.status}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Bukti</span>
                                            <strong>{pembayaran.bukti_transfer || '-'}</strong>
                                        </div>
                                    </div>
                                ) : detail.status === 'pending' ? (
                                    <button className="btn-primary" onClick={handleBukaBayar}>
                                        <FiCreditCard /> Bayar Sekarang
                                    </button>
                                ) : (
                                    <p className="admin-empty">Belum ada pembayaran.</p>
                                )}
                            </div>

                            {/* PENGIRIMAN */}
                            <div className="detail-section">
                                <h3><FiTruck /> Pengiriman</h3>
                                {pengiriman ? (
                                    <div className="detail-grid">
                                        <div>
                                            <span className="detail-label">Kurir</span>
                                            <strong>{pengiriman.nama_kurir}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">No. Resi</span>
                                            <strong>{pengiriman.no_resi || '-'}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Status</span>
                                            <strong>{pengiriman.status}</strong>
                                        </div>
                                        <div>
                                            <span className="detail-label">Tanggal Kirim</span>
                                            <strong>{formatTanggal(pengiriman.tanggal_kirim)}</strong>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="admin-empty">Belum dikirim.</p>
                                )}
                            </div>

                            {/* AKSI */}
                            {detail.status === 'selesai' && (
                                <div className="detail-section">
                                    <h3><FiCheckCircle /> Aksi</h3>
                                    <div className="detail-actions">
                                        <button className="btn-primary" onClick={handleBukaRetur}>
                                            <FiCornerUpLeft /> Ajukan Retur
                                        </button>
                                        <button className="btn-secondary" onClick={handleBukaUlasan}>
                                            <FiStar /> Beri Ulasan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL BAYAR */}
            {modalBayar && detail && (
                <div className="history-modal-overlay" onClick={() => setModalBayar(false)}>
                    <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="history-modal-header">
                            <h2>Bayar Pesanan</h2>
                            <button className="history-modal-close" onClick={() => setModalBayar(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitBayar} className="history-modal-body">
                            <div className="form-group">
                                <label>Metode Bayar *</label>
                                <select
                                    value={formBayar.metode_id}
                                    onChange={(e) => setFormBayar({ ...formBayar, metode_id: e.target.value })}
                                    required
                                >
                                    <option value="">- Pilih -</option>
                                    {metodeBayar.map(m => (
                                        <option key={m.id} value={m.id}>{m.nama_metode} ({m.tipe})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Jumlah Bayar *</label>
                                <input
                                    type="number"
                                    value={formBayar.jumlah_bayar}
                                    onChange={(e) => setFormBayar({ ...formBayar, jumlah_bayar: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Bukti Transfer (nama file)</label>
                                <input
                                    type="text"
                                    value={formBayar.bukti_transfer}
                                    onChange={(e) => setFormBayar({ ...formBayar, bukti_transfer: e.target.value })}
                                    placeholder="bukti-transfer.jpg"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setModalBayar(false)}>Batal</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Mengirim...' : 'Kirim Pembayaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL RETUR */}
            {modalRetur && detail && (
                <div className="history-modal-overlay" onClick={() => setModalRetur(false)}>
                    <div className="history-modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="history-modal-header">
                            <h2>Ajukan Retur</h2>
                            <button className="history-modal-close" onClick={() => setModalRetur(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitRetur} className="history-modal-body">
                            <div className="form-group">
                                <label>Alasan Retur *</label>
                                <select
                                    value={formRetur.alasan_id}
                                    onChange={(e) => setFormRetur({ ...formRetur, alasan_id: e.target.value })}
                                    required
                                >
                                    <option value="">- Pilih Alasan -</option>
                                    {alasanRetur.map(a => (
                                        <option key={a.id} value={a.id}>{a.nama_alasan}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Jenis Penyelesaian</label>
                                <select
                                    value={formRetur.jenis}
                                    onChange={(e) => setFormRetur({ ...formRetur, jenis: e.target.value })}
                                >
                                    <option value="refund">Refund (Uang Kembali)</option>
                                    <option value="tukar_barang">Tukar Barang</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Catatan</label>
                                <textarea
                                    rows="2"
                                    value={formRetur.catatan}
                                    onChange={(e) => setFormRetur({ ...formRetur, catatan: e.target.value })}
                                    placeholder="Jelaskan masalahnya..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Item yang Diretur</label>
                                {formRetur.items.map((it, i) => (
                                    <div key={i} className="retur-item-row">
                                        <span>{it.nama_produk} ({it.jumlah}x)</span>
                                        <select
                                            value={it.kondisi}
                                            onChange={(e) => {
                                                const itemsBaru = [...formRetur.items];
                                                itemsBaru[i].kondisi = e.target.value;
                                                setFormRetur({ ...formRetur, items: itemsBaru });
                                            }}
                                        >
                                            <option value="rusak">Rusak</option>
                                            <option value="bagus">Bagus</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setModalRetur(false)}>Batal</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ULASAN */}
            {modalUlasan && detail && (
                <div className="history-modal-overlay" onClick={() => setModalUlasan(false)}>
                    <div className="history-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="history-modal-header">
                            <h2>Beri Ulasan</h2>
                            <button className="history-modal-close" onClick={() => setModalUlasan(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitUlasan} className="history-modal-body">
                            <div className="form-group">
                                <label>Produk</label>
                                <select
                                    value={formUlasan.produk_id}
                                    onChange={(e) => setFormUlasan({ ...formUlasan, produk_id: e.target.value })}
                                    required
                                >
                                    <option value="">- Pilih -</option>
                                    {(detail.detail || []).map((d, i) => (
                                        <option key={i} value={d.produk_id}>{d.nama_produk}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Rating</label>
                                <div className="rating-select">
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            className={`star-btn ${formUlasan.rating >= n ? 'active' : ''}`}
                                            onClick={() => setFormUlasan({ ...formUlasan, rating: n })}
                                        >
                                            <FiStar />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Komentar</label>
                                <textarea
                                    rows="3"
                                    value={formUlasan.komentar}
                                    onChange={(e) => setFormUlasan({ ...formUlasan, komentar: e.target.value })}
                                    placeholder="Bagaimana pengalaman Anda?"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setModalUlasan(false)}>Batal</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseHistoryPage;