// backend/routes/bahan.js
const express = require('express');
const router = express.Router();
const bahanController = require('../controllers/bahanController');
const { verifyToken, cekRole, adminAtauStaff } = require('../middleware/auth');

// ═══════════════════════════════════════
// PUBLIK (dengan optional auth)
// ═══════════════════════════════════════
router.get('/', bahanController.getAllBahan);
router.get('/:id', bahanController.getBahanById);

// ═══════════════════════════════════════
// CRUD (admin + staff_gudang)
// ═══════════════════════════════════════
router.post('/', verifyToken, adminAtauStaff, bahanController.createBahan);
router.put('/:id', verifyToken, adminAtauStaff, bahanController.updateBahan);
router.delete('/:id', verifyToken, cekRole('admin'), bahanController.deleteBahan);

module.exports = router;