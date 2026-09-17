// backend/controllers/bahanController.js
const Bahan = require('../models/Bahan');

// GET /api/bahan
exports.getAllBahan = async (req, res) => {
    try {
        const data = await Bahan.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/bahan/:id
exports.getBahanById = async (req, res) => {
    try {
        const data = await Bahan.findById(req.params.id);
        if (!data) {
            return res.status(404).json({ sukses: false, pesan: 'Bahan tidak ditemukan' });
        }
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// POST /api/bahan
exports.createBahan = async (req, res) => {
    try {
        const { nama_bahan } = req.body;
        if (!nama_bahan) {
            return res.status(400).json({ sukses: false, pesan: 'Nama bahan wajib diisi' });
        }
        const data = await Bahan.create(req.body);
        res.status(201).json({
            sukses: true,
            pesan: 'Bahan dibuat',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/bahan/:id
exports.updateBahan = async (req, res) => {
    try {
        const { nama_bahan } = req.body;
        if (!nama_bahan) {
            return res.status(400).json({ sukses: false, pesan: 'Nama bahan wajib diisi' });
        }
        const data = await Bahan.update(req.params.id, req.body);
        if (!data) {
            return res.status(404).json({ sukses: false, pesan: 'Bahan tidak ditemukan' });
        }
        res.json({ sukses: true, pesan: 'Bahan diupdate', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// DELETE /api/bahan/:id
exports.deleteBahan = async (req, res) => {
    try {
        const berhasil = await Bahan.delete(req.params.id);
        if (!berhasil) {
            return res.status(404).json({ sukses: false, pesan: 'Bahan tidak ditemukan' });
        }
        res.json({ sukses: true, pesan: 'Bahan dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};