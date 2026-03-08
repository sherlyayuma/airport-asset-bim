// src/routes/authRoutes.js
const express = require('express');
const { login } = require('../controllers/authController'); // 👈 Destructuring

console.log('Login function:', login);
const router = express.Router();


router.post('/login', login); // 👈 Fungsi login harus valid

module.exports = router;