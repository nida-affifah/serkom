const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, cekRole } = require('../middleware/auth');

// ═══════════════════════════════════════
// PUBLIK
// ═══════════════════════════════════════
router.post('/register', authController.register);
router.post('/login', authController.login);

// ═══════════════════════════════════════
// BUTUH LOGIN
// ═══════════════════════════════════════
router.get('/me', verifyToken, authController.me);

// ═══════════════════════════════════════
// ADMIN: KELOLA USER
// ═══════════════════════════════════════
router.post('/tambah-user', verifyToken, cekRole('admin'), authController.tambahUser);
router.get('/users', verifyToken, cekRole('admin'), authController.getAllUsers);
router.put('/users/:id', verifyToken, cekRole('admin'), authController.updateUser);
router.delete('/users/:id', verifyToken, cekRole('admin'), authController.deleteUser);

module.exports = router;