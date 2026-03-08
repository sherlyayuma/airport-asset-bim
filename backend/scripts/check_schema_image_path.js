const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function checkSchema() {
    let connection;
    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'airport_asset_db'
        };

        console.log('Connecting to database:', dbConfig.database);
        connection = await mysql.createConnection(dbConfig);

        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'image_path'
        `, [dbConfig.database]);

        if (columns.length > 0) {
            console.log('Current column definition:', columns[0]);
        } else {
            console.log('Column image_path not found in assets table.');
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
