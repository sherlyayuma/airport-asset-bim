require('dotenv').config();
const fs = require('fs');
const pool = require('./src/models/db');

const fetchAsset51 = async () => {
    try {
        const [rows] = await pool.execute('SELECT id, asset_id, nama FROM assets WHERE id = 51'); // Fetch by ID 51 as reported by User (or similar from screenshot context if different?)
        const output = JSON.stringify(rows[0], null, 2);
        fs.writeFileSync('debug_asset_51.txt', output);

        // Also let's check ALL assets that don't match 'AS-%' just in case.
        const [badRows] = await pool.execute("SELECT id, asset_id FROM assets WHERE asset_id NOT LIKE 'AS-%'");
        fs.appendFileSync('debug_asset_51.txt', '\n\nOther Bad Assets:\n' + JSON.stringify(badRows, null, 2));

        process.exit(0);
    } catch (err) {
        fs.writeFileSync('debug_asset_51.txt', err.toString());
        process.exit(1);
    }
};

fetchAsset51();
