// backend/routes/produk.js
const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');
const upload = require('../middleware/upload');
const {
    verifyToken,
    cekRole,
    adminAtauStaff,
    optionalAuth
} = require('../middleware/auth');

// ═══════════════════════════════════════
// PUBLIK
// ═══════════════════════════════════════
router.get('/', optionalAuth, produkController.getAllProduk);
router.get('/kategori/:kategoriId', optionalAuth, produkController.getProdukByKategori);
router.get('/:id', optionalAuth, produkController.getProdukById);

// ═══════════════════════════════════════
// UPLOAD
// ═══════════════════════════════════════
router.post(
    '/upload',
    verifyToken,
    adminAtauStaff,
    upload.single('gambar'),
    produkController.uploadGambar
);

// ═══════════════════════════════════════
// CRUD
// ═══════════════════════════════════════
router.post('/', verifyToken, adminAtauStaff, produkController.createProduk);
router.put('/:id', verifyToken, adminAtauStaff, produkController.updateProduk);
router.delete('/:id', verifyToken, cekRole('admin'), produkController.deleteProduk);

// ═══════════════════════════════════════
// PRODUKSI ULANG
// ═══════════════════════════════════════
router.post('/:id/produksi', verifyToken, adminAtauStaff, produkController.produksiUlang);

module.exports = router;