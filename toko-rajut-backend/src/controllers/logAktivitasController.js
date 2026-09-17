const LogAktivitas = require('../models/LogAktivitas');

exports.getAllLog = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const data = await LogAktivitas.findAll(limit);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.catatLog = async (req, res) => {
    try {
        const { aksi, tabel, record_id, keterangan } = req.body;
        if (!aksi) return res.status(400).json({ sukses: false, pesan: 'aksi wajib diisi' });
        const ip = req.ip || req.connection.remoteAddress;
        await LogAktivitas.catat(req.user.id, aksi, tabel, record_id, keterangan, ip);
        res.status(201).json({ sukses: true, pesan: 'Log dicatat' });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.hapusSemuaLog = async (req, res) => {
    try {
        const jumlah = await LogAktivitas.hapusSemua();
        res.json({ sukses: true, pesan: `${jumlah} log dihapus` });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};