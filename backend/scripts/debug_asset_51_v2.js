require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/models/db');

const fetchAsset51 = async () => {
    try {
        const [rows] = await pool.execute('SELECT id, asset_id, nama FROM assets WHERE id = 51');
        const [badRows] = await pool.execute("SELECT id, asset_id FROM assets WHERE asset_id NOT LIKE 'AS-%'");

        const output = {
            asset51: rows[0] || 'NOT FOUND',
            badAssets: badRows
        };

        console.log(JSON.stringify(output, null, 2));
        fs.writeFileSync(path.join(__dirname, 'debug_asset_51_v2.txt'), JSON.stringify(output, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        fs.writeFileSync(path.join(__dirname, 'debug_asset_51_error.txt'), err.toString());
        process.exit(1);
    }
};

fetchAsset51();
