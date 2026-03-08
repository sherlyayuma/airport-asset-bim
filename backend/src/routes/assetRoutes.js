const express = require('express');
const authAdmin = require('../middleware/authAdmin');
const upload = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { validateAsset } = require('../middleware/validators');

const {
  addAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  downloadBarcode,

  downloadQrZip
} = require('../controllers/assetController');

const router = express.Router();

// Restore original route
router.post('/add', authAdmin, uploadLimiter, upload.array('images', 20), validateAsset, addAsset);
router.get('/', authAdmin, getAssets);

router.get('/view/:id', getAssetById); // public detail
router.get('/barcode/:id', downloadBarcode);
router.get('/download-zip', authAdmin, downloadQrZip);
router.put('/edit/:id', authAdmin, uploadLimiter, upload.array('images', 20), validateAsset, updateAsset);
router.delete('/delete/:id', authAdmin, deleteAsset);

module.exports = router;