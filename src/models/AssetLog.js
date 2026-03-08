const pool = require('../config/db');

const create = async (asset_id, admin_id, aksi) => {
  await pool.execute(
    'INSERT INTO asset_logs (asset_id, admin_id, aksi) VALUES (?, ?, ?)',
    [asset_id, admin_id, aksi]
  );
};

const getByAssetId = async (asset_id) => {
  const [rows] = await pool.execute(
    `SELECT al.*, a.username 
     FROM asset_logs al 
     JOIN admins a ON al.admin_id = a.id 
     WHERE al.asset_id = ? 
     ORDER BY al.waktu DESC`,
    [asset_id]
  );
  return rows;
};

const getRecent = async (limit = 5) => {
  const [rows] = await pool.execute(
    `SELECT al.*, a.username, asst.asset_id as asset_code, asst.nama as asset_name, asst.kondisi
     FROM asset_logs al 
     JOIN admins a ON al.admin_id = a.id 
     LEFT JOIN assets asst ON al.asset_id = asst.id
     ORDER BY al.waktu DESC 
     LIMIT ?`,
    [limit]
  );
  return rows;
};

module.exports = { create, getByAssetId, getRecent };