const JasaCustom = require('../models/JasaCustom');

exports.getAllJasa = async (req, res) => {
    try {
        const data = await JasaCustom.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getJasaById = async (req, res) => {
    try {
        const data = await JasaCustom.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Jasa tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createJasa = async (req, res) => {
    try {
        const { nama_jasa, harga } = req.body;
        if (!nama_jasa || !harga) {
            return res.status(400).json({ sukses: false, pesan: 'nama_jasa dan harga wajib diisi' });
        }
        const data = await JasaCustom.create(req.body);
        res.status(201).json({ sukses: true, pesan: 'Jasa dibuat', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.updateJasa = async (req, res) => {
    try {
        const { nama_jasa, harga } = req.body;
        if (!nama_jasa || !harga) {
            return res.status(400).json({ sukses: false, pesan: 'nama_jasa dan harga wajib diisi' });
        }
        const data = await JasaCustom.update(req.params.id, req.body);
        res.json({ sukses: true, pesan: 'Jasa diupdate', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.deleteJasa = async (req, res) => {
    try {
        const berhasil = await JasaCustom.delete(req.params.id);
        if (!berhasil) return res.status(404).json({ sukses: false, pesan: 'Jasa tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Jasa dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};