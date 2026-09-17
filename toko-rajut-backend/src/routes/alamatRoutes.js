const express = require('express');
const router = express.Router();
const alamatController = require('../controllers/alamatController');
const { verifyToken } = require('../middleware/auth');

// Semua route alamat butuh login
router.use(verifyToken);

router.get('/', alamatController.getAlamatSaya);
router.get('/:id', alamatController.getAlamatById);
router.post('/', alamatController.createAlamat);
router.put('/:id', alamatController.updateAlamat);
router.delete('/:id', alamatController.deleteAlamat);
router.put('/:id/default', alamatController.setDefault);

module.exports = router;