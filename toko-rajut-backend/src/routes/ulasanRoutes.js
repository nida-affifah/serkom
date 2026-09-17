const express = require('express');
const router = express.Router();
const ulasanController = require('../controllers/ulasanController');
const { verifyToken, cekRole } = require('../middleware/auth');

// Publik: lihat ulasan produk
router.get('/produk/:produkId', ulasanController.getUlasanProduk);

// Perlu login
router.post('/', verifyToken, ulasanController.createUlasan);
router.get('/saya', verifyToken, ulasanController.getUlasanSaya);

// Admin
router.get('/', verifyToken, cekRole('admin'), ulasanController.getAllUlasan);
router.delete('/:id', verifyToken, cekRole('admin'), ulasanController.deleteUlasan);

module.exports = router;