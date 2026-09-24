// src/pages/AdminLaporan.jsx
import React, { useEffect, useState } from 'react';
import {
    FiRefreshCw, FiDownload, FiTrendingUp, FiPackage,
    FiDollarSign, FiShoppingCart, FiAlertTriangle, FiFileText
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { laporanAPI } from '../services/api';
import './AdminLaporan.css';

const NAMA_TOKO = 'RAJUTINDAH';
const ALAMAT_TOKO = 'Jl. Rajut Indah No. 1, Indonesia';

const AdminLaporan = () => {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('harian');

    const [ringkasan, setRingkasan] = useState(null);
    const [harian, setHarian] = useState([]);
    const [bulanan, setBulanan] = useState([]);
    const [terlaris, setTerlaris] = useState([]);
    const [perKategori, setPerKategori] = useState([]);
    const [stokKritis, setStokKritis] = useState([]);
    const [periode, setPeriode] = useState({
        dari: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        sampai: new Date().toISOString().split('T')[0]
    });
    const [laporanPeriode, setLaporanPeriode] = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const dari = periode.dari;
            const sampai = periode.sampai;

            const [resRingkasan, resHarian, resBulanan, resTerlaris, resKategori, resStok, resPeriode] = await Promise.all([
                laporanAPI.ringkasan(),
                laporanAPI.harian(),
                laporanAPI.bulanan(),
                laporanAPI.produkTerlaris(10, dari, sampai),
                laporanAPI.perKategori(dari, sampai),
                laporanAPI.stokMenipis(),
                laporanAPI.periode(dari, sampai)
            ]);

            setRingkasan(resRingkasan.data.data);
            setHarian(resHarian.data.data || []);
            setBulanan(resBulanan.data.data || []);
            setTerlaris(resTerlaris.data.data || []);
            setPerKategori(resKategori.data.data || []);
            setStokKritis(resStok.data.data || []);
            setLaporanPeriode(resPeriode.data.data);
        } catch (err) {
            console.error(err);
            alert('Gagal memuat laporan: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPeriode = async () => {
        try {
            setLoading(true);
            const dari = periode.dari;
            const sampai = periode.sampai;

            const [resPeriode, resTerlaris, resKategori] = await Promise.all([
                laporanAPI.periode(dari, sampai),
                laporanAPI.produkTerlaris(10, dari, sampai),
                laporanAPI.perKategori(dari, sampai)
            ]);

            setLaporanPeriode(resPeriode.data.data);
            setTerlaris(resTerlaris.data.data || []);
            setPerKategori(resKategori.data.data || []);
        } catch (err) {
            alert('Gagal memuat laporan periode: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(Number(price) || 0);
    };

    const formatPricePlain = (price) => {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Number(price) || 0);
    };

    const formatTanggal = (tgl) => {
        if (!tgl) return '-';
        const dateStr = String(tgl).includes(' ') ? String(tgl).replace(' ', 'T') : tgl;
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatTanggalLengkap = (tgl) => {
        if (!tgl) return '-';
        const dateStr = String(tgl).includes(' ') ? String(tgl).replace(' ', 'T') : tgl;
        return new Date(dateStr).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatBulan = (bulan) => {
        if (!bulan) return '-';
        const [tahun, bln] = bulan.split('-');
        const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                           'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${namaBulan[parseInt(bln) - 1]} ${tahun}`;
    };

    const labelPeriode = `${formatTanggal(periode.dari)} – ${formatTanggal(periode.sampai)}`;

    // ═══════════════════════════════════════
    // KONFIGURASI PER TAB
    // ═══════════════════════════════════════
    const getTabConfig = (tab) => {
        switch (tab) {
            case 'harian': {
                const rows = harian.map(h => ({
                    Tanggal: formatTanggal(h.tanggal),
                    'Jumlah Pesanan': Number(h.jumlah_pesanan) || 0,
                    'Total Penjualan (Rp)': Number(h.total_penjualan) || 0,
                }));
                const total = rows.reduce((s, r) => s + r['Total Penjualan (Rp)'], 0);
                const totalQty = rows.reduce((s, r) => s + r['Jumlah Pesanan'], 0);
                return {
                    judul: 'Laporan Penjualan Harian',
                    columns: [
                        { header: 'Tanggal', key: 'Tanggal', width: 30 },
                        { header: 'Jumlah Pesanan', key: 'Jumlah Pesanan', width: 30 },
                        { header: 'Total Penjualan (Rp)', key: 'Total Penjualan (Rp)', width: 40 },
                    ],
                    rows,
                    footer: { Tanggal: 'TOTAL', 'Jumlah Pesanan': totalQty, 'Total Penjualan (Rp)': total },
                };
            }
            case 'bulanan': {
                const rows = bulanan.map(b => ({
                    Bulan: formatBulan(b.bulan),
                    'Jumlah Pesanan': Number(b.jumlah_pesanan) || 0,
                    'Total Penjualan (Rp)': Number(b.total_penjualan) || 0,
                }));
                const total = rows.reduce((s, r) => s + r['Total Penjualan (Rp)'], 0);
                const totalQty = rows.reduce((s, r) => s + r['Jumlah Pesanan'], 0);
                return {
                    judul: 'Laporan Penjualan Bulanan',
                    columns: [
                        { header: 'Bulan', key: 'Bulan', width: 30 },
                        { header: 'Jumlah Pesanan', key: 'Jumlah Pesanan', width: 30 },
                        { header: 'Total Penjualan (Rp)', key: 'Total Penjualan (Rp)', width: 40 },
                    ],
                    rows,
                    footer: { Bulan: 'TOTAL', 'Jumlah Pesanan': totalQty, 'Total Penjualan (Rp)': total },
                };
            }
            case 'terlaris': {
                const rows = terlaris.map((p, idx) => ({
                    Rank: `#${idx + 1}`,
                    'Kode Produk': p.kode_produk || '-',
                    'Nama Produk': p.nama_produk,
                    'Harga Jual (Rp)': Number(p.harga_jual) || 0,
                    'Total Terjual': Number(p.total_terjual) || 0,
                    'Total Pendapatan (Rp)': Number(p.total_pendapatan) || 0,
                }));
                const totalTerjual = rows.reduce((s, r) => s + r['Total Terjual'], 0);
                const totalPendapatan = rows.reduce((s, r) => s + r['Total Pendapatan (Rp)'], 0);
                return {
                    judul: `Laporan Produk Terlaris (${labelPeriode})`,
                    columns: [
                        { header: 'Rank', key: 'Rank', width: 12 },
                        { header: 'Kode Produk', key: 'Kode Produk', width: 24 },
                        { header: 'Nama Produk', key: 'Nama Produk', width: 45 },
                        { header: 'Harga Jual (Rp)', key: 'Harga Jual (Rp)', width: 25 },
                        { header: 'Total Terjual', key: 'Total Terjual', width: 22 },
                        { header: 'Total Pendapatan (Rp)', key: 'Total Pendapatan (Rp)', width: 32 },
                    ],
                    rows,
                    footer: { Rank: '', 'Kode Produk': '', 'Nama Produk': 'TOTAL', 'Harga Jual (Rp)': '', 'Total Terjual': totalTerjual, 'Total Pendapatan (Rp)': totalPendapatan },
                    extraInfo: [['Periode', labelPeriode]],
                };
            }
            case 'kategori': {
                const rows = perKategori.map(k => ({
                    Kategori: k.nama_kategori || '-',
                    'Jumlah Pesanan': Number(k.jumlah_pesanan) || 0,
                    'Item Terjual': Number(k.total_item_terjual) || 0,
                    'Total Pendapatan (Rp)': Number(k.total_pendapatan) || 0,
                }));
                const totalPesanan = rows.reduce((s, r) => s + r['Jumlah Pesanan'], 0);
                const totalItem = rows.reduce((s, r) => s + r['Item Terjual'], 0);
                const totalPendapatan = rows.reduce((s, r) => s + r['Total Pendapatan (Rp)'], 0);
                return {
                    judul: `Laporan Pendapatan Per Kategori (${labelPeriode})`,
                    columns: [
                        { header: 'Kategori', key: 'Kategori', width: 35 },
                        { header: 'Jumlah Pesanan', key: 'Jumlah Pesanan', width: 28 },
                        { header: 'Item Terjual', key: 'Item Terjual', width: 25 },
                        { header: 'Total Pendapatan (Rp)', key: 'Total Pendapatan (Rp)', width: 40 },
                    ],
                    rows,
                    footer: { Kategori: 'TOTAL', 'Jumlah Pesanan': totalPesanan, 'Item Terjual': totalItem, 'Total Pendapatan (Rp)': totalPendapatan },
                    extraInfo: [['Periode', labelPeriode]],
                };
            }
            case 'stok': {
                const rows = stokKritis.map(p => ({
                    'Kode Produk': p.kode_produk || '-',
                    'Nama Produk': p.nama_produk,
                    'Stok Saat Ini': Number(p.stok) || 0,
                    'Stok Minimal': Number(p.stok_minimal) || 0,
                    'Selisih': (Number(p.stok_minimal) || 0) - (Number(p.stok) || 0),
                }));
                return {
                    judul: 'Laporan Produk Stok Menipis (Real-time)',
                    columns: [
                        { header: 'Kode Produk', key: 'Kode Produk', width: 24 },
                        { header: 'Nama Produk', key: 'Nama Produk', width: 45 },
                        { header: 'Stok Saat Ini', key: 'Stok Saat Ini', width: 22 },
                        { header: 'Stok Minimal', key: 'Stok Minimal', width: 22 },
                        { header: 'Selisih', key: 'Selisih', width: 20 },
                    ],
                    rows,
                    footer: null,
                };
            }
            case 'periode': {
                const detail = laporanPeriode?.detail || [];
                const rows = detail.map(p => ({
                    'Kode Pesanan': p.kode_pesanan,
                    Tanggal: formatTanggalLengkap(p.tanggal),
                    Pembeli: p.nama_pembeli || '-',
                    'Total (Rp)': Number(p.total) || 0,
                    'Diskon (Rp)': Number(p.diskon) || 0,
                    Status: p.status,
                    Voucher: p.kode_voucher || '-',
                }));
                const total = rows.reduce((s, r) => s + r['Total (Rp)'], 0);
                return {
                    judul: `Laporan Periode ${periode.dari} s/d ${periode.sampai}`,
                    columns: [
                        { header: 'Kode Pesanan', key: 'Kode Pesanan', width: 28 },
                        { header: 'Tanggal', key: 'Tanggal', width: 32 },
                        { header: 'Pembeli', key: 'Pembeli', width: 35 },
                        { header: 'Total (Rp)', key: 'Total (Rp)', width: 25 },
                        { header: 'Diskon (Rp)', key: 'Diskon (Rp)', width: 22 },
                        { header: 'Status', key: 'Status', width: 20 },
                        { header: 'Voucher', key: 'Voucher', width: 20 },
                    ],
                    rows,
                    footer: { 'Kode Pesanan': 'TOTAL', Tanggal: '', Pembeli: '', 'Total (Rp)': total, 'Diskon (Rp)': '', Status: '', Voucher: '' },
                    extraInfo: laporanPeriode?.ringkasan ? [
                        ['Jumlah Pesanan', laporanPeriode.ringkasan.jumlah_pesanan],
                        ['Total Penjualan', formatPrice(laporanPeriode.ringkasan.total_penjualan)],
                    ] : null,
                };
            }
            default:
                return null;
        }
    };

    // ═══════════════════════════════════════
    // EXPORT EXCEL (.xlsx asli)
    // ═══════════════════════════════════════
    const handleExportExcel = (tab) => {
        const cfg = getTabConfig(tab);
        if (!cfg || !cfg.rows || cfg.rows.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const wb = XLSX.utils.book_new();
        const aoa = [];
        aoa.push([NAMA_TOKO]);
        aoa.push([ALAMAT_TOKO]);
        aoa.push([]);
        aoa.push([cfg.judul]);
        aoa.push([`Diekspor: ${formatTanggalLengkap(new Date())}`]);
        aoa.push([]);

        if (cfg.extraInfo) {
            cfg.extraInfo.forEach(([k, v]) => aoa.push([k, v]));
            aoa.push([]);
        }

        aoa.push(cfg.columns.map(c => c.header));
        cfg.rows.forEach(r => aoa.push(cfg.columns.map(c => r[c.key] ?? '')));

        if (cfg.footer) {
            aoa.push(cfg.columns.map(c => cfg.footer[c.key] ?? ''));
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        ws['!cols'] = cfg.columns.map(c => ({ wch: c.width || 20 }));
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: cfg.columns.length - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: cfg.columns.length - 1 } },
            { s: { r: 3, c: 0 }, e: { r: 3, c: cfg.columns.length - 1 } },
            { s: { r: 4, c: 0 }, e: { r: 4, c: cfg.columns.length - 1 } },
        ];

        const sheetName = cfg.judul.replace(/[\\/?*[\]:]/g, '').slice(0, 31) || 'Laporan';
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const namaFile = `${cfg.judul.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, namaFile);
    };

    // ═══════════════════════════════════════
    // EXPORT PDF (.pdf asli)
    // ═══════════════════════════════════════
    const handleExportPDF = (tab) => {
        const cfg = getTabConfig(tab);
        if (!cfg || !cfg.rows || cfg.rows.length === 0) {
            alert('Tidak ada data untuk diexport');
            return;
        }

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(NAMA_TOKO, pageWidth / 2, 15, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(ALAMAT_TOKO, pageWidth / 2, 20, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(cfg.judul, pageWidth / 2, 28, { align: 'center' });

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text(`Diekspor: ${formatTanggalLengkap(new Date())}`, pageWidth / 2, 33, { align: 'center' });

        let startY = 38;

        if (cfg.extraInfo) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            cfg.extraInfo.forEach(([k, v], i) => {
                doc.text(`${k}: ${v}`, 14, startY + (i * 5));
            });
            startY += (cfg.extraInfo.length * 5) + 3;
        }

        const body = cfg.rows.map(r => cfg.columns.map(c => {
            const v = r[c.key];
            if (typeof v === 'number') {
                if (c.key.includes('(Rp)') || c.key.includes('Harga') || c.key.includes('Pendapatan') || c.key.includes('Total')) {
                    return formatPricePlain(v);
                }
                return String(v);
            }
            return v ?? '';
        }));

        const foot = cfg.footer ? [[
            ...cfg.columns.map(c => {
                const v = cfg.footer[c.key];
                if (typeof v === 'number') {
                    if (c.key.includes('(Rp)') || c.key.includes('Harga') || c.key.includes('Pendapatan') || c.key.includes('Total')) {
                        return formatPricePlain(v);
                    }
                    return String(v);
                }
                return v ?? '';
            })
        ]] : null;

        autoTable(doc, {
            startY,
            head: [cfg.columns.map(c => c.header)],
            body,
            foot,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', valign: 'middle' },
            headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', halign: 'center' },
            footStyles: { fillColor: [245, 243, 255], textColor: [26, 26, 26], fontStyle: 'bold', halign: 'right' },
            columnStyles: cfg.columns.reduce((acc, c, i) => {
                if (c.key.includes('(Rp)') || c.key.includes('Harga') || c.key.includes('Terjual') || c.key.includes('Pesanan') || c.key.includes('Stok') || c.key.includes('Selisih')) {
                    acc[i] = { halign: 'right' };
                } else if (c.key === 'Rank' || c.key === 'Status') {
                    acc[i] = { halign: 'center' };
                } else {
                    acc[i] = { halign: 'left' };
                }
                return acc;
            }, {}),
            margin: { top: 38, left: 14, right: 14 },
            didDrawPage: () => {
                const pageCount = doc.internal.getNumberOfPages();
                const pageCurrent = doc.internal.getCurrentPageInfo().pageNumber;
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Halaman ${pageCurrent} dari ${pageCount}`,
                    pageWidth - 14,
                    doc.internal.pageSize.getHeight() - 8,
                    { align: 'right' }
                );
                doc.text(
                    `© ${new Date().getFullYear()} ${NAMA_TOKO}`,
                    14,
                    doc.internal.pageSize.getHeight() - 8
                );
            },
        });

        const namaFile = `${cfg.judul.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(namaFile);
    };

    const ExportButtons = ({ tab }) => (
        <div className="laporan-export-group">
            <button className="laporan-export-btn excel" onClick={() => handleExportExcel(tab)} title="Export Excel (.xlsx)">
                <FiDownload /> Excel
            </button>
            <button className="laporan-export-btn pdf" onClick={() => handleExportPDF(tab)} title="Export PDF (.pdf)">
                <FiFileText /> PDF
            </button>
        </div>
    );

    const maxHarian = harian.length > 0
        ? Math.max(...harian.map(h => Number(h.total_penjualan) || 0)) : 0;

    const maxBulanan = bulanan.length > 0
        ? Math.max(...bulanan.map(b => Number(b.total_penjualan) || 0)) : 0;

    if (loading && !ringkasan) {
        return (
            <div className="admin-page">
                <div className="admin-container">
                    <div className="admin-loading">Memuat laporan...</div>
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
                            <h1 className="admin-title">Laporan Penjualan</h1>
                            <p className="admin-subtitle">Rekap penjualan, stok, dan pendapatan toko RajutIndah</p>
                        </div>
                        <button className="admin-refresh" onClick={fetchAll}>
                            <FiRefreshCw /> Refresh
                        </button>
                    </div>
                </div>

                {/* 4 KARTU RINGKASAN */}
                <div className="laporan-stats">
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon purple"><FiShoppingCart /></div>
                        <div>
                            <span className="laporan-stat-label">Total Pesanan</span>
                            <strong className="laporan-stat-value">{ringkasan?.total_pesanan || 0}</strong>
                        </div>
                    </div>
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon green"><FiDollarSign /></div>
                        <div>
                            <span className="laporan-stat-label">Total Pendapatan</span>
                            <strong className="laporan-stat-value">{formatPrice(ringkasan?.total_pendapatan)}</strong>
                        </div>
                    </div>
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon blue"><FiPackage /></div>
                        <div>
                            <span className="laporan-stat-label">Pesanan Selesai</span>
                            <strong className="laporan-stat-value">{ringkasan?.pesanan_selesai || 0}</strong>
                        </div>
                    </div>
                    <div className="laporan-stat-card">
                        <div className="laporan-stat-icon orange"><FiAlertTriangle /></div>
                        <div>
                            <span className="laporan-stat-label">Stok Kritis</span>
                            <strong className="laporan-stat-value">{ringkasan?.produk_stok_kritis || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* TAB */}
                <div className="laporan-tabs">
                    <button className={`laporan-tab ${activeTab === 'harian' ? 'active' : ''}`} onClick={() => setActiveTab('harian')}>Penjualan Harian</button>
                    <button className={`laporan-tab ${activeTab === 'bulanan' ? 'active' : ''}`} onClick={() => setActiveTab('bulanan')}>Penjualan Bulanan</button>
                    <button className={`laporan-tab ${activeTab === 'terlaris' ? 'active' : ''}`} onClick={() => setActiveTab('terlaris')}>Produk Terlaris</button>
                    <button className={`laporan-tab ${activeTab === 'kategori' ? 'active' : ''}`} onClick={() => setActiveTab('kategori')}>Per Kategori</button>
                    <button className={`laporan-tab ${activeTab === 'stok' ? 'active' : ''}`} onClick={() => setActiveTab('stok')}>Stok Menipis</button>
                    <button className={`laporan-tab ${activeTab === 'periode' ? 'active' : ''}`} onClick={() => setActiveTab('periode')}>Per Periode</button>
                </div>

                {/* FILTER PERIODE (global) */}
                <div className="laporan-periode-global">
                    <div className="periode-input">
                        <label>Dari</label>
                        <input type="date" value={periode.dari} onChange={(e) => setPeriode({ ...periode, dari: e.target.value })} />
                    </div>
                    <div className="periode-input">
                        <label>Sampai</label>
                        <input type="date" value={periode.sampai} onChange={(e) => setPeriode({ ...periode, sampai: e.target.value })} />
                    </div>
                    <button className="admin-btn-primary" onClick={fetchAll}>
                        <FiRefreshCw /> Terapkan ke Semua
                    </button>
                    <span className="laporan-periode-info">
                        Aktif: <strong>{labelPeriode}</strong> — memengaruhi Produk Terlaris & Per Kategori
                    </span>
                </div>

                {/* TAB: HARIAN */}
                {activeTab === 'harian' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Penjualan 7 Hari Terakhir</h2>
                            <ExportButtons tab="harian" />
                        </div>
                        {harian.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <>
                                <div className="laporan-chart">
                                    {harian.map((h, idx) => {
                                        const tinggi = maxHarian > 0 ? (Number(h.total_penjualan) / maxHarian) * 100 : 0;
                                        return (
                                            <div key={idx} className="chart-col">
                                                <span className="chart-value">{formatPrice(h.total_penjualan)}</span>
                                                <div className="chart-track"><div className="chart-fill" style={{ height: `${tinggi}%` }}></div></div>
                                                <span className="chart-label">{formatTanggal(h.tanggal)}</span>
                                                <span className="chart-sub">{h.jumlah_pesanan} pesanan</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <table className="admin-table" style={{ marginTop: 24 }}>
                                    <thead><tr><th>Tanggal</th><th>Jumlah Pesanan</th><th>Total Penjualan</th></tr></thead>
                                    <tbody>
                                        {harian.map((h, idx) => (
                                            <tr key={idx}>
                                                <td>{formatTanggal(h.tanggal)}</td>
                                                <td><strong>{h.jumlah_pesanan}</strong></td>
                                                <td>{formatPrice(h.total_penjualan)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                )}

                {/* TAB: BULANAN */}
                {activeTab === 'bulanan' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Penjualan 12 Bulan Terakhir</h2>
                            <ExportButtons tab="bulanan" />
                        </div>
                        {bulanan.length === 0 ? (
                            <p className="admin-empty">Belum ada data.</p>
                        ) : (
                            <>
                                <div className="laporan-chart">
                                    {bulanan.map((b, idx) => {
                                        const tinggi = maxBulanan > 0 ? (Number(b.total_penjualan) / maxBulanan) * 100 : 0;
                                        return (
                                            <div key={idx} className="chart-col">
                                                <span className="chart-value">{formatPrice(b.total_penjualan)}</span>
                                                <div className="chart-track"><div className="chart-fill" style={{ height: `${tinggi}%` }}></div></div>
                                                <span className="chart-label">{formatBulan(b.bulan)}</span>
                                                <span className="chart-sub">{b.jumlah_pesanan} pesanan</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <table className="admin-table" style={{ marginTop: 24 }}>
                                    <thead><tr><th>Bulan</th><th>Jumlah Pesanan</th><th>Total Penjualan</th></tr></thead>
                                    <tbody>
                                        {bulanan.map((b, idx) => (
                                            <tr key={idx}>
                                                <td>{formatBulan(b.bulan)}</td>
                                                <td><strong>{b.jumlah_pesanan}</strong></td>
                                                <td>{formatPrice(b.total_penjualan)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                )}

                {/* TAB: TERLARIS */}
                {activeTab === 'terlaris' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Produk Terlaris (Top 10) — {labelPeriode}</h2>
                            <ExportButtons tab="terlaris" />
                        </div>
                        {terlaris.length === 0 ? (
                            <p className="admin-empty">Belum ada data pada periode ini.</p>
                        ) : (
                            <table className="admin-table">
                                <thead><tr><th>Rank</th><th>Kode</th><th>Nama Produk</th><th>Harga Jual</th><th>Terjual</th><th>Pendapatan</th></tr></thead>
                                <tbody>
                                    {terlaris.map((p, idx) => (
                                        <tr key={p.id}>
                                            <td><strong>#{idx + 1}</strong></td>
                                            <td>{p.kode_produk || '-'}</td>
                                            <td>{p.nama_produk}</td>
                                            <td>{formatPrice(p.harga_jual)}</td>
                                            <td><strong>{p.total_terjual}</strong> unit</td>
                                            <td>{formatPrice(p.total_pendapatan)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB: KATEGORI */}
                {activeTab === 'kategori' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiPackage /> Pendapatan Per Kategori — {labelPeriode}</h2>
                            <ExportButtons tab="kategori" />
                        </div>
                        {perKategori.length === 0 ? (
                            <p className="admin-empty">Belum ada data pada periode ini.</p>
                        ) : (
                            <table className="admin-table">
                                <thead><tr><th>Kategori</th><th>Jumlah Pesanan</th><th>Item Terjual</th><th>Pendapatan</th></tr></thead>
                                <tbody>
                                    {perKategori.map((k) => (
                                        <tr key={k.id}>
                                            <td><strong>{k.nama_kategori || '-'}</strong></td>
                                            <td>{k.jumlah_pesanan || 0}</td>
                                            <td>{k.total_item_terjual || 0} unit</td>
                                            <td>{formatPrice(k.total_pendapatan)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB: STOK */}
                {activeTab === 'stok' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiAlertTriangle /> Produk Stok Menipis (Real-time)</h2>
                            <ExportButtons tab="stok" />
                        </div>
                        {stokKritis.length === 0 ? (
                            <p className="admin-empty">Semua stok aman.</p>
                        ) : (
                            <table className="admin-table">
                                <thead><tr><th>Kode</th><th>Produk</th><th>Stok</th><th>Stok Minimal</th><th>Selisih</th></tr></thead>
                                <tbody>
                                    {stokKritis.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.kode_produk || '-'}</td>
                                            <td>{p.nama_produk}</td>
                                            <td><strong style={{ color: '#ef4444' }}>{p.stok}</strong></td>
                                            <td>{p.stok_minimal}</td>
                                            <td><strong style={{ color: '#ef4444' }}>{(Number(p.stok_minimal) || 0) - (Number(p.stok) || 0)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB: PERIODE */}
                {activeTab === 'periode' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><FiTrendingUp /> Laporan Per Periode</h2>
                            {laporanPeriode && <ExportButtons tab="periode" />}
                        </div>
                        <div className="periode-filter">
                            <div className="periode-input">
                                <label>Dari</label>
                                <input type="date" value={periode.dari} onChange={(e) => setPeriode({ ...periode, dari: e.target.value })} />
                            </div>
                            <div className="periode-input">
                                <label>Sampai</label>
                                <input type="date" value={periode.sampai} onChange={(e) => setPeriode({ ...periode, sampai: e.target.value })} />
                            </div>
                            <button className="admin-btn-primary" onClick={fetchPeriode}>
                                <FiRefreshCw /> Tampilkan
                            </button>
                        </div>
                        {laporanPeriode ? (
                            <>
                                <div className="periode-summary">
                                    <div>
                                        <span>Jumlah Pesanan</span>
                                        <strong>{laporanPeriode.ringkasan.jumlah_pesanan || 0}</strong>
                                    </div>
                                    <div>
                                        <span>Total Penjualan</span>
                                        <strong>{formatPrice(laporanPeriode.ringkasan.total_penjualan)}</strong>
                                    </div>
                                </div>
                                <table className="admin-table" style={{ marginTop: 20 }}>
                                    <thead>
                                        <tr><th>Kode</th><th>Tanggal</th><th>Pembeli</th><th>Total</th><th>Diskon</th><th>Status</th><th>Voucher</th></tr>
                                    </thead>
                                    <tbody>
                                        {(laporanPeriode.detail || []).map(p => (
                                            <tr key={p.id}>
                                                <td><strong>{p.kode_pesanan}</strong></td>
                                                <td>{formatTanggalLengkap(p.tanggal)}</td>
                                                <td>{p.nama_pembeli || '-'}</td>
                                                <td>{formatPrice(p.total)}</td>
                                                <td>{formatPrice(p.diskon)}</td>
                                                <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                                                <td>{p.kode_voucher || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        ) : (
                            <p className="admin-empty">Pilih periode, lalu klik Tampilkan.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLaporan;