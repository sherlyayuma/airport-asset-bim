require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'airport_asset_db'
});

const checkAdmins = async () => {
    try {
        const [rows] = await pool.execute('SELECT * FROM admins');
        console.log('--- ADMINS TABLE ---');
        rows.forEach(row => {
            console.log(`ID: ${row.id}, Username: '${row.username}', Hash: ${row.password_hash ? row.password_hash.substring(0, 20) + '...' : 'NULL'}`);
        });
        console.log('--------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        pool.end();
    }
};

checkAdmins();
