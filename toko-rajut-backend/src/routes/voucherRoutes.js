// backend/routes/voucher.js
const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const { verifyToken, cekRole } = require('../middleware/auth');

// ═══════════════════════════════════════
// PUBLIK (tanpa login)
// ═══════════════════════════════════════
router.get('/aktif', voucherController.getVoucherAktif);

// ═══════════════════════════════════════
// PEMBELI (butuh login)
// ═══════════════════════════════════════
router.post('/cek', verifyToken, voucherController.cekVoucher);

// ═══════════════════════════════════════
// ADMIN (butuh login & role admin)
// ═══════════════════════════════════════
router.get('/', verifyToken, cekRole('admin'), voucherController.getAllVoucher);
router.get('/:id', verifyToken, cekRole('admin'), voucherController.getVoucherById);
router.post('/', verifyToken, cekRole('admin'), voucherController.createVoucher);
router.put('/:id', verifyToken, cekRole('admin'), voucherController.updateVoucher);
router.delete('/:id', verifyToken, cekRole('admin'), voucherController.deleteVoucher);

module.exports = router;