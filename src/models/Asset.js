const pool = require('../config/db');

// Define columns, using table alias 'a' for assets and 'l' for locations
// We map l.nama_lokasi to 'lokasi' to maintain backward compatibility with frontend
const COLUMNS = `
  a.id, a.asset_id, a.nama, a.description, a.tipe_aset, 
  l.nama_lokasi as lokasi, a.location_id,
  a.kondisi, a.tanggal_beli, a.image_path, a.barcode,
  a.sno, a.sub_asset, a.type_barang, a.merk, a.serial_no, a.quantity, a.cap_date, a.purch_doc, a.vendor_name,
  a.acquis_val, a.currency, a.bun, a.accum_dep, a.book_val, a.monthly_dep, a.dep_key, a.odep_start, a.use_life, a.last_ret,
  a.pemakai, a.cost_center, a.ev_1, a.ev_2, a.ev_3, a.ev_4, a.ev_grp_5, a.keterangan, a.created_at, a.updated_at
`;

const BASE_QUERY = `
  SELECT ${COLUMNS}
  FROM assets a
  LEFT JOIN locations l ON a.location_id = l.id
`;

const create = async (data) => {
  const {
    asset_id, nama, description, tipe_aset, location_id, kondisi, tanggal_beli, image_path, barcode,
    sno, sub_asset, type_barang, merk, serial_no, quantity, cap_date, purch_doc, vendor_name,
    acquis_val, currency, bun, accum_dep, book_val, monthly_dep, dep_key, odep_start, use_life, last_ret,
    pemakai, cost_center, ev_1, ev_2, ev_3, ev_4, ev_grp_5, keterangan
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO assets (
      asset_id, nama, description, tipe_aset, location_id, kondisi, tanggal_beli, image_path, barcode,
      sno, sub_asset, type_barang, merk, serial_no, quantity, cap_date, purch_doc, vendor_name,
      acquis_val, currency, bun, accum_dep, book_val, monthly_dep, dep_key, odep_start, use_life, last_ret,
      pemakai, cost_center, ev_1, ev_2, ev_3, ev_4, ev_grp_5, keterangan, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      asset_id, nama, description, tipe_aset, location_id, kondisi, tanggal_beli, image_path, barcode,
      sno, sub_asset, type_barang, merk, serial_no, quantity, cap_date, purch_doc, vendor_name,
      acquis_val, currency, bun, accum_dep, book_val, monthly_dep, dep_key, odep_start, use_life, last_ret,
      pemakai, cost_center, ev_1, ev_2, ev_3, ev_4, ev_grp_5, keterangan
    ].map(v => v === undefined ? null : v)
  );
  return { id: result.insertId, ...data };
};

