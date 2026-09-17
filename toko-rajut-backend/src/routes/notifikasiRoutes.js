const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/notifikasiController');
const { verifyToken, cekRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', notifikasiController.getNotifikasiSaya);
router.get('/belum-dibaca', notifikasiController.getJumlahBelumDibaca);
router.put('/baca-semua', notifikasiController.tandaiSemuaBaca);
router.delete('/semua', notifikasiController.hapusSemua);
router.post('/kirim', cekRole('admin'), notifikasiController.kirimNotifikasi);
router.put('/:id/baca', notifikasiController.tandaiBaca);
router.delete('/:id', notifikasiController.hapusNotifikasi);

module.exports = router;