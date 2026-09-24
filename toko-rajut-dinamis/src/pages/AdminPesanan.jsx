// src/pages/AdminPesanan.jsx
import React, { useEffect, useState } from 'react';
import {
    FiRefreshCw, FiEye, FiX, FiPackage,
    FiCheckCircle, FiTruck, FiClock, FiXCircle,
    FiDollarSign, FiMapPin, FiCreditCard, FiPrinter
} from 'react-icons/fi';
import { pesananAPI, pembayaranAPI, pengirimanAPI, masterAPI } from '../services/api';
import './AdminPesanan.css';

// ─────────────────────────────────────────
// KONFIG TOKO (ubah sesuai toko Anda)
// ─────────────────────────────────────────
const NAMA_TOKO = 'RAJUTINDAH';
const ALAMAT_TOKO = 'Jl. Rajut Indah No. 1, Indonesia';
const HP_TOKO = '0812-3456-7890';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', icon: FiClock, color: 'pending' },
    { value: 'diproses', label: 'Diproses', icon: FiPackage, color: 'diproses' },
    { value: 'dikirim', label: 'Dikirim', icon: FiTruck, color: 'dikirim' },
    { value: 'selesai', label: 'Selesai', icon: FiCheckCircle, color: 'selesai' },
    { value: 'batal', label: 'Batal', icon: FiXCircle, color: 'batal' }
];

