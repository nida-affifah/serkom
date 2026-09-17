// backend/controllers/voucherController.js
const Voucher = require('../models/Voucher');

// ═══════════════════════════════════════
// GET /api/voucher/aktif — PUBLIK
// Untuk halaman beranda (pembeli lihat voucher tersedia)
// ═══════════════════════════════════════
exports.getVoucherAktif = async (req, res) => {
    try {
        const data = await Voucher.findAktif();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// GET /api/voucher - admin
// ═══════════════════════════════════════
exports.getAllVoucher = async (req, res) => {
    try {
        const data = await Voucher.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/voucher/:id - admin
exports.getVoucherById = async (req, res) => {
    try {
        const data = await Voucher.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Voucher tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// POST /api/voucher - admin
exports.createVoucher = async (req, res) => {
    try {
        const { kode } = req.body;
        if (!kode) {
            return res.status(400).json({ sukses: false, pesan: 'Kode voucher wajib diisi' });
        }

        const existing = await Voucher.findByKode(kode);
        if (existing) {
            return res.status(400).json({ sukses: false, pesan: 'Kode voucher sudah ada' });
        }

        const data = await Voucher.create(req.body);
        res.status(201).json({ sukses: true, pesan: 'Voucher dibuat', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/voucher/:id - admin
exports.updateVoucher = async (req, res) => {
    try {
        const { kode } = req.body;
        if (!kode) {
            return res.status(400).json({ sukses: false, pesan: 'Kode voucher wajib diisi' });
        }
        const data = await Voucher.update(req.params.id, req.body);
        res.json({ sukses: true, pesan: 'Voucher diupdate', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// DELETE /api/voucher/:id - admin
exports.deleteVoucher = async (req, res) => {
    try {
        const berhasil = await Voucher.delete(req.params.id);
        if (!berhasil) return res.status(404).json({ sukses: false, pesan: 'Voucher tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Voucher dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// POST /api/voucher/cek - pembeli cek validitas
exports.cekVoucher = async (req, res) => {
    try {
        const { kode, total_belanja } = req.body;

        if (!kode || !total_belanja) {
            return res.status(400).json({ sukses: false, pesan: 'kode dan total_belanja wajib diisi' });
        }

        const hasil = await Voucher.cekValiditas(kode, total_belanja);
        res.json({ sukses: true, pesan: 'Voucher valid', data: hasil });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};