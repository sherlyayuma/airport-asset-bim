const pool = require('../config/db');

const getAll = async () => {
    const [rows] = await pool.execute('SELECT * FROM locations ORDER BY nama_lokasi ASC');
    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM locations WHERE id = ?', [id]);
    return rows[0];
};

const findByName = async (nama_lokasi) => {
    const [rows] = await pool.execute('SELECT * FROM locations WHERE nama_lokasi = ?', [nama_lokasi]);
    return rows[0];
};

const create = async (nama_lokasi) => {
    const [result] = await pool.execute(
        'INSERT INTO locations (nama_lokasi) VALUES (?)',
        [nama_lokasi]
    );
    return { id: result.insertId, nama_lokasi };
};

module.exports = {
    getAll,
    findById,
    findByName,
    create
};