const AdminPesanan = () => {
    const [pesanan, setPesanan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('semua');
    const [detailOpen, setDetailOpen] = useState(false);
    const [pesananDetail, setPesananDetail] = useState(null);
    const [pembayaran, setPembayaran] = useState(null);
    const [pengiriman, setPengiriman] = useState(null);
    const [kurir, setKurir] = useState([]);
    const [metodeBayar, setMetodeBayar] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const [formKirim, setFormKirim] = useState({
        kurir_id: '',
        no_resi: '',
        alamat_kirim: ''
    });

    useEffect(() => {
        fetchPesanan();
        fetchMaster();
    }, []);

    const fetchPesanan = async () => {
        setLoading(true);
        try {
            const res = await pesananAPI.getAll();
            setPesanan(res.data.data || []);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat pesanan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaster = async () => {
        try {
            const [resKurir, resMetode] = await Promise.all([
                masterAPI.kurir(),
                masterAPI.metodeBayar()
            ]);
            setKurir(resKurir.data.data || []);
            setMetodeBayar(resMetode.data.data || []);
        } catch (err) {
            console.error(err);
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

    const handleBukaDetail = async (p) => {
        try {
            const res = await pesananAPI.getById(p.id);
            setPesananDetail(res.data.data);

            try {
                const resBayar = await pembayaranAPI.getByPesanan(p.id);
                setPembayaran(resBayar.data.data);
            } catch {
                setPembayaran(null);
            }

            try {
                const resKirim = await pengirimanAPI.getByPesanan(p.id);
                setPengiriman(resKirim.data.data);
                setFormKirim({
                    kurir_id: resKirim.data.data.kurir_id || '',
                    no_resi: resKirim.data.data.no_resi || '',
                    alamat_kirim: resKirim.data.data.alamat_kirim || ''
                });
            } catch {
                setPengiriman(null);
                setFormKirim({ kurir_id: '', no_resi: '', alamat_kirim: '' });
            }

            setDetailOpen(true);
        } catch (err) {
            alert('Gagal memuat detail: ' + err.message);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Ubah status pesanan jadi "${status}"?`)) return;
        try {
            setSubmitting(true);
            await pesananAPI.updateStatus(id, { status });
            alert('Status diupdate');
            await fetchPesanan();
            if (pesananDetail && pesananDetail.id === id) {
                const res = await pesananAPI.getById(id);
                setPesananDetail(res.data.data);
            }
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifikasiPembayaran = async (status) => {
        if (!pembayaran) return;
        if (!window.confirm(`Verifikasi pembayaran sebagai "${status}"?`)) return;
        try {
            setSubmitting(true);
            await pembayaranAPI.verifikasi(pembayaran.id, { status });
            alert('Pembayaran diverifikasi');
            const res = await pembayaranAPI.getByPesanan(pesananDetail.id);
            setPembayaran(res.data.data);
            await fetchPesanan();
            const resDetail = await pesananAPI.getById(pesananDetail.id);
            setPesananDetail(resDetail.data.data);
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKirimBarang = async (e) => {
        e.preventDefault();
        if (!formKirim.kurir_id || !formKirim.no_resi) {
            alert('Kurir dan nomor resi wajib diisi');
            return;
        }
        try {
            setSubmitting(true);
            await pengirimanAPI.create({
                pesanan_id: pesananDetail.id,
                kurir_id: formKirim.kurir_id,
                no_resi: formKirim.no_resi,
                alamat_kirim: formKirim.alamat_kirim
            });
            alert('Pesanan dikirim');
            const res = await pengirimanAPI.getByPesanan(pesananDetail.id);
            setPengiriman(res.data.data);
            await fetchPesanan();
            const resDetail = await pesananAPI.getById(pesananDetail.id);
            setPesananDetail(resDetail.data.data);
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleTandaiSampai = async () => {
        if (!pengiriman) return;
        if (!window.confirm('Tandai pesanan sudah sampai?')) return;
        try {
            setSubmitting(true);
            await pengirimanAPI.tandaiSampai(pengiriman.id);
            alert('Pesanan selesai');
            const res = await pengirimanAPI.getByPesanan(pesananDetail.id);
            setPengiriman(res.data.data);
            await fetchPesanan();
            const resDetail = await pesananAPI.getById(pesananDetail.id);
            setPesananDetail(resDetail.data.data);
        } catch (err) {
            alert('Gagal: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ─────────────────────────────────────────
    // CETAK STRUK (inline, tanpa file baru)
    // ─────────────────────────────────────────
    const handleCetakStruk = () => {
        if (!pesananDetail) return;

        const p = pesananDetail;
        const byr = pembayaran;
        const kir = pengiriman;

        const subtotal = p.subtotal
            ?? (p.detail || []).reduce((s, d) => s + (d.subtotal || 0), 0);
        const ongkir = p.ongkir ?? kir?.ongkir ?? 0;
        const diskon = p.diskon ?? 0;
        const total = p.total ?? (subtotal + ongkir - diskon);

        const itemsHtml = (p.detail || []).map(d => `
            <tr>
                <td>${d.nama_produk}</td>
                <td class="center">${d.jumlah}</td>
                <td class="right">${formatPrice(d.subtotal)}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <title>Struk ${p.kode_pesanan}</title>
                <style>
                    @page { size: 80mm auto; margin: 4mm; }
                    * { box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 11px;
                        color: #000;
                        width: 72mm;
                        margin: 0 auto;
                        padding: 4px 0;
                    }
                    h1 { font-size: 15px; text-align: center; margin: 0 0 2px; letter-spacing: 1px; }
                    .center { text-align: center; }
                    .right { text-align: right; }
                    .small { font-size: 10px; }
                    .muted { color: #444; }
                    hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 2px 0; font-size: 11px; vertical-align: top; }
                    th { text-align: left; border-bottom: 1px solid #000; font-size: 10px; }
                    th.center, td.center { text-align: center; }
                    th.right, td.right { text-align: right; }
                    .row { display: flex; justify-content: space-between; gap: 6px; padding: 1px 0; }
                    .row .label { flex-shrink: 0; }
                    .row .value { text-align: right; word-break: break-word; }
                    .grand { font-size: 13px; font-weight: bold; border-top: 1px solid #000; margin-top: 4px; padding-top: 4px; }
                    .badge {
                        display: inline-block;
                        padding: 2px 8px;
                        border: 1px solid #000;
                        border-radius: 100px;
                        font-size: 9px;
                        font-weight: bold;
                        letter-spacing: 1px;
                    }
                    .barcode {
                        text-align: center;
                        font-size: 14px;
                        letter-spacing: 2px;
                        font-weight: bold;
                        margin: 6px 0 2px;
                    }
                    .thanks { text-align: center; margin: 6px 0 2px; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>${NAMA_TOKO}</h1>
                <div class="center small muted">${ALAMAT_TOKO}</div>
                <div class="center small muted">Telp/WA: ${HP_TOKO}</div>

                <hr/>

                <div class="row"><span class="label">Kode</span><span class="value"><b>${p.kode_pesanan}</b></span></div>
                <div class="row"><span class="label">Tanggal</span><span class="value">${formatTanggal(p.tanggal)}</span></div>
                <div class="row"><span class="label">Pembeli</span><span class="value">${p.nama_pembeli || '-'}</span></div>
                ${p.email_pembeli ? `<div class="row"><span class="label">Email</span><span class="value">${p.email_pembeli}</span></div>` : ''}

                <hr/>

                <div class="row"><span class="label">Kurir</span><span class="value">${kir?.nama_kurir || p.kurir || '-'}</span></div>
                <div class="row"><span class="label">No. Resi</span><span class="value">${kir?.no_resi || p.no_resi || '-'}</span></div>
                <div class="row"><span class="label">Status Kirim</span><span class="value">${kir?.status || '-'}</span></div>

                <hr/>

                <table>
                    <thead>
                        <tr>
                            <th>Produk</th>
                            <th class="center">Qty</th>
                            <th class="right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <hr/>

                <div class="row"><span class="label">Subtotal</span><span class="value">${formatPrice(subtotal)}</span></div>
                <div class="row"><span class="label">Ongkir</span><span class="value">${formatPrice(ongkir)}</span></div>
                ${diskon > 0 ? `<div class="row"><span class="label">Diskon</span><span class="value">- ${formatPrice(diskon)}</span></div>` : ''}
                <div class="row grand"><span class="label">TOTAL</span><span class="value">${formatPrice(total)}</span></div>

                <hr/>

                <div class="row"><span class="label">Bayar</span><span class="value">${byr?.nama_metode || '-'}</span></div>
                <div class="row"><span class="label">Status Bayar</span><span class="value">${byr?.status || 'belum bayar'}</span></div>

                ${p.catatan ? `
                    <hr/>
                    <div class="small muted">Catatan / Alamat:</div>
                    <div class="small">${String(p.catatan).replace(/\n/g, '<br/>')}</div>
                ` : ''}

                <div class="center" style="margin-top:6px;">
                    <span class="badge">${(p.status || '').toUpperCase()}</span>
                </div>

                <div class="barcode">*${p.kode_pesanan}*</div>
                <div class="thanks">Terima kasih! 🧶</div>
                <div class="center small muted">Simpan struk ini sebagai bukti transaksi</div>

                <script>
                    window.onload = function () {
                        setTimeout(function () { window.print(); }, 200);
                    };
                    window.onafterprint = function () { window.close(); };
                </script>
            </body>
            </html>
        `;

        const win = window.open('', '_blank', 'width=380,height=600');
        if (!win) {
            alert('Popup diblokir browser. Izinkan popup untuk mencetak struk.');
            return;
        }
        win.document.open();
        win.document.write(html);
        win.document.close();
    };

    const pesananFiltered = filter === 'semua'
        ? pesanan
        : pesanan.filter(p => p.status === filter);

    const getStatusBadge = (status) => {
        const opt = STATUS_OPTIONS.find(o => o.value === status);
        return <span className={`badge badge-${status}`}>{opt?.label || status}</span>;
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat pesanan...</div>
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
                            <h1 className="admin-title">Kelola Pesanan</h1>
                            <p className="admin-subtitle">Daftar semua pesanan di toko RajutIndah</p>
                        </div>
                        <button className="admin-refresh" onClick={fetchPesanan}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* FILTER STATUS */}
                <div className="admin-filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'semua' ? 'active' : ''}`}
                        onClick={() => setFilter('semua')}
                    >
                        Semua ({pesanan.length})
                    </button>
                    {STATUS_OPTIONS.map(s => {
                        const jumlah = pesanan.filter(p => p.status === s.value).length;
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
                    {pesananFiltered.length === 0 ? (
                        <p className="admin-empty">Tidak ada pesanan.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Pembeli</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Tanggal</th>
                                    <th style={{ textAlign: 'right' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pesananFiltered.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.kode_pesanan}</strong></td>
                                        <td>{p.nama_pembeli || '-'}</td>
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* MODAL DETAIL */}
            {detailOpen && pesananDetail && (
                <div className="admin-modal-overlay" onClick={() => setDetailOpen(false)}>
                    <div className="admin-modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Detail Pesanan {pesananDetail.kode_pesanan}</h2>
                            <button className="admin-modal-close" onClick={() => setDetailOpen(false)}>
                                <FiX />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            {/* INFO PESANAN */}
                            <div className="detail-section">
                                <h3><FiPackage /> Info Pesanan</h3>
                                <div className="detail-grid">
                                    <div>
                                        <span className="detail-label">Pembeli</span>
                                        <strong>{pesananDetail.nama_pembeli || '-'}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Email</span>
                                        <strong>{pesananDetail.email_pembeli || '-'}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Tanggal</span>
                                        <strong>{formatTanggal(pesananDetail.tanggal)}</strong>
                                    </div>
                                    <div>
                                        <span className="detail-label">Status</span>
                                        {getStatusBadge(pesananDetail.status)}
                                    </div>
                                </div>
                            </div>

                            {/* ITEM PESANAN */}
                            <div className="detail-section">
                                <h3><FiPackage /> Item Pesanan</h3>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Jumlah</th>
                                            <th>Harga</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(pesananDetail.detail || []).map((d, i) => (
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
                                    <strong>{formatPrice(pesananDetail.total)}</strong>
                                </div>
                            </div>

                            {/* CATATAN */}
                            {pesananDetail.catatan && (
                                <div className="detail-section">
                                    <h3><FiMapPin /> Catatan / Alamat</h3>
                                    <p className="detail-catatan">{pesananDetail.catatan}</p>
                                </div>
                            )}

                            {/* PEMBAYARAN */}
                            <div className="detail-section">
                                <h3><FiCreditCard /> Pembayaran</h3>
                                {pembayaran ? (
                                    <div className="detail-pembayaran">
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
                                                <span className="detail-label">Bukti Transfer</span>
                                                <strong>{pembayaran.bukti_transfer || '-'}</strong>
                                            </div>
                                        </div>

                                        {pembayaran.status === 'menunggu_verifikasi' && (
                                            <div className="detail-actions">
                                                <button
                                                    className="admin-btn-success"
                                                    onClick={() => handleVerifikasiPembayaran('lunas')}
                                                    disabled={submitting}
                                                >
                                                    <FiCheckCircle /> Verifikasi Lunas
                                                </button>
                                                <button
                                                    className="admin-btn-danger"
                                                    onClick={() => handleVerifikasiPembayaran('gagal')}
                                                    disabled={submitting}
                                                >
                                                    <FiXCircle /> Tandai Gagal
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="admin-empty">Belum ada pembayaran.</p>
                                )}
                            </div>

                            {/* PENGIRIMAN */}
                            <div className="detail-section">
                                <h3><FiTruck /> Pengiriman</h3>
                                {pengiriman ? (
                                    <div className="detail-pengiriman">
                                        <div className="detail-grid">
                                            <div>
                                                <span className="detail-label">Kurir</span>
                                                <strong>{pengiriman.nama_kurir || '-'}</strong>
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

                                        {pengiriman.status === 'dikirim' && (
                                            <div className="detail-actions">
                                                <button
                                                    className="admin-btn-success"
                                                    onClick={handleTandaiSampai}
                                                    disabled={submitting}
                                                >
                                                    <FiCheckCircle /> Tandai Sampai
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    pesananDetail.status === 'diproses' ? (
                                        <form onSubmit={handleKirimBarang} className="form-kirim">
                                            <div className="admin-form-row">
                                                <div className="admin-form-group">
                                                    <label>Kurir *</label>
                                                    <select
                                                        value={formKirim.kurir_id}
                                                        onChange={(e) => setFormKirim({ ...formKirim, kurir_id: e.target.value })}
                                                        required
                                                    >
                                                        <option value="">- Pilih Kurir -</option>
                                                        {kurir.map(k => (
                                                            <option key={k.id} value={k.id}>
                                                                {k.nama_kurir} - {formatPrice(k.ongkir_per_kg)}/kg
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="admin-form-group">
                                                    <label>No. Resi *</label>
                                                    <input
                                                        type="text"
                                                        value={formKirim.no_resi}
                                                        onChange={(e) => setFormKirim({ ...formKirim, no_resi: e.target.value })}
                                                        placeholder="Contoh: JNE1234567890"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Alamat Kirim</label>
                                                <textarea
                                                    rows="2"
                                                    value={formKirim.alamat_kirim}
                                                    onChange={(e) => setFormKirim({ ...formKirim, alamat_kirim: e.target.value })}
                                                    placeholder="Alamat pengiriman..."
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="admin-btn-print" disabled={submitting}
                                            >
                                                <FiTruck /> Kirim Barang
                                            </button>
                                        </form>
                                    ) : (
                                        <p className="admin-empty">Pesanan belum siap dikirim. Status harus "diproses" dulu.</p>
                                    )
                                )}
                            </div>

                            {/* CETAK STRUK */}
                            <div className="detail-section">
                                <h3><FiPrinter /> Cetak Struk</h3>
                                <p style={{ marginBottom: 12, fontSize: '0.85rem', color: '#6b7280' }}>
                                    Cetak struk untuk diselipkan ke paket atau arsip toko.
                                </p>
                                <div className="detail-actions">
                                    <button
                                        type="button"
                                        className="admin-btn-print" onClick={handleCetakStruk}
                                    >
                                        <FiPrinter /> Cetak Struk
                                    </button>
                                </div>
                            </div>

                            {/* UPDATE STATUS MANUAL */}
                            <div className="detail-section">
                                <h3><FiCheckCircle /> Update Status Manual</h3>
                                <div className="status-buttons">
                                    {STATUS_OPTIONS.map(s => (
                                        <button
                                            key={s.value}
                                            className={`status-btn status-${s.value} ${pesananDetail.status === s.value ? 'active' : ''}`}
                                            onClick={() => handleUpdateStatus(pesananDetail.id, s.value)}
                                            disabled={submitting || pesananDetail.status === s.value}
                                        >
                                            <s.icon /> {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPesanan;