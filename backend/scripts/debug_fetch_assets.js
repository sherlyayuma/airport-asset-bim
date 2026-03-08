require('dotenv').config();
const fs = require('fs');
const pool = require('./src/models/db');

const fetchAssets = async () => {
    try {
        const [rows39] = await pool.execute('SELECT id, asset_id, nama FROM assets WHERE id = 39');
        const output = JSON.stringify(rows39[0], null, 2);
        fs.writeFileSync('debug_output.txt', output);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('debug_output.txt', err.toString());
        process.exit(1);
    }
};

fetchAssets();
