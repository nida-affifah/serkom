const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyToken, cekRole, adminAtauStaff } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', adminAtauStaff, supplierController.getAllSupplier);
router.get('/:id', adminAtauStaff, supplierController.getSupplierById);
router.post('/', adminAtauStaff, supplierController.createSupplier);
router.put('/:id', adminAtauStaff, supplierController.updateSupplier);
router.delete('/:id', cekRole('admin'), supplierController.deleteSupplier);

module.exports = router;