// backend/controllers/laporanController.js
const Laporan = require('../models/Laporan');

// ═══════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════

// GET /api/laporan/ringkasan
exports.ringkasan = async (req, res) => {
    try {
        const data = await Laporan.ringkasan();
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/dashboard
exports.dashboardLengkap = async (req, res) => {
    try {
        const data = await Laporan.dashboardLengkap();
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// PEMASUKAN (PENJUALAN)
// ═══════════════════════════════════════

// GET /api/laporan/pemasukan/harian
exports.pemasukanHarian = async (req, res) => {
    try {
        const data = await Laporan.pemasukanHarian();
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pemasukan/bulanan
exports.pemasukanBulanan = async (req, res) => {
    try {
        const data = await Laporan.pemasukanBulanan();
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pemasukan/periode?dari=&sampai=
exports.pemasukanPeriode = async (req, res) => {
    try {
        const { dari, sampai } = req.query;
        if (!dari || !sampai) {
            return res.status(400).json({
                sukses: false,
                pesan: 'Parameter dari dan sampai wajib diisi'
            });
        }
        const data = await Laporan.pemasukanPeriode(dari, sampai);
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pemasukan/kategori
exports.pemasukanPerKategori = async (req, res) => {
    try {
        const { dari, sampai } = req.query;
        const data = await Laporan.pemasukanPerKategori(dari, sampai);
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pemasukan/produk-terlaris?limit=5
exports.produkTerlaris = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const { dari, sampai } = req.query;
        const data = await Laporan.produkTerlaris(limit, dari, sampai);
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// PENGELUARAN (PEMBELIAN BAHAN)
// ═══════════════════════════════════════

// GET /api/laporan/pengeluaran/harian
exports.pengeluaranHarian = async (req, res) => {
    try {
        const data = await Laporan.pengeluaranHarian();
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pengeluaran/bulanan
exports.pengeluaranBulanan = async (req, res) => {
    try {
        const data = await Laporan.pengeluaranBulanan();
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pengeluaran/periode?dari=&sampai=
exports.pengeluaranPeriode = async (req, res) => {
    try {
        const { dari, sampai } = req.query;
        if (!dari || !sampai) {
            return res.status(400).json({
                sukses: false,
                pesan: 'Parameter dari dan sampai wajib diisi'
            });
        }
        const data = await Laporan.pengeluaranPeriode(dari, sampai);
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pengeluaran/supplier
exports.pengeluaranPerSupplier = async (req, res) => {
    try {
        const { dari, sampai } = req.query;
        const data = await Laporan.pengeluaranPerSupplier(dari, sampai);
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/pengeluaran/bahan-terbanyak
exports.bahanTerbanyakDibeli = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = await Laporan.bahanTerbanyakDibeli(limit);
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// LABA / RUGI
// ═══════════════════════════════════════

// GET /api/laporan/laba-rugi?dari=&sampai=
exports.labaRugi = async (req, res) => {
    try {
        const { dari, sampai } = req.query;
        if (!dari || !sampai) {
            return res.status(400).json({
                sukses: false,
                pesan: 'Parameter dari dan sampai wajib diisi'
            });
        }
        const data = await Laporan.labaRugi(dari, sampai);
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// STOK
// ═══════════════════════════════════════

// GET /api/laporan/stok/produk
exports.stokProduk = async (req, res) => {
    try {
        const data = await Laporan.stokProduk();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/stok/bahan
exports.stokBahan = async (req, res) => {
    try {
        const data = await Laporan.stokBahan();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/stok/menipis
exports.stokMenipis = async (req, res) => {
    try {
        const data = await Laporan.stokMenipis();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// LOG STOK
// ═══════════════════════════════════════

// GET /api/laporan/log-stok?dari=&sampai=&tipe_entitas=&tipe=&entitas_id=&limit=
exports.logStok = async (req, res) => {
    try {
        const filters = {
            dari: req.query.dari,
            sampai: req.query.sampai,
            tipe_entitas: req.query.tipe_entitas,
            tipe: req.query.tipe,
            entitas_id: req.query.entitas_id ? parseInt(req.query.entitas_id) : null,
            limit: parseInt(req.query.limit) || 100
        };
        const data = await Laporan.logStok(filters);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// AUDIT
// ═══════════════════════════════════════

// GET /api/laporan/audit/pesanan?dari=&sampai=&status=
exports.pesananDenganPemesan = async (req, res) => {
    try {
        const filters = {
            dari: req.query.dari,
            sampai: req.query.sampai,
            status: req.query.status
        };
        const data = await Laporan.pesananDenganPemesan(filters);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/laporan/audit/aktivitas?dari=&sampai=&user_id=&aksi=&entitas=
exports.aktivitasUser = async (req, res) => {
    try {
        const filters = {
            dari: req.query.dari,
            sampai: req.query.sampai,
            user_id: req.query.user_id ? parseInt(req.query.user_id) : null,
            aksi: req.query.aksi,
            entitas: req.query.entitas,
            limit: parseInt(req.query.limit) || 100
        };
        const data = await Laporan.aktivitasUser(filters);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};