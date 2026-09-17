// backend/controllers/produkController.js
const Produk = require('../models/Produk');

exports.getAllProduk = async (req, res) => {
    try {
        const role = req.user?.role;
        let produk;
        if (role === 'admin' || role === 'staff_gudang') {
            produk = await Produk.findAll();
        } else {
            produk = await Produk.findAllSiapJual();
        }
        res.json({ sukses: true, jumlah: produk.length, data: produk });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getProdukById = async (req, res) => {
    try {
        const role = req.user?.role;
        let produk;
        if (role === 'admin' || role === 'staff_gudang') {
            produk = await Produk.findById(req.params.id);
        } else {
            produk = await Produk.findByIdSiapJual(req.params.id);
        }
        if (!produk) {
            return res.status(404).json({
                sukses: false,
                pesan: 'Produk tidak ditemukan atau belum siap jual'
            });
        }
        res.json({ sukses: true, data: produk });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getProdukByKategori = async (req, res) => {
    try {
        const role = req.user?.role;
        let produk;
        if (role === 'admin' || role === 'staff_gudang') {
            produk = await Produk.findByKategori(req.params.kategoriId);
        } else {
            produk = await Produk.findByKategoriSiapJual(req.params.kategoriId);
        }
        res.json({ sukses: true, jumlah: produk.length, data: produk });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.uploadGambar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ sukses: false, pesan: 'File gambar wajib diupload' });
        }
        const urlGambar = `/uploads/${req.file.filename}`;
        res.json({
            sukses: true,
            pesan: 'Gambar berhasil diupload',
            data: { url: urlGambar, filename: req.file.filename }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// CREATE PRODUK + RESEP
// ═══════════════════════════════════════
exports.createProduk = async (req, res) => {
    try {
        const {
            nama_produk, margin, jumlah_produksi, resep
        } = req.body;

        if (!nama_produk) {
            return res.status(400).json({ sukses: false, pesan: 'Nama produk wajib diisi' });
        }
        if (!margin || margin < 0) {
            return res.status(400).json({ sukses: false, pesan: 'Margin wajib diisi' });
        }
        if (!resep || !Array.isArray(resep) || resep.length === 0) {
            return res.status(400).json({ sukses: false, pesan: 'Resep wajib diisi minimal 1 bahan' });
        }
        if (!jumlah_produksi || jumlah_produksi < 1) {
            return res.status(400).json({ sukses: false, pesan: 'Jumlah produksi minimal 1' });
        }

        const data = await Produk.create(req.body);
        res.status(201).json({
            sukses: true,
            pesan: 'Produk dibuat & stok bahan sudah dipotong',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

exports.updateProduk = async (req, res) => {
    try {
        const { nama_produk, margin } = req.body;
        if (!nama_produk) {
            return res.status(400).json({ sukses: false, pesan: 'Nama produk wajib diisi' });
        }
        if (!margin || margin < 0) {
            return res.status(400).json({ sukses: false, pesan: 'Margin wajib diisi' });
        }

        const data = await Produk.update(req.params.id, req.body);
        if (!data) {
            return res.status(404).json({ sukses: false, pesan: 'Produk tidak ditemukan' });
        }
        res.json({ sukses: true, pesan: 'Produk diupdate', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.deleteProduk = async (req, res) => {
    try {
        const berhasil = await Produk.delete(req.params.id);
        if (!berhasil) {
            return res.status(404).json({ sukses: false, pesan: 'Produk tidak ditemukan' });
        }
        res.json({ sukses: true, pesan: 'Produk dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ═══════════════════════════════════════
// PRODUKSI ULANG (pakai resep tersimpan)
// ═══════════════════════════════════════
exports.produksiUlang = async (req, res) => {
    try {
        const { jumlah } = req.body;
        if (!jumlah || jumlah < 1) {
            return res.status(400).json({ sukses: false, pesan: 'Jumlah produksi minimal 1' });
        }

        const data = await Produk.produksiUlang(req.params.id, jumlah);
        res.json({
            sukses: true,
            pesan: `Produksi ${jumlah} unit berhasil. Stok bahan sudah dipotong.`,
            data
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};