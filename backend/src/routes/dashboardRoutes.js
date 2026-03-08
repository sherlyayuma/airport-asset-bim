const express = require('express');
const authAdmin = require('../middleware/authAdmin');
const { getDashboardData } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/data', authAdmin, getDashboardData);

module.exports = router;
