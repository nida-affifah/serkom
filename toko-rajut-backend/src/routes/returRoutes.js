const express = require('express');
const router = express.Router();
const returController = require('../controllers/returController');
const { verifyToken, cekRole, adminAtauKasir } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', returController.ajukanRetur);
router.get('/saya', returController.getReturSaya);
router.get('/', adminAtauKasir, returController.getAllRetur);
router.get('/:id', returController.getReturById);
router.put('/:id/setujui', adminAtauKasir, returController.setujuiRetur);
router.put('/:id/tolak', adminAtauKasir, returController.tolakRetur);
router.put('/:id/terima-barang', adminAtauKasir, returController.terimaBarang);
router.post('/:id/refund', adminAtauKasir, returController.prosesRefund);

module.exports = router;