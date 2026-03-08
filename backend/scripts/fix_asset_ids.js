require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/models/db');
const Asset = require('./src/models/Asset'); // We might need this, or just direct DB calls
const { generateBarcode } = require('./src/utils/barcodeGenerator');

const fixAssetIds = async () => {
    try {
        console.log('--- Starting Asset ID Fix ---');

        // 1. Find assets with incorrect Asset IDs (e.g. not starting with AS-, or length > 15 which implies it's a barcode)
        // Actually, the bad ones are numeric strings like "200100000007".
        // The good ones are "AS-2026-0002".
        const [rows] = await pool.execute("SELECT * FROM assets WHERE asset_id NOT LIKE 'AS-%'");

        console.log(`Found ${rows.length} assets with incorrect IDs.`);

        if (rows.length === 0) {
            console.log('No assets to fix.');
            process.exit(0);
        }

        const year = new Date().getFullYear();
        let lastAsset = await Asset.getLastByYear(year);
        let nextNumber = lastAsset ? parseInt(lastAsset.asset_id.split('-')[2]) + 1 : 1;

        for (const asset of rows) {
            const oldId = asset.asset_id;
            const newId = `AS-${year}-${String(nextNumber).padStart(4, '0')}`;
            nextNumber++;

            console.log(`Migrating Asset ID: ${asset.id} | Old: ${oldId} -> New: ${newId}`);

            // 2. Rename Barcode File
            const oldBarcodePath = path.join(__dirname, 'public/barcodes', `${oldId}.png`);
            const newBarcodePath = path.join(__dirname, 'public/barcodes', `${newId}.png`);

            if (fs.existsSync(oldBarcodePath)) {
                // If the old barcode file exists, rename it
                fs.renameSync(oldBarcodePath, newBarcodePath);
                console.log(`  [FILE] Renamed barcode: ${oldId}.png -> ${newId}.png`);
            } else {
                // If it doesn't exist, we should probably generate a new one
                console.log(`  [FILE] Old barcode not found. Generating new one...`);
                await generateBarcode(newId);
            }

            // 3. Update Database
            // We need to update asset_id.
            // Also, if 'nama' was empty or just dash, maybe we should set it to the oldId (which was the barcode)?
            // But looking at the controller logic: "const nama = req.body.nama", and "const asset_id = nama" (in the buggy version).
            // So the 'nama' field in DB should currently hold the barcode/asset number.
            // Let's verify if 'nama' is same as 'asset_id'.

            let updateQuery = "UPDATE assets SET asset_id = ? WHERE id = ?";
            let params = [newId, asset.id];

            // If nama is same as asset_id (which is the bug), we leave nama as is (because it IS the barcode/asset number).
            // But wait, the user wants "Asset ID" (newId) to be the unique code.
            // The "nama" field is displayed as "QR Code: [nama]" in view-qr.html.
            // So if `nama` is "2001..." it's correct for the title.
            // We only need to fix `asset_id` column.

            await pool.execute(updateQuery, params);
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
