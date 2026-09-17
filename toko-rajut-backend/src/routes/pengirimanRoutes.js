const express = require('express');
const router = express.Router();
const pengirimanController = require('../controllers/pengirimanController');
const { verifyToken, adminAtauKasir } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', adminAtauKasir, pengirimanController.createPengiriman);
router.get('/', adminAtauKasir, pengirimanController.getAllPengiriman);
router.get('/pesanan/:pesananId', pengirimanController.getPengirimanByPesanan);
router.get('/:id', pengirimanController.getPengirimanById);
router.put('/:id/sampai', adminAtauKasir, pengirimanController.tandaiSampai);

module.exports = router;