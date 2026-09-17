const Alamat = require('../models/Alamat');

// GET /api/alamat - lihat semua alamat user
exports.getAlamatSaya = async (req, res) => {
    try {
        const data = await Alamat.findByUser(req.user.id);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/alamat/:id
exports.getAlamatById = async (req, res) => {
    try {
        const data = await Alamat.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Alamat tidak ditemukan' });

        if (data.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ sukses: false, pesan: 'Tidak punya akses' });
        }

        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// POST /api/alamat
exports.createAlamat = async (req, res) => {
    try {
        const { nama_penerima, no_hp, alamat_lengkap, provinsi, kota, kecamatan, kode_pos } = req.body;

        if (!nama_penerima || !no_hp || !alamat_lengkap || !provinsi || !kota || !kecamatan || !kode_pos) {
            return res.status(400).json({ sukses: false, pesan: 'Semua field wajib diisi' });
        }

        const data = await Alamat.create(req.user.id, req.body);
        res.status(201).json({ sukses: true, pesan: 'Alamat ditambahkan', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/alamat/:id
exports.updateAlamat = async (req, res) => {
    try {
        const data = await Alamat.update(req.params.id, req.user.id, req.body);
        res.json({ sukses: true, pesan: 'Alamat diupdate', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// DELETE /api/alamat/:id
exports.deleteAlamat = async (req, res) => {
    try {
        const berhasil = await Alamat.delete(req.params.id, req.user.id);
        if (!berhasil) return res.status(404).json({ sukses: false, pesan: 'Alamat tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Alamat dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/alamat/:id/default
exports.setDefault = async (req, res) => {
    try {
        const data = await Alamat.setDefault(req.params.id, req.user.id);
        res.json({ sukses: true, pesan: 'Alamat dijadikan default', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};