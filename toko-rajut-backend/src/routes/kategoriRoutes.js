const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const { verifyToken, cekRole } = require('../middleware/auth');

// Publik
router.get('/', kategoriController.getAllKategori);
router.get('/:id', kategoriController.getKategoriById);

// CRUD: hanya admin
router.post('/', verifyToken, cekRole('admin'), kategoriController.createKategori);
router.put('/:id', verifyToken, cekRole('admin'), kategoriController.updateKategori);
router.delete('/:id', verifyToken, cekRole('admin'), kategoriController.deleteKategori);

module.exports = router;