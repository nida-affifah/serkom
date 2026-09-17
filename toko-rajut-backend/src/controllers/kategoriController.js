const Kategori = require('../models/Kategori');

exports.getAllKategori = async (req, res) => {
    try {
        const kategori = await Kategori.findAll();
        res.json({ sukses: true, jumlah: kategori.length, data: kategori });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getKategoriById = async (req, res) => {
    try {
        const kategori = await Kategori.findById(req.params.id);
        if (!kategori) {
            return res.status(404).json({ sukses: false, pesan: 'Kategori tidak ditemukan' });
        }
        res.json({ sukses: true, data: kategori });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createKategori = async (req, res) => {
    try {
        const { nama_kategori, deskripsi, gambar } = req.body;
        if (!nama_kategori) {
            return res.status(400).json({ sukses: false, pesan: 'Nama kategori wajib diisi' });
        }
        const kategori = await Kategori.create({ nama_kategori, deskripsi, gambar });
        res.status(201).json({ sukses: true, pesan: 'Kategori dibuat', data: kategori });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.updateKategori = async (req, res) => {
    try {
        const { nama_kategori, deskripsi, gambar } = req.body;
        if (!nama_kategori) {
            return res.status(400).json({ sukses: false, pesan: 'Nama kategori wajib diisi' });
        }
        const kategori = await Kategori.update(req.params.id, { nama_kategori, deskripsi, gambar });
        res.json({ sukses: true, pesan: 'Kategori diupdate', data: kategori });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.deleteKategori = async (req, res) => {
    try {
        const berhasil = await Kategori.delete(req.params.id);
        if (!berhasil) {
            return res.status(404).json({ sukses: false, pesan: 'Kategori tidak ditemukan' });
        }
        res.json({ sukses: true, pesan: 'Kategori dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};