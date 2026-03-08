require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'airport_asset_db'
});

const updateCredentials = async () => {
    const newUsername = 'Asset Management';
    const newPassword = 'Angkasapura001';

    try {
        console.log(`Updating credentials for '${newUsername}'...`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Check if user exists (any admin)
        const [rows] = await pool.execute('SELECT * FROM admins LIMIT 1');

        if (rows.length > 0) {
            // Update existing admin
            const adminId = rows[0].id;
            await pool.execute(
                'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?',
                [newUsername, hashedPassword, adminId]
            );
            console.log(`✅ Updated existing admin (ID: ${adminId}) to username: '${newUsername}'`);
        } else {
            // Create new admin
            await pool.execute(
                'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
                [newUsername, hashedPassword, 'admin']
            );
            console.log(`✅ Created new admin: '${newUsername}'`);
        }

        console.log('Password updated successfully.');

    } catch (error) {
        console.error('❌ Error:', error);
        require('fs').writeFileSync('update_status.txt', 'ERROR: ' + error.message);
    } finally {
        pool.end();
        if (!require('fs').existsSync('update_status.txt')) {
            require('fs').writeFileSync('update_status.txt', 'SUCCESS');
        }
    }
};

updateCredentials();
