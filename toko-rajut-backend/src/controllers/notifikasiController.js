const Notifikasi = require('../models/Notifikasi');

exports.getNotifikasiSaya = async (req, res) => {
    try {
        const data = await Notifikasi.findByUser(req.user.id);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getJumlahBelumDibaca = async (req, res) => {
    try {
        const jumlah = await Notifikasi.countBelumDibaca(req.user.id);
        res.json({ sukses: true, jumlah_belum_dibaca: jumlah });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.tandaiBaca = async (req, res) => {
    try {
        const berhasil = await Notifikasi.tandaiBaca(req.params.id, req.user.id);
        if (!berhasil) return res.status(404).json({ sukses: false, pesan: 'Notifikasi tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Notifikasi ditandai sudah dibaca' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.tandaiSemuaBaca = async (req, res) => {
    try {
        const jumlah = await Notifikasi.tandaiSemuaBaca(req.user.id);
        res.json({ sukses: true, pesan: `${jumlah} notifikasi ditandai sudah dibaca` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.hapusNotifikasi = async (req, res) => {
    try {
        const berhasil = await Notifikasi.hapus(req.params.id, req.user.id);
        if (!berhasil) return res.status(404).json({ sukses: false, pesan: 'Notifikasi tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Notifikasi dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.hapusSemua = async (req, res) => {
    try {
        const jumlah = await Notifikasi.hapusSemua(req.user.id);
        res.json({ sukses: true, pesan: `${jumlah} notifikasi dihapus` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// Admin: kirim notifikasi manual ke user
exports.kirimNotifikasi = async (req, res) => {
    try {
        const { user_id, judul, pesan, tipe } = req.body;
        if (!user_id || !judul || !pesan) {
            return res.status(400).json({ sukses: false, pesan: 'user_id, judul, pesan wajib diisi' });
        }
        const data = await Notifikasi.create(user_id, judul, pesan, tipe);
        res.status(201).json({ sukses: true, pesan: 'Notifikasi dikirim', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};