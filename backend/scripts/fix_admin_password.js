require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'airport_asset_db'
});

const fixAdminPassword = async () => {
    const adminId = 5; // ID dari log error
    const newUsername = 'Asset Management';
    const newPassword = 'Angkasapura001';

    try {
        console.log(`🔒 Preparing to reset password for Admin ID ${adminId}...`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`🔑 Generated Hash: ${hashedPassword}`);

        // Update langsung berdasarkan ID
        const [result] = await pool.execute(
            'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?',
            [newUsername, hashedPassword, adminId]
        );

        if (result.affectedRows > 0) {
            console.log(`✅ Success! Updated Admin ID ${adminId}`);
            console.log(`   Username: '${newUsername}'`);
            console.log(`   Password: '${newPassword}'`);
            require('fs').writeFileSync('fix_status.txt', `SUCCESS: Updated Admin ID ${adminId}`);
        } else {
            console.error(`❌ Failed: Admin ID ${adminId} not found.`);
            require('fs').writeFileSync('fix_status.txt', `FAILED: Admin ID ${adminId} not found`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        require('fs').writeFileSync('fix_status.txt', `ERROR: ${error.message}`);
    } finally {
        pool.end();
    }
};

fixAdminPassword();
