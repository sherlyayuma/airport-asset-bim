const express = require('express');
const { viewAssetPublic } = require('../controllers/scanController');
const router = express.Router();

router.get('/view/:id', viewAssetPublic);

module.exports = router;