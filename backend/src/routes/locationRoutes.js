const express = require('express');
const authAdmin = require('../middleware/authAdmin');
const { getAll, addLocation } = require('../controllers/locationController');

const router = express.Router();

// router.use(authenticateToken);

router.get('/', authAdmin, getAll);
router.post('/add', authAdmin, addLocation);

module.exports = router;
