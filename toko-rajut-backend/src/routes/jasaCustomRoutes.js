const express = require('express');
const router = express.Router();
const jasaCustomController = require('../controllers/jasaCustomController');
const { verifyToken, cekRole } = require('../middleware/auth');

router.get('/', jasaCustomController.getAllJasa);
router.get('/:id', jasaCustomController.getJasaById);

router.post('/', verifyToken, cekRole('admin'), jasaCustomController.createJasa);
router.put('/:id', verifyToken, cekRole('admin'), jasaCustomController.updateJasa);
router.delete('/:id', verifyToken, cekRole('admin'), jasaCustomController.deleteJasa);

module.exports = router;