const getAll = async (filters = {}, sort = 'asc', limit = 10, offset = 0) => {
  let query = `${BASE_QUERY} WHERE 1=1`;

  const params = [];
  if (filters.kondisi && filters.kondisi !== 'all') {
    query += ' AND a.kondisi = ?';
    params.push(filters.kondisi);
  }
  if (filters.tipe && filters.tipe !== 'all') {
    query += ' AND a.tipe_aset = ?';
    params.push(filters.tipe);
  }
  if (filters.lokasi && filters.lokasi !== 'all') {
    // Check if filter is ID or Name. Usually ID if coming from dropdown, Name if text.
    // Let's assume ID if numeric.
    if (!isNaN(filters.lokasi)) {
      query += ' AND a.location_id = ?';
      params.push(filters.lokasi);
    } else {
      query += ' AND l.nama_lokasi = ?';
      params.push(filters.lokasi);
    }
  }
  if (filters.location_id && filters.location_id !== 'all') {
    query += ' AND a.location_id = ?';
    params.push(filters.location_id);
  }
  if (filters.search) {
    query += ' AND (a.nama LIKE ? OR a.description LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  let orderBy = 'ORDER BY LENGTH(a.nama) ASC, a.nama ASC';
  if (sort === 'desc') {
    orderBy = 'ORDER BY LENGTH(a.nama) DESC, a.nama DESC';
  } else if (sort === 'date_desc') {
    orderBy = 'ORDER BY a.updated_at DESC';
  } else if (sort === 'date_asc') {
    orderBy = 'ORDER BY a.updated_at ASC';
  } else if (sort === 'newest') {
    orderBy = 'ORDER BY a.id DESC';
  }

  query += ` ${orderBy} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.execute(query, params);
  return rows;
};

const countAll = async (filters = {}) => {
  let query = 'SELECT COUNT(a.id) as total FROM assets a LEFT JOIN locations l ON a.location_id = l.id WHERE 1=1';
  const params = [];
  if (filters.kondisi && filters.kondisi !== 'all') {
    query += ' AND a.kondisi = ?';
    params.push(filters.kondisi);
  }
  if (filters.tipe && filters.tipe !== 'all') {
    query += ' AND a.tipe_aset = ?';
    params.push(filters.tipe);
  }
  if (filters.lokasi && filters.lokasi !== 'all') {
    if (!isNaN(filters.lokasi)) {
      query += ' AND a.location_id = ?';
      params.push(filters.lokasi);
    } else {
      query += ' AND l.nama_lokasi = ?';
      params.push(filters.lokasi);
    }
  }
  if (filters.location_id) {
    query += ' AND a.location_id = ?';
    params.push(filters.location_id);
  }
  if (filters.search) {
    query += ' AND (a.nama LIKE ? OR a.description LIKE ? OR a.asset_id LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }
  const [rows] = await pool.execute(query, params);
  return rows[0].total;
};

const getLocations = async () => {
  // Deprecated in favor of Location model, but kept for compatibility if needed.
  // But now we should return from locations table?
  // Or return distinct lokasi from assets?
  // Let's return from locations table to be consistent with new source of truth.
  const [rows] = await pool.execute('SELECT nama_lokasi as lokasi FROM locations ORDER BY nama_lokasi ASC');
  return rows.map(row => row.lokasi);
};

const findById = async (id) => {
  const [rows] = await pool.execute(`${BASE_QUERY} WHERE a.id = ?`, [id]);
  return rows[0];
};

const findByAssetId = async (asset_id) => {
  const [rows] = await pool.execute(`${BASE_QUERY} WHERE a.asset_id = ?`, [asset_id]);
  return rows[0];
};

const findByNama = async (nama) => {
  const [rows] = await pool.execute(`${BASE_QUERY} WHERE a.nama = ?`, [nama]);
  return rows[0];
};

const update = async (id, data) => {
  const {
    nama, description, tipe_aset, location_id, kondisi, tanggal_beli, image_path,
    sno, sub_asset, type_barang, merk, serial_no, quantity, cap_date, purch_doc, vendor_name,
    acquis_val, currency, bun, accum_dep, book_val, monthly_dep, dep_key, odep_start, use_life, last_ret,
    pemakai, cost_center, ev_1, ev_2, ev_3, ev_4, ev_grp_5, keterangan
  } = data;

  const [result] = await pool.execute(
    `UPDATE assets SET 
      nama=?, description=?, tipe_aset=?, location_id=?, kondisi=?, tanggal_beli=?, image_path=?, 
      sno=?, sub_asset=?, type_barang=?, merk=?, serial_no=?, quantity=?, cap_date=?, purch_doc=?, vendor_name=?,
      acquis_val=?, currency=?, bun=?, accum_dep=?, book_val=?, monthly_dep=?, dep_key=?, odep_start=?, use_life=?, last_ret=?,
      pemakai=?, cost_center=?, ev_1=?, ev_2=?, ev_3=?, ev_4=?, ev_grp_5=?, keterangan=?,
      updated_at=NOW() 
      WHERE id=?`,
    [
      nama, description, tipe_aset, location_id, kondisi, tanggal_beli, image_path,
      sno, sub_asset, type_barang, merk, serial_no, quantity, cap_date, purch_doc, vendor_name,
      acquis_val, currency, bun, accum_dep, book_val, monthly_dep, dep_key, odep_start, use_life, last_ret,
      pemakai, cost_center, ev_1, ev_2, ev_3, ev_4, ev_grp_5, keterangan,
      id
    ].map(v => v === undefined ? null : v)
  );
  return result.affectedRows > 0;
};

const deleteById = async (id) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM asset_logs WHERE asset_id = ?', [id]);
    const [result] = await connection.execute('DELETE FROM assets WHERE id = ?', [id]);
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getLastByYear = async (year) => {
  const [rows] = await pool.execute(
    `SELECT asset_id FROM assets 
     WHERE asset_id LIKE ? 
     ORDER BY id DESC LIMIT 1`,
    [`AS-${year}-%`]
  );
  return rows[0];
};

const getStats = async () => {
  const [rows] = await pool.execute(
    `SELECT 
            COUNT(id) as total,
            SUM(CASE WHEN kondisi = 'Baik' THEN 1 ELSE 0 END) as baik,
            SUM(CASE WHEN kondisi = 'Rusak' THEN 1 ELSE 0 END) as rusak
         FROM assets`
  );
  return rows[0];
};

module.exports = {
  create,
  getAll,
  countAll,
  findById,
  findByAssetId,
  findByNama,
  update,
  deleteById,
  getLastByYear,
  getStats,
  getLocations
};