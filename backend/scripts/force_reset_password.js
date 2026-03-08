require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('force_reset_log.txt', msg + '\n');
};

const forceReset = async () => {
    // Hardcoded fallback if env fails, but try env first
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
        database: process.env.DB_NAME || 'airport_asset_db'
    };

    log(`Connecting to database... ${config.host} with user ${config.user}`);

    let connection;
    try {
        connection = await mysql.createConnection(config);
        log('✅ Connected.');

        const username = 'Asset Management';
        const password = 'Angkasapura001';

        log(`Generating hash for password: ${password}`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        log(`Generated Hash: ${hashedPassword}`);

        // Update directly
        const [result] = await connection.execute(
            'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?',
            [username, hashedPassword, 1] // Assuming ID 1 or we search
        );

        if (result.affectedRows === 0) {
            log('⚠️ No rows updated by ID 1. Trying to find by username or insert.');
            // Try to find the user
            const [rows] = await connection.execute('SELECT * FROM admins');
            if (rows.length > 0) {
                const adminId = rows[0].id;
                log(`Found admin ID ${adminId}. Updating...`);
                await connection.execute(
                    'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?',
                    [username, hashedPassword, adminId]
                );
                log('✅ Updated successfully.');
            } else {
                log('No admins found. Inserting...');
                await connection.execute(
                    'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
                    [username, hashedPassword, 'admin']
                );
                log('✅ Inserted new admin.');
            }
        } else {
            log('✅ Password reset successfully for ID 1.');
        }

    } catch (err) {
        log(`❌ Error: ${err.message}`);
    } finally {
        if (connection) connection.end();
    }
};

forceReset();
