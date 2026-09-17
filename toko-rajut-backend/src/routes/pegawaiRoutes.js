const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');
const { verifyToken, cekRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(cekRole('admin'));  // HANYA ADMIN

// Perajin
router.get('/perajin', pegawaiController.getAllPerajin);
router.get('/perajin/:id', pegawaiController.getPerajinById);
router.post('/perajin', pegawaiController.createPerajin);
router.put('/perajin/:id', pegawaiController.updatePerajin);
router.delete('/perajin/:id', pegawaiController.deletePerajin);

// Kasir
router.get('/kasir', pegawaiController.getAllKasir);
router.get('/kasir/:id', pegawaiController.getKasirById);
router.post('/kasir', pegawaiController.createKasir);
router.put('/kasir/:id', pegawaiController.updateKasir);
router.delete('/kasir/:id', pegawaiController.deleteKasir);

// Staff Gudang
router.get('/staff-gudang', pegawaiController.getAllStaff);
router.get('/staff-gudang/:id', pegawaiController.getStaffById);
router.post('/staff-gudang', pegawaiController.createStaff);
router.put('/staff-gudang/:id', pegawaiController.updateStaff);
router.delete('/staff-gudang/:id', pegawaiController.deleteStaff);

module.exports = router;