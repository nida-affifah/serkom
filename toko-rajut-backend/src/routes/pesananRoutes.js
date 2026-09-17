const express = require('express');
const router = express.Router();
const pesananController = require('../controllers/pesananController');
const { verifyToken, cekRole, adminAtauKasir } = require('../middleware/auth');

router.use(verifyToken);

// Pembeli: buat pesanan
router.post('/', pesananController.createPesanan);
router.post('/dari-keranjang', pesananController.createPesananDariKeranjang);
router.get('/saya', pesananController.getPesananSaya);

// Admin + kasir: lihat semua pesanan, update status
router.get('/', adminAtauKasir, pesananController.getAllPesanan);
router.put('/:id/status', adminAtauKasir, pesananController.updateStatus);

// Detail: admin, kasir, atau pemilik
router.get('/:id', pesananController.getPesananById);

module.exports = router;