// backend/controllers/pembelianController.js
const Pembelian = require('../models/Pembelian');

exports.getAllPembelian = async (req, res) => {
    try {
        const data = await Pembelian.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getPembelianById = async (req, res) => {
    try {
        const data = await Pembelian.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Pembelian tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createPembelian = async (req, res) => {
    try {
        const { supplier_id, items, catatan } = req.body;

        if (!supplier_id) {
            return res.status(400).json({ sukses: false, pesan: 'Supplier wajib dipilih' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ sukses: false, pesan: 'Item pembelian kosong' });
        }

        // Validasi: nama_bahan, jumlah, harga_beli wajib
        for (const item of items) {
            if (!item.nama_bahan || !item.nama_bahan.trim()) {
                return res.status(400).json({ sukses: false, pesan: 'Nama bahan wajib diisi' });
            }
            if (!item.jumlah || item.jumlah < 1) {
                return res.status(400).json({ sukses: false, pesan: 'Jumlah bahan minimal 1' });
            }
            if (!item.harga_beli || item.harga_beli < 1) {
                return res.status(400).json({ sukses: false, pesan: 'Harga beli wajib diisi' });
            }
        }

        const data = await Pembelian.create(supplier_id, items, catatan);
        res.status(201).json({ sukses: true, pesan: 'PO bahan dibuat', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

exports.terimaPembelian = async (req, res) => {
    try {
        const data = await Pembelian.terima(req.params.id);
        res.json({
            sukses: true,
            pesan: 'Pembelian diterima. Stok bahan sudah bertambah.',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};