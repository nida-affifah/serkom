// backend/routes/laporan.js
const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { verifyToken, cekRole } = require('../middleware/auth');

router.use(verifyToken);
const bolehLaporan = cekRole('admin', 'kasir');
router.use(bolehLaporan);

// ═══════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════
router.get('/ringkasan', laporanController.ringkasan);
router.get('/dashboard', laporanController.dashboardLengkap);

// ═══════════════════════════════════════
// PEMASUKAN (endpoint baru)
// ═══════════════════════════════════════
router.get('/pemasukan/harian', laporanController.pemasukanHarian);
router.get('/pemasukan/bulanan', laporanController.pemasukanBulanan);
router.get('/pemasukan/periode', laporanController.pemasukanPeriode);
router.get('/pemasukan/kategori', laporanController.pemasukanPerKategori);
router.get('/pemasukan/produk-terlaris', laporanController.produkTerlaris);

// ═══════════════════════════════════════
// PENGELUARAN
// ═══════════════════════════════════════
router.get('/pengeluaran/harian', laporanController.pengeluaranHarian);
router.get('/pengeluaran/bulanan', laporanController.pengeluaranBulanan);
router.get('/pengeluaran/periode', laporanController.pengeluaranPeriode);
router.get('/pengeluaran/supplier', laporanController.pengeluaranPerSupplier);
router.get('/pengeluaran/bahan-terbanyak', laporanController.bahanTerbanyakDibeli);

// ═══════════════════════════════════════
// LABA / RUGI
// ═══════════════════════════════════════
router.get('/laba-rugi', laporanController.labaRugi);

// ═══════════════════════════════════════
// STOK
// ═══════════════════════════════════════
router.get('/stok/produk', laporanController.stokProduk);
router.get('/stok/bahan', laporanController.stokBahan);
router.get('/stok/menipis', laporanController.stokMenipis);

// ═══════════════════════════════════════
// LOG STOK
// ═══════════════════════════════════════
router.get('/log-stok', laporanController.logStok);

// ═══════════════════════════════════════
// AUDIT
// ═══════════════════════════════════════
router.get('/audit/pesanan', laporanController.pesananDenganPemesan);
router.get('/audit/aktivitas', laporanController.aktivitasUser);

// ═══════════════════════════════════════
// ALIAS (untuk frontend lama)
// ═══════════════════════════════════════
router.get('/harian', laporanController.pemasukanHarian);
router.get('/bulanan', laporanController.pemasukanBulanan);
router.get('/per-kategori', laporanController.pemasukanPerKategori);
router.get('/produk-terlaris', laporanController.produkTerlaris);
router.get('/stok-menipis', laporanController.stokMenipis);
router.get('/periode', laporanController.pemasukanPeriode);

module.exports = router;