const Pembayaran = require('../models/Pembayaran');
const Pesanan = require('../models/Pesanan');

// POST /api/pembayaran - pembeli upload bukti transfer
exports.createPembayaran = async (req, res) => {
    try {
        const { pesanan_id, metode_id, jumlah_bayar, bukti_transfer } = req.body;

        if (!pesanan_id || !jumlah_bayar) {
            return res.status(400).json({ sukses: false, pesan: 'pesanan_id dan jumlah_bayar wajib diisi' });
        }

        // Cek pesanan milik user
        const pesanan = await Pesanan.findById(pesanan_id);
        if (!pesanan) {
            return res.status(404).json({ sukses: false, pesan: 'Pesanan tidak ditemukan' });
        }
        if (pesanan.user_id !== req.user.id) {
            return res.status(403).json({ sukses: false, pesan: 'Pesanan bukan milik Anda' });
        }

        const data = await Pembayaran.create(pesanan_id, metode_id, jumlah_bayar, bukti_transfer);
        res.status(201).json({ sukses: true, pesan: 'Pembayaran dibuat, menunggu verifikasi admin', data });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pembayaran - admin lihat semua
exports.getAllPembayaran = async (req, res) => {
    try {
        const { status } = req.query;
        const data = await Pembayaran.findAll(status);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pembayaran/:id
exports.getPembayaranById = async (req, res) => {
    try {
        const data = await Pembayaran.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Pembayaran tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pembayaran/pesanan/:pesananId
exports.getPembayaranByPesanan = async (req, res) => {
    try {
        const data = await Pembayaran.findByPesanan(req.params.pesananId);
        // Belum ada pembayaran bukan error — kembalikan null
        res.json({ sukses: true, data: data || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/pembayaran/:id/verifikasi - admin
exports.verifikasiPembayaran = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ sukses: false, pesan: 'Status wajib diisi' });
        }
        const data = await Pembayaran.verifikasi(req.params.id, status);
        res.json({
            sukses: true,
            pesan: `Pembayaran diverifikasi: ${status}. Status pesanan otomatis diupdate.`,
            data
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};