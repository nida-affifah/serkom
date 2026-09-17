const express = require('express');
const router = express.Router();
const keranjangController = require('../controllers/keranjangController');
const { verifyToken } = require('../middleware/auth');

// Semua route keranjang butuh login
router.use(verifyToken);

router.get('/', keranjangController.getKeranjang);
router.post('/', keranjangController.tambahKeranjang);
router.put('/:id', keranjangController.updateJumlah);
router.delete('/:id', keranjangController.hapusItem);
router.delete('/', keranjangController.kosongkanKeranjang);
router.get('/cek-valid', keranjangController.cekValid);

module.exports = router;