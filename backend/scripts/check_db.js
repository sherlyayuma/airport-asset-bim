require('dotenv').config();
const pool = require('./src/models/db');

async function checkColumn() {
    try {
        const [rows] = await pool.execute("SHOW COLUMNS FROM assets LIKE 'tipe_aset'");
        if (rows.length > 0) {
            console.log('Column tipe_aset EXISTS');
        } else {
            console.log('Column tipe_aset MISSING');
            // Attempt to add it
            try {
                await pool.execute("ALTER TABLE assets ADD COLUMN tipe_aset VARCHAR(50) AFTER nama");
                console.log('Column tipe_aset ADDED successfully');
            } catch (e) {
                console.error('Failed to add column:', e.message);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkColumn();
