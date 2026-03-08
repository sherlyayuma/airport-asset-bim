const pool = require('../config/db');

const findByUsername = async (username) => {
  const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
  return rows[0];
};

module.exports = { findByUsername };