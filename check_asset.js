const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });
const pool = require('./backend/src/config/db');

async function checkAsset() {
    try {
        const [rows] = await pool.execute('SELECT id, asset_id, nama, image_path, barcode FROM assets WHERE id = ?', [79]);
        const asset = rows[0];
        console.log('Asset Data:', JSON.stringify(asset, null, 2));

        if (asset) {
            const [logs] = await pool.execute('SELECT * FROM asset_logs WHERE asset_id = ? ORDER BY waktu DESC', [asset.id]);
            console.log('Asset Logs:', JSON.stringify(logs, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkAsset();
