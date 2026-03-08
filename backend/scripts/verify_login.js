require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'airport_asset_db'
});

const verifyCredentials = async () => {
    const username = 'Asset Management';
    const password = 'Angkasapura001';

    try {
        console.log(`Verifying credentials for '${username}'...`);

        const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);

        if (rows.length === 0) {
            console.error('❌ User not found!');
        } else {
            const admin = rows[0];
            const match = await bcrypt.compare(password, admin.password_hash);
            if (match) {
                console.log('✅ Login verified successfully!');
            } else {
                console.error('❌ Password mismatch!');
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        pool.end();
    }
};

verifyCredentials();
