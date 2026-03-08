const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixSchema() {
    let connection;
    const result = { success: false, initialType: null, finalType: null, error: null };

    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'airport_asset_db'
        };

        connection = await mysql.createConnection(dbConfig);

        // Check initial
        const [rows1] = await connection.execute(`
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'image_path'
        `, [dbConfig.database]);

        if (rows1.length > 0) result.initialType = rows1[0].COLUMN_TYPE;

        // MODIFY
        await connection.execute(`ALTER TABLE assets MODIFY COLUMN image_path LONGTEXT`);

        // Check final
        const [rows2] = await connection.execute(`
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'image_path'
        `, [dbConfig.database]);

        if (rows2.length > 0) result.finalType = rows2[0].COLUMN_TYPE;

        result.success = true;

    } catch (err) {
        result.error = err.message;
    } finally {
        if (connection) await connection.end();
        fs.writeFileSync('schema_fix_result.json', JSON.stringify(result, null, 2));
    }
}

fixSchema();
