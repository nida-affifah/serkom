const express = require('express');
const router = express.Router();
const pembayaranController = require('../controllers/pembayaranController');
const { verifyToken, adminAtauKasir } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', pembayaranController.createPembayaran);
router.get('/', adminAtauKasir, pembayaranController.getAllPembayaran);
router.get('/pesanan/:pesananId', pembayaranController.getPembayaranByPesanan);
router.get('/:id', pembayaranController.getPembayaranById);
router.put('/:id/verifikasi', adminAtauKasir, pembayaranController.verifikasiPembayaran);

module.exports = router;