const Pengiriman = require('../models/Pengiriman');
const Pesanan = require('../models/Pesanan');

// POST /api/pengiriman - admin
exports.createPengiriman = async (req, res) => {
    try {
        const { pesanan_id, kurir_id, no_resi, alamat_kirim } = req.body;

        if (!pesanan_id || !kurir_id || !no_resi) {
            return res.status(400).json({ sukses: false, pesan: 'pesanan_id, kurir_id, dan no_resi wajib diisi' });
        }

        const data = await Pengiriman.create(pesanan_id, kurir_id, no_resi, alamat_kirim);
        res.status(201).json({
            sukses: true,
            pesan: 'Pengiriman dibuat. Status pesanan otomatis jadi "dikirim".',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pengiriman - admin
exports.getAllPengiriman = async (req, res) => {
    try {
        const { status } = req.query;
        const data = await Pengiriman.findAll(status);
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pengiriman/:id
exports.getPengirimanById = async (req, res) => {
    try {
        const data = await Pengiriman.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Pengiriman tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// GET /api/pengiriman/pesanan/:pesananId - pembeli lacak
exports.getPengirimanByPesanan = async (req, res) => {
    try {
        const pesanan = await Pesanan.findById(req.params.pesananId);
        if (!pesanan) return res.status(404).json({ sukses: false, pesan: 'Pesanan tidak ditemukan' });

        // Admin & kasir boleh lihat semua pengiriman
        const bolehSemua = ['admin', 'kasir'].includes(req.user.role);
        if (!bolehSemua && pesanan.user_id !== req.user.id) {
            return res.status(403).json({ sukses: false, pesan: 'Tidak punya akses' });
        }

        const data = await Pengiriman.findByPesanan(req.params.pesananId);
        // Belum ada pengiriman bukan error
        res.json({ sukses: true, data: data || null });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

// PUT /api/pengiriman/:id/sampai - admin
exports.tandaiSampai = async (req, res) => {
    try {
        const data = await Pengiriman.tandaiSampai(req.params.id);
        res.json({
            sukses: true,
            pesan: 'Pengiriman ditandai sampai. Status pesanan otomatis jadi "selesai".',
            data
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ sukses: false, pesan: err.message });
    }
};