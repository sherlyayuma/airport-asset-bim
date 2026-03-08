require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/models/db');
const Asset = require('./src/models/Asset');
const { generateBarcode } = require('./src/utils/barcodeGenerator');

const fixAsset52 = async () => {
    try {
        console.log('--- Fixing Asset 52 ---');

        const [rows] = await pool.execute('SELECT * FROM assets WHERE id = 52');
        if (rows.length === 0) {
            console.log('Asset 52 not found.');
            process.exit(0);
        }
        const asset = rows[0];
        console.log('Current Data:', asset);

        if (asset.asset_id.startsWith('AS-')) {
            console.log('Asset 52 already has correct ID format:', asset.asset_id);
            process.exit(0);
        }

        const year = new Date().getFullYear();
        let lastAsset = await Asset.getLastByYear(year);
        let nextNumber = lastAsset ? parseInt(lastAsset.asset_id.split('-')[2]) + 1 : 1;
        const newId = `AS-${year}-${String(nextNumber).padStart(4, '0')}`;

        console.log(`Migrating: ${asset.asset_id} -> ${newId}`);

        // Rename Barcode
        const oldBarcodePath = path.join(__dirname, 'public/barcodes', `${asset.asset_id}.png`);
        const newBarcodePath = path.join(__dirname, 'public/barcodes', `${newId}.png`);

        if (fs.existsSync(oldBarcodePath)) {
            try {
                fs.renameSync(oldBarcodePath, newBarcodePath);
                console.log(`[FILE] Renamed barcode.`);
            } catch (e) {
                console.log(`[FILE] Rename failed, generating new.`);
                await generateBarcode(newId);
            }
        } else {
            console.log(`[FILE] Old barcode missing, generating new.`);
            await generateBarcode(newId);
        }

        // Update DB
        await pool.execute('UPDATE assets SET asset_id = ? WHERE id = 52', [newId]);
        console.log('[DB] Updated.');

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixAsset52();
