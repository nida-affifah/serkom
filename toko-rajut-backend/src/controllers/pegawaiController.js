const Pegawai = require('../models/Pegawai');

// ============ PERAJIN ============
exports.getAllPerajin = async (req, res) => {
    try {
        const data = await Pegawai.getAllPerajin();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getPerajinById = async (req, res) => {
    try {
        const data = await Pegawai.getPerajinById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Perajin tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createPerajin = async (req, res) => {
    try {
        if (!req.body.nama_perajin) return res.status(400).json({ sukses: false, pesan: 'Nama wajib diisi' });
        const data = await Pegawai.createPerajin(req.body);
        res.status(201).json({ sukses: true, pesan: 'Perajin dibuat', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.updatePerajin = async (req, res) => {
    try {
        const data = await Pegawai.updatePerajin(req.params.id, req.body);
        res.json({ sukses: true, pesan: 'Perajin diupdate', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.deletePerajin = async (req, res) => {
    try {
        const ok = await Pegawai.deletePerajin(req.params.id);
        if (!ok) return res.status(404).json({ sukses: false, pesan: 'Perajin tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Perajin dihapus' });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============ KASIR ============
exports.getAllKasir = async (req, res) => {
    try {
        const data = await Pegawai.getAllKasir();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getKasirById = async (req, res) => {
    try {
        const data = await Pegawai.getKasirById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Kasir tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createKasir = async (req, res) => {
    try {
        if (!req.body.nama) return res.status(400).json({ sukses: false, pesan: 'Nama wajib diisi' });
        const data = await Pegawai.createKasir(req.body);
        res.status(201).json({ sukses: true, pesan: 'Kasir dibuat', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.updateKasir = async (req, res) => {
    try {
        const data = await Pegawai.updateKasir(req.params.id, req.body);
        res.json({ sukses: true, pesan: 'Kasir diupdate', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.deleteKasir = async (req, res) => {
    try {
        const ok = await Pegawai.deleteKasir(req.params.id);
        if (!ok) return res.status(404).json({ sukses: false, pesan: 'Kasir tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Kasir dihapus' });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// ============ STAFF GUDANG ============
exports.getAllStaff = async (req, res) => {
    try {
        const data = await Pegawai.getAllStaff();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const data = await Pegawai.getStaffById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Staff tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        if (!req.body.nama) return res.status(400).json({ sukses: false, pesan: 'Nama wajib diisi' });
        const data = await Pegawai.createStaff(req.body);
        res.status(201).json({ sukses: true, pesan: 'Staff dibuat', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const data = await Pegawai.updateStaff(req.params.id, req.body);
        res.json({ sukses: true, pesan: 'Staff diupdate', data });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const ok = await Pegawai.deleteStaff(req.params.id);
        if (!ok) return res.status(404).json({ sukses: false, pesan: 'Staff tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Staff dihapus' });
    } catch (err) {
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};