const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const { verifyToken, adminAtauStaff } = require('../middleware/auth');

router.use(verifyToken);
router.use(adminAtauStaff);

router.get('/', pembelianController.getAllPembelian);
router.get('/:id', pembelianController.getPembelianById);
router.post('/', pembelianController.createPembelian);
router.put('/:id/terima', pembelianController.terimaPembelian);

module.exports = router;