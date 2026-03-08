const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function updateSchema() {
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

        console.log('Updating assets table schema...');
        // Change image_path from VARCHAR to TEXT (or LONGTEXT)
        await connection.execute(`
            ALTER TABLE assets 
            MODIFY COLUMN image_path TEXT
        `);

        console.log('Successfully updated image_path to TEXT');

        // Check again to confirm
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'image_path'
        `, [dbConfig.database]);

        console.log('New column definition:', columns[0]);

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
