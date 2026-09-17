const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');

// Master data bisa diakses publik (untuk form checkout & retur)
router.get('/alasan-retur', masterController.getAlasanRetur);
router.get('/metode-bayar', masterController.getMetodeBayar);
router.get('/kurir', masterController.getKurir);
router.get('/pengaturan', masterController.getPengaturan);

module.exports = router;