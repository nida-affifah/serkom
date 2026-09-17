// backend/controllers/pesananController.js
const Pesanan = require('../models/Pesanan');

// POST /api/pesanan (checkout langsung)
exports.createPesanan = async (req, res) => {
    try {
        const { items, catatan } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ sukses: false, pesan: 'Item pesanan kosong' });
        }

        for (const item of items) {
            if (!item.produk_id || !item.jumlah || item.jumlah < 1) {
                return res.status(400).json({ sukses: false, pesan: 'Format item tidak valid' });
            }
        }

        const pesanan = await Pesanan.create(req.user.id, items);
        res.status(201).json({
            sukses: true,
            pesan: 'Pesanan berhasil dibuat',
            data: pesanan
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// POST /api/pesanan/dari-keranjang (checkout dari keranjang)
exports.createPesananDariKeranjang = async (req, res) => {
    try {
        const { catatan, voucher_kode } = req.body;
        const pesanan = await Pesanan.createFromKeranjang(
            req.user.id,
            catatan,
            voucher_kode || null
        );
        res.status(201).json({
            sukses: true,
            pesan: 'Checkout dari keranjang berhasil',
            data: pesanan
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pesanan - admin
exports.getAllPesanan = async (req, res) => {
    try {
        const pesanan = await Pesanan.findAll();
        res.json({ sukses: true, jumlah: pesanan.length, data: pesanan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pesanan/saya - user login
exports.getPesananSaya = async (req, res) => {
    try {
        const pesanan = await Pesanan.findByUser(req.user.id);
        res.json({ sukses: true, jumlah: pesanan.length, data: pesanan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pesanan/:id - admin atau pemilik
exports.getPesananById = async (req, res) => {
    try {
        const pesanan = await Pesanan.findById(req.params.id);
        if (!pesanan) {
            return res.status(404).json({ sukses: false, pesan: 'Pesanan tidak ditemukan' });
        }

        const bolehSemua = ['admin', 'kasir'].includes(req.user.role);
        if (!bolehSemua && pesanan.user_id !== req.user.id) {
            return res.status(403).json({ sukses: false, pesan: 'Tidak punya akses' });
        }

        res.json({ sukses: true, data: pesanan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/pesanan/:id/status - admin
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ sukses: false, pesan: 'Status wajib diisi' });
        }

        const pesanan = await Pesanan.updateStatus(req.params.id, status);
        if (!pesanan) {
            return res.status(404).json({ sukses: false, pesan: 'Pesanan tidak ditemukan' });
        }

        res.json({ sukses: true, pesan: 'Status diupdate', data: pesanan });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};