const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Starting script...');
console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
});

async function run() {
    console.log('Connecting...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'airport_asset_db'
        });
        console.log('Connected!');

        console.log('Running ALTER TABLE...');
        await connection.execute(`ALTER TABLE assets MODIFY COLUMN image_path LONGTEXT`);
        console.log('ALTER TABLE SUCCESS');

        await connection.end();
        console.log('Done.');
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

run();
