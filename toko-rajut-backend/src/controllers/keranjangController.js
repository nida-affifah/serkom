// backend/controllers/keranjangController.js
const Keranjang = require('../models/Keranjang');

exports.getKeranjang = async (req, res) => {
    try {
        const items = await Keranjang.findByUser(req.user.id);
        const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const adaMasalah = items.some(i => i.status_stok !== 'tersedia');
        res.json({
            sukses: true,
            jumlah: items.length,
            total,
            ada_masalah: adaMasalah,
            data: items
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.tambahKeranjang = async (req, res) => {
    try {
        const { produk_id, jumlah } = req.body;
        if (!produk_id || !jumlah || jumlah < 1) {
            return res.status(400).json({ sukses: false, pesan: 'produk_id dan jumlah wajib diisi' });
        }
        const hasil = await Keranjang.tambah(req.user.id, produk_id, jumlah);
        const items = await Keranjang.findByUser(req.user.id);
        res.status(201).json({
            sukses: true,
            pesan: hasil.aksi === 'tambah' ? 'Produk ditambahkan ke keranjang' : 'Jumlah di keranjang diupdate',
            data: items
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

exports.updateJumlah = async (req, res) => {
    try {
        const { jumlah } = req.body;
        if (!jumlah || jumlah < 1) {
            return res.status(400).json({ sukses: false, pesan: 'Jumlah minimal 1' });
        }
        await Keranjang.updateJumlah(req.params.id, req.user.id, jumlah);
        const items = await Keranjang.findByUser(req.user.id);
        const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        res.json({
            sukses: true,
            pesan: 'Jumlah diupdate',
            total,
            data: items
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

exports.hapusItem = async (req, res) => {
    try {
        const berhasil = await Keranjang.hapus(req.params.id, req.user.id);
        if (!berhasil) {
            return res.status(404).json({ sukses: false, pesan: 'Item tidak ditemukan' });
        }
        const items = await Keranjang.findByUser(req.user.id);
        const total = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        res.json({
            sukses: true,
            pesan: 'Item dihapus',
            total,
            data: items
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.kosongkanKeranjang = async (req, res) => {
    try {
        const jumlah = await Keranjang.kosongkan(req.user.id);
        res.json({
            sukses: true,
            pesan: `Keranjang dikosongkan. ${jumlah} item dihapus.`,
            data: []
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// CEK VALID (sebelum checkout)
// ═══════════════════════════════════════
exports.cekValid = async (req, res) => {
    try {
        const hasil = await Keranjang.cekValid(req.user.id);
        res.json({ sukses: true, ...hasil });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};