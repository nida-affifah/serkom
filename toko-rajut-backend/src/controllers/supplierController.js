const Supplier = require('../models/Supplier');

exports.getAllSupplier = async (req, res) => {
    try {
        const data = await Supplier.findAll();
        res.json({ sukses: true, jumlah: data.length, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.getSupplierById = async (req, res) => {
    try {
        const data = await Supplier.findById(req.params.id);
        if (!data) return res.status(404).json({ sukses: false, pesan: 'Supplier tidak ditemukan' });
        res.json({ sukses: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const { nama_supplier } = req.body;
        if (!nama_supplier) {
            return res.status(400).json({ sukses: false, pesan: 'Nama supplier wajib diisi' });
        }
        const data = await Supplier.create(req.body);
        res.status(201).json({ sukses: true, pesan: 'Supplier dibuat', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const { nama_supplier } = req.body;
        if (!nama_supplier) {
            return res.status(400).json({ sukses: false, pesan: 'Nama supplier wajib diisi' });
        }
        const data = await Supplier.update(req.params.id, req.body);
        res.json({ sukses: true, pesan: 'Supplier diupdate', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const berhasil = await Supplier.delete(req.params.id);
        if (!berhasil) return res.status(404).json({ sukses: false, pesan: 'Supplier tidak ditemukan' });
        res.json({ sukses: true, pesan: 'Supplier dihapus' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ sukses: false, pesan: err.message });
    }
};