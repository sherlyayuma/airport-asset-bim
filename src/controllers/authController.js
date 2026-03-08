// src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
require('dotenv').config();

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const error = new Error('Username and Password are required');
      error.statusCode = 400;
      throw error;
    }

    console.log('Login attempt:', { username });

    const admin = await Admin.findByUsername(username);

    if (!admin) {
      const error = new Error('Invalid username or password');
      error.statusCode = 401;
      throw error;
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      const error = new Error('Invalid username or password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Standard Response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username
        }
      }
    });

  } catch (error) {
    next(error);
  }
};


module.exports = { login };