require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/models/db');
const Asset = require('./src/models/Asset');
const { generateBarcode } = require('./src/utils/barcodeGenerator');

const fixAssetIds = async () => {
    try {
        console.log('--- Starting Asset ID Fix V2 ---');

        // 1. Find assets with incorrect Asset IDs 
        // We will be very explicit: Anything that does NOT start with 'AS-' is bad.
        const [rows] = await pool.execute("SELECT * FROM assets WHERE asset_id NOT LIKE 'AS-%'");

        console.log(`Found ${rows.length} assets with incorrect IDs.`);

        const year = new Date().getFullYear();
        // We need to be careful about not reusing IDs.
        // Let's get the absolute last one properly.
        let lastAsset = await Asset.getLastByYear(year);
        let nextNumber = lastAsset ? parseInt(lastAsset.asset_id.split('-')[2]) + 1 : 1;

        for (const asset of rows) {
            const oldId = asset.asset_id;
            // Generate new ID
            const newId = `AS-${year}-${String(nextNumber).padStart(4, '0')}`;
            nextNumber++; // Increment for next loop

            console.log(`Migrating Asset ID: ${asset.id} | Old: ${oldId} -> New: ${newId}`);

            // 2. Rename Barcode File
            const oldBarcodePath = path.join(__dirname, 'public/barcodes', `${oldId}.png`);
            const newBarcodePath = path.join(__dirname, 'public/barcodes', `${newId}.png`);

            if (fs.existsSync(oldBarcodePath)) {
                // If the old barcode file exists, rename it
                try {
                    fs.renameSync(oldBarcodePath, newBarcodePath);
                    console.log(`  [FILE] Renamed barcode: ${oldId}.png -> ${newId}.png`);
                } catch (e) {
                    console.error(`  [FILE] Failed to rename ${oldId}.png. Trying to generate new one.`);
                    await generateBarcode(newId);
                }
            } else {
                // If it doesn't exist (maybe filename mismatch?), generate a new one
                console.log(`  [FILE] Old barcode not found. Generating new one for ${newId}...`);
                await generateBarcode(newId);
            }

            // 3. Update Database
            let updateQuery = "UPDATE assets SET asset_id = ? WHERE id = ?";
            await pool.execute(updateQuery, [newId, asset.id]);
            console.log(`  [DB] Updated record.`);
        }

        console.log('--- Migration Complete ---');
        process.exit(0);

    } catch (err) {
        console.error('Error during migration:', err);
        process.exit(1);
    }
};

fixAssetIds();
