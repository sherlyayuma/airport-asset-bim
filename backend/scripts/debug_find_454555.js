require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/models/db');

const findAsset = async () => {
    try {
        console.log('Searching for 454555...');
        const [rows] = await pool.execute("SELECT id, asset_id, nama FROM assets WHERE asset_id LIKE '%454555%' OR nama LIKE '%454555%'");
        console.log(JSON.stringify(rows, null, 2));
        fs.writeFileSync(path.join(__dirname, 'debug_find_454555.txt'), JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findAsset();
