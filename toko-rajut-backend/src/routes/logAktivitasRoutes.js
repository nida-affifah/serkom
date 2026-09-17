const express = require('express');
const router = express.Router();
const logAktivitasController = require('../controllers/logAktivitasController');
const { verifyToken, cekRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(cekRole('admin'));  // HANYA ADMIN

router.get('/', logAktivitasController.getAllLog);
router.post('/', logAktivitasController.catatLog);
router.delete('/', logAktivitasController.hapusSemuaLog);

module.exports = router;