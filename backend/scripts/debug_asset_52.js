require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/models/db');

const checkAsset52 = async () => {
    try {
        const [rows] = await pool.execute('SELECT id, asset_id, nama FROM assets WHERE id = 52');
        const output = JSON.stringify(rows[0], null, 2);
        fs.writeFileSync(path.join(__dirname, 'debug_asset_52.txt'), output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync(path.join(__dirname, 'debug_asset_52.txt'), err.toString());
        process.exit(1);
    }
};

checkAsset52();
