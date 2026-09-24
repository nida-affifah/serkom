// src/components/Checkout/CheckoutModal.jsx
import React, { useState, useEffect } from 'react';
import { FiPrinter, FiCheckCircle, FiX } from 'react-icons/fi';
import { pesananAPI, alamatAPI, masterAPI, voucherAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './CheckoutModal.css';

const NAMA_TOKO = 'RAJUTINDAH';
const ALAMAT_TOKO = 'Jl. Rajut Indah No. 1, Indonesia';
const HP_TOKO = '0812-3456-7890';

const CheckoutModal = ({ onClose, onSuccess }) => {
    const { cart, cartTotal, fetchCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Master data
    const [alamatList, setAlamatList] = useState([]);
    const [metodeList, setMetodeList] = useState([]);
    const [kurirList, setKurirList] = useState([]);

    // Pilihan user
    const [alamatId, setAlamatId] = useState(null);
    const [metodeId, setMetodeId] = useState(null);
    const [kurirId, setKurirId] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [voucherKode, setVoucherKode] = useState('');
    const [voucherInfo, setVoucherInfo] = useState(null);

    // Form alamat baru
    const [showFormAlamat, setShowFormAlamat] = useState(false);
    const [formAlamat, setFormAlamat] = useState({
        label: 'Rumah',
        nama_penerima: '',
        no_hp: '',
        alamat_lengkap: '',
        provinsi: '',
        kota: '',
        kecamatan: '',
        kode_pos: '',
        is_default: false
    });

    // Struk / receipt
    const [showReceipt, setShowReceipt] = useState(false);
    const [pesananSukses, setPesananSukses] = useState(null);

    useEffect(() => {
        loadMaster();
        loadAlamat();
    }, []);

    const loadMaster = async () => {
        try {
            const [metodeRes, kurirRes] = await Promise.all([
                masterAPI.metodeBayar(),
                masterAPI.kurir()
            ]);
            setMetodeList(metodeRes.data.data || []);
            setKurirList(kurirRes.data.data || []);
            if (metodeRes.data.data?.length > 0) setMetodeId(metodeRes.data.data[0].id);
            if (kurirRes.data.data?.length > 0) setKurirId(kurirRes.data.data[0].id);
        } catch (err) {
            console.error('Gagal load master:', err);
        }
    };

    const loadAlamat = async () => {
        try {
            const res = await alamatAPI.getAll();
            const list = res.data.data || [];
            setAlamatList(list);
            const defaultAlamat = list.find(a => a.is_default);
            if (defaultAlamat) setAlamatId(defaultAlamat.id);
            else if (list.length > 0) setAlamatId(list[0].id);
        } catch (err) {
            console.error('Gagal load alamat:', err);
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
        return new Date(tgl).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const kurirTerpilih = kurirList.find(k => k.id === kurirId);
    const ongkir = kurirTerpilih ? kurirTerpilih.ongkir_per_kg : 0;
    const metodeTerpilih = metodeList.find(m => m.id === metodeId);
    const alamatTerpilih = alamatList.find(a => a.id === alamatId);

    const diskon = voucherInfo ? voucherInfo.diskon : 0;
    const totalAkhir = cartTotal + ongkir - diskon;

    const handleSimpanAlamat = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await alamatAPI.create(formAlamat);
            const alamatBaru = res.data.data;
            setAlamatList([...alamatList, alamatBaru]);
            setAlamatId(alamatBaru.id);
            setShowFormAlamat(false);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCekVoucher = async () => {
        if (!voucherKode.trim()) return;
        try {
            const res = await voucherAPI.cek({
                kode: voucherKode,
                total_belanja: cartTotal
            });
            setVoucherInfo(res.data.data);
            setError(null);
        } catch (err) {
            setVoucherInfo(null);
            setError('Voucher: ' + err.message);
        }
    };

    const handleCheckout = async () => {
        if (!alamatId) { setError('Pilih alamat pengiriman dulu'); return; }
        if (!metodeId) { setError('Pilih metode pembayaran'); return; }
        if (!kurirId) { setError('Pilih kurir pengiriman'); return; }

        try {
            setLoading(true);
            setError(null);

            const alamat = alamatList.find(a => a.id === alamatId);
            const catatanLengkap = `Penerima: ${alamat.nama_penerima}, HP: ${alamat.no_hp}\nAlamat: ${alamat.alamat_lengkap}, ${alamat.kota}, ${alamat.provinsi} ${alamat.kode_pos}\n${catatan || ''}`;

            const res = await pesananAPI.checkoutKeranjang({
                catatan: catatanLengkap,
                voucher_kode: voucherInfo ? voucherInfo.voucher.kode : null
            });

            // Simpan data untuk struk (gabung cart + info)
            const dataPesanan = res.data.data;
            const strukData = {
                ...dataPesanan,
                nama_penerima: alamat.nama_penerima,
                no_hp: alamat.no_hp,
                alamat_lengkap: alamat.alamat_lengkap,
                kota: alamat.kota,
                provinsi: alamat.provinsi,
                kode_pos: alamat.kode_pos,
                metode_bayar: metodeTerpilih?.nama_metode || '-',
                kurir: kurirTerpilih?.nama_kurir || '-',
                ongkir: ongkir,
                diskon: diskon,
                voucher_kode: voucherInfo?.voucher?.kode || null,
                subtotal: cartTotal,
                total_akhir: totalAkhir,
                items: cart.map(item => ({
                    nama_produk: item.nama_produk,
                    jumlah: item.jumlah,
                    harga_satuan: item.harga_satuan || (item.subtotal / item.jumlah),
                    subtotal: item.subtotal
                }))
            };

            await fetchCart();
            setPesananSukses(strukData);
            setShowReceipt(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCetakStruk = () => {
        window.print();
    };

    const handleSelesai = () => {
        if (onSuccess) onSuccess(pesananSukses);
        setShowReceipt(false);
        onClose();
    };

    // ─────────────────────────────────────────
    // RENDER: MODAL STRUK
    // ─────────────────────────────────────────
    if (showReceipt && pesananSukses) {
        return (
            <div className="checkout-overlay" onClick={handleSelesai}>
                <div
                    className="checkout-modal receipt-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="receipt-wrapper">
                        <div className="receipt-success-badge">
                            <FiCheckCircle /> Pesanan Berhasil Dibuat!
                        </div>

                        <div className="receipt-content" id="struk-cetak">
                            {/* HEADER TOKO */}
                            <div className="receipt-header">
                                <h2>{NAMA_TOKO}</h2>
                                <p>{ALAMAT_TOKO}</p>
                                <p>Telp/WA: {HP_TOKO}</p>
                            </div>

                            {/* INFO PESANAN */}
                            <div className="receipt-info">
                                <div className="receipt-row">
                                    <span>Kode Pesanan</span>
                                    <strong>{pesananSukses.kode_pesanan}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>Tanggal</span>
                                    <strong>{formatTanggal(pesananSukses.tanggal || new Date())}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>Penerima</span>
                                    <strong>{pesananSukses.nama_penerima}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>No. HP</span>
                                    <strong>{pesananSukses.no_hp}</strong>
                                </div>
                                <div className="receipt-row">
                                    <span>Alamat</span>
                                    <strong className="right">
                                        {pesananSukses.alamat_lengkap}, {pesananSukses.kota}, {pesananSukses.provinsi} {pesananSukses.kode_pos}
                                    </strong>
                                </div>
                            </div>

                            {/* ITEM */}
                            <div className="receipt-items">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th className="center">Qty</th>
                                            <th className="right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pesananSukses.items.map((it, i) => (
                                            <tr key={i}>
                                                <td>{it.nama_produk}</td>
                                                <td className="center">{it.jumlah}</td>
                                                <td className="right">{formatPrice(it.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* TOTAL */}
                            <div className="receipt-total">
                                <div className="receipt-row">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(pesananSukses.subtotal)}</span>
                                </div>
                                <div className="receipt-row">
                                    <span>Ongkir ({pesananSukses.kurir})</span>
                                    <span>{formatPrice(pesananSukses.ongkir)}</span>
                                </div>
                                {pesananSukses.diskon > 0 && (
                                    <div className="receipt-row">
                                        <span>Diskon {pesananSukses.voucher_kode && `(${pesananSukses.voucher_kode})`}</span>
                                        <span>- {formatPrice(pesananSukses.diskon)}</span>
                                    </div>
                                )}
                                <div className="receipt-row grand">
                                    <span>TOTAL</span>
                                    <strong>{formatPrice(pesananSukses.total_akhir)}</strong>
                                </div>
                            </div>

                            {/* INFO PEMBAYARAN */}
                            <div className="receipt-payment-info">
                                <h4>Informasi Pembayaran</h4>
                                <ul>
                                    <li>Metode: <strong>{pesananSukses.metode_bayar}</strong></li>
                                    <li>Status: <strong>Menunggu Pembayaran</strong></li>
                                    <li>Silakan lakukan pembayaran &amp; unggah bukti transfer</li>
                                </ul>
                            </div>

                            {/* FOOTER */}
                            <div className="receipt-footer">
                                <div className="status-badge">SUKSES</div>
                                <div className="barcode">
                                    *{pesananSukses.kode_pesanan}*
                                </div>
                                <p className="thanks">Terima kasih sudah berbelanja! 🧶</p>
                                <p className="small">Simpan struk ini sebagai bukti pembelian</p>
                                <p className="small">{NAMA_TOKO} — Rajutan handmade berkualitas</p>
                            </div>
                        </div>
                    </div>

                    <div className="receipt-actions">
                        <button
                            type="button"
                            className="btn-print"
                            onClick={handleCetakStruk}
                        >
                            <FiPrinter /> Cetak Struk
                        </button>
                        <button
                            type="button"
                            className="btn-finish"
                            onClick={handleSelesai}
                        >
                            Selesai
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────
    // RENDER: MODAL CHECKOUT
    // ─────────────────────────────────────────
    return (
        <div className="checkout-overlay" onClick={onClose}>
            <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
                <div className="checkout-header">
                    <h2>Checkout</h2>
                    <button className="checkout-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="checkout-body">
                    {error && <div className="checkout-error">{error}</div>}

                    {/* ALAMAT */}
                    <div className="checkout-section">
                        <h3>1. Alamat Pengiriman</h3>
                        {alamatList.length === 0 && !showFormAlamat && (
                            <p>Belum ada alamat. Silakan tambah alamat.</p>
                        )}
                        {alamatList.map(a => (
                            <label key={a.id} className={`alamat-item ${alamatId === a.id ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="alamat"
                                    checked={alamatId === a.id}
                                    onChange={() => setAlamatId(a.id)}
                                />
                                <div>
                                    <strong>{a.label} {a.is_default && '(Default)'}</strong>
                                    <p>{a.nama_penerima} - {a.no_hp}</p>
                                    <p>{a.alamat_lengkap}, {a.kota}, {a.provinsi} {a.kode_pos}</p>
                                </div>
                            </label>
                        ))}
                        <button
                            type="button"
                            className="btn-tambah-alamat"
                            onClick={() => setShowFormAlamat(!showFormAlamat)}
                        >
                            {showFormAlamat ? 'Batal' : '+ Tambah Alamat Baru'}
                        </button>

                        {showFormAlamat && (
                            <form onSubmit={handleSimpanAlamat} className="form-alamat">
                                <input placeholder="Label (Rumah/Kantor)" value={formAlamat.label}
                                    onChange={e => setFormAlamat({ ...formAlamat, label: e.target.value })} required />
                                <input placeholder="Nama penerima" value={formAlamat.nama_penerima}
                                    onChange={e => setFormAlamat({ ...formAlamat, nama_penerima: e.target.value })} required />
                                <input placeholder="No HP" value={formAlamat.no_hp}
                                    onChange={e => setFormAlamat({ ...formAlamat, no_hp: e.target.value })} required />
                                <input placeholder="Alamat lengkap" value={formAlamat.alamat_lengkap}
                                    onChange={e => setFormAlamat({ ...formAlamat, alamat_lengkap: e.target.value })} required />
                                <input placeholder="Provinsi" value={formAlamat.provinsi}
                                    onChange={e => setFormAlamat({ ...formAlamat, provinsi: e.target.value })} required />
                                <input placeholder="Kota" value={formAlamat.kota}
                                    onChange={e => setFormAlamat({ ...formAlamat, kota: e.target.value })} required />
                                <input placeholder="Kecamatan" value={formAlamat.kecamatan}
                                    onChange={e => setFormAlamat({ ...formAlamat, kecamatan: e.target.value })} required />
                                <input placeholder="Kode Pos" value={formAlamat.kode_pos}
                                    onChange={e => setFormAlamat({ ...formAlamat, kode_pos: e.target.value })} required />
                                <label>
                                    <input type="checkbox" checked={formAlamat.is_default}
                                        onChange={e => setFormAlamat({ ...formAlamat, is_default: e.target.checked })} />
                                    Jadikan alamat default
                                </label>
                                <button type="submit" disabled={loading}>Simpan Alamat</button>
                            </form>
                        )}
                    </div>

                    {/* METODE BAYAR + KURIR */}
                    <div className="checkout-section">
                        <h3>2. Metode Pembayaran &amp; Kurir</h3>
                        <div className="form-group">
                            <label>Metode Pembayaran</label>
                            <select
                                className="checkout-select"
                                value={metodeId || ''}
                                onChange={e => setMetodeId(Number(e.target.value))}
                            >
                                {metodeList.map(m => (
                                    <option key={m.id} value={m.id}>{m.nama_metode} ({m.tipe})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Kurir</label>
                            <select
                                className="checkout-select"
                                value={kurirId || ''}
                                onChange={e => setKurirId(Number(e.target.value))}
                            >
                                {kurirList.map(k => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama_kurir} - {formatPrice(k.ongkir_per_kg)}/kg
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* VOUCHER */}
                    <div className="checkout-section">
                        <h3>3. Voucher (Opsional)</h3>
                        <div className="voucher-row">
                            <input
                                className="voucher-input"
                                placeholder="Kode voucher"
                                value={voucherKode}
                                onChange={e => setVoucherKode(e.target.value.toUpperCase())}
                            />
                            <button type="button" className="voucher-btn" onClick={handleCekVoucher}>
                                Cek
                            </button>
                        </div>
                        {voucherInfo && (
                            <p className="voucher-success">
                                ✓ Voucher <strong>{voucherInfo.voucher.kode}</strong>: diskon {formatPrice(voucherInfo.diskon)}
                            </p>
                        )}
                    </div>

                    {/* RINGKASAN */}
                    <div className="checkout-section">
                        <h3>4. Ringkasan Pesanan</h3>
                        {cart.map(item => (
                            <div key={item.id} className="checkout-item">
                                <span>{item.nama_produk} × {item.jumlah}</span>
                                <span>{formatPrice(item.subtotal)}</span>
                            </div>
                        ))}
                        <hr />
                        <div className="checkout-item">
                            <span>Subtotal</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <div className="checkout-item">
                            <span>Ongkir</span>
                            <span>{formatPrice(ongkir)}</span>
                        </div>
                        {diskon > 0 && (
                            <div className="checkout-item" style={{ color: 'green' }}>
                                <span>Diskon</span>
                                <span>- {formatPrice(diskon)}</span>
                            </div>
                        )}
                        <div className="checkout-total">
                            <strong>Total</strong>
                            <strong>{formatPrice(totalAkhir)}</strong>
                        </div>
                    </div>

                    <div className="checkout-section">
                        <label>Catatan (opsional)</label>
                        <textarea
                            rows="2"
                            value={catatan}
                            onChange={e => setCatatan(e.target.value)}
                            placeholder="Catatan untuk penjual"
                        />
                    </div>
                </div>

                <div className="checkout-actions">
                    <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                    <button
                        type="button"
                        className="btn-confirm"
                        onClick={handleCheckout}
                        disabled={loading || cart.length === 0}
                    >
                        {loading ? 'Memproses...' : `Buat Pesanan (${formatPrice(totalAkhir)})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;