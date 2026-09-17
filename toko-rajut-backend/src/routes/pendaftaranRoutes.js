const express = require('express');
const router = express.Router();
const pendaftaranController = require('../controllers/pendaftaranController');
const { verifyToken, cekRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', pendaftaranController.createPendaftaran);
router.get('/', cekRole('admin'), pendaftaranController.getAllPendaftaran);
router.get('/:id', cekRole('admin'), pendaftaranController.getPendaftaranById);
router.put('/:id/verifikasi', cekRole('admin'), pendaftaranController.verifikasiPendaftaran);

module.exports = router;