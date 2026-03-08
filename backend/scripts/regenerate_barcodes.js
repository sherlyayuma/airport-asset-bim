require('dotenv').config();
const pool = require('./src/models/db'); // Adjust path to db.js
const { generateBarcode } = require('./src/utils/barcodeGenerator'); // Adjust path

async function regenerateAll() {
    try {
        console.log('Fetching all assets...');
        const [rows] = await pool.execute('SELECT asset_id FROM assets');
        console.log(`Found ${rows.length} assets. Regenerating barcodes...`);

        for (const row of rows) {
            if (row.asset_id) {
                await generateBarcode(row.asset_id);
                process.stdout.write('.');
            }
        }
        console.log('\nDone.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

regenerateAll();
