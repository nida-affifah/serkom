const pool = require('../config/database');

// GET /api/master/alasan-retur
exports.getAlasanRetur = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nama_alasan, perlu_foto FROM alasan_retur WHERE status = 'aktif'`
        );
        res.json({ sukses: true, jumlah: rows.length, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/master/metode-bayar
exports.getMetodeBayar = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nama_metode, tipe FROM metode_bayar WHERE status = 'aktif'`
        );
        res.json({ sukses: true, jumlah: rows.length, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/master/kurir
exports.getKurir = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nama_kurir, ongkir_per_kg FROM kurir WHERE status = 'aktif'`
        );
        res.json({ sukses: true, jumlah: rows.length, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/master/pengaturan
exports.getPengaturan = async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT kunci, nilai, keterangan FROM pengaturan`);
        const pengaturan = {};
        rows.forEach(r => pengaturan[r.kunci] = r.nilai);
        res.json({ sukses: true, data: pengaturan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};