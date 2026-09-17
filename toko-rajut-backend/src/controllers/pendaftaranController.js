const Pendaftaran = require('../models/Pendaftaran');

exports.getAllPendaftaran = async (req, res) => {
    try {
        const data = await Pendaftaran.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getPendaftaranById = async (req, res) => {
    try {
        const data = await Pendaftaran.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Pendaftaran tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createPendaftaran = async (req, res) => {
    try {
        const { nama_lengkap, email } = req.body;
        if (!nama_lengkap || !email) {
            return res.status(400).json({ sukses: false, pesan: 'nama_lengkap dan email wajib diisi' });
        }
        const data = await Pendaftaran.create(req.user.id, req.body);
        res.status(201).json({ sukses: true, pesan: 'Pendaftaran dibuat', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.verifikasiPendaftaran = async (req, res) => {
    try {
        const data = await Pendaftaran.verifikasi(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Pendaftaran tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Pendaftaran diverifikasi', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};