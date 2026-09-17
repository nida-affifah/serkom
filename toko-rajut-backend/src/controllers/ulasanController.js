const Ulasan = require('../models/Ulasan');

// POST /api/ulasan - pembeli kasih ulasan
exports.createUlasan = async (req, res) => {
    try {
        const { produk_id, rating, komentar } = req.body;

        if (!produk_id || !rating) {
            return res.status(400).json({ sukses: false, pesan: 'produk_id dan rating wajib diisi' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ sukses: false, pesan: 'Rating harus 1 sampai 5' });
        }

        const data = await Ulasan.create(req.user.id, produk_id, rating, komentar);
        res.status(201).json({ sukses: true, pesan: 'Ulasan berhasil dikirim', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/ulasan/produk/:produkId - publik
exports.getUlasanProduk = async (req, res) => {
    try {
        const data = await Ulasan.findByProduk(req.params.produkId);
        const ringkasan = await Ulasan.ringkasanProduk(req.params.produkId);
        res.json({ sukses: true, ringkasan, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/ulasan/saya - pembeli
exports.getUlasanSaya = async (req, res) => {
    try {
        const data = await Ulasan.findByUser(req.user.id);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/ulasan - admin
exports.getAllUlasan = async (req, res) => {
    try {
        const data = await Ulasan.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// DELETE /api/ulasan/:id - admin
exports.deleteUlasan = async (req, res) => {
    try {
        const berhasil = await Ulasan.delete(req.params.id);
        if (!berhasil) return res.status(404).json({ sukses: false, pesan: 'Ulasan tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Ulasan dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};