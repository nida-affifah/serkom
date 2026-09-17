const Retur = require('../models/Retur');

// POST /api/retur - pembeli ajukan
exports.ajukanRetur = async (req, res) => {
    try {
        const { pesanan_id, alasan_id, jenis, catatan, items } = req.body;

        if (!pesanan_id || !alasan_id || !jenis) {
            return res.status(400).json({ sukses: false, pesan: 'pesanan_id, alasan_id, dan jenis wajib diisi' });
        }
        if (!['refund', 'tukar_barang'].includes(jenis)) {
            return res.status(400).json({ sukses: false, pesan: 'Jenis harus refund atau tukar_barang' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ sukses: false, pesan: 'Item retur kosong' });
        }

        const data = await Retur.ajukan(req.user.id, pesanan_id, alasan_id, jenis, catatan, items);
        res.status(201).json({ sukses: true, pesan: 'Pengajuan retur berhasil', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/retur/saya - pembeli
exports.getReturSaya = async (req, res) => {
    try {
        const data = await Retur.findByUser(req.user.id);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/retur - admin
exports.getAllRetur = async (req, res) => {
    try {
        const data = await Retur.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/retur/:id
exports.getReturById = async (req, res) => {
    try {
        const data = await Retur.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Retur tidak ditemukan' });

        if (req.user.role !== 'admin' && data.user_id !== req.user.id) {
            return res.status(403).json({ sukses: false, pesan: 'Tidak punya akses' });
        }

        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/retur/:id/setujui - admin
exports.setujuiRetur = async (req, res) => {
    try {
        const data = await Retur.setujui(req.params.id, req.body.catatan_admin);
        res.json({ sukses: true, pesan: 'Retur disetujui', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/retur/:id/tolak - admin
exports.tolakRetur = async (req, res) => {
    try {
        const data = await Retur.tolak(req.params.id, req.body.catatan_admin);
        res.json({ sukses: true, pesan: 'Retur ditolak', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/retur/:id/terima-barang - admin (stok otomatis)
exports.terimaBarang = async (req, res) => {
    try {
        const data = await Retur.terimaBarang(req.params.id, req.body.catatan_admin);
        res.json({
            sukses: true,
            pesan: 'Barang retur diterima. Stok bagus sudah dikembalikan, barang rusak dicatat.',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// POST /api/retur/:id/refund - admin
exports.prosesRefund = async (req, res) => {
    try {
        const { jumlah, metode, bukti } = req.body;
        if (!jumlah) {
            return res.status(400).json({ sukses: false, pesan: 'Jumlah refund wajib diisi' });
        }
        const data = await Retur.prosesRefund(req.params.id, jumlah, metode, bukti);
        res.json({ sukses: true, pesan: 'Refund berhasil diproses', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};