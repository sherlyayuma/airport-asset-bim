const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const logFile = path.join(__dirname, 'db_fix_log.txt');
const log = (msg) => {
    const time = new Date().toISOString();
    fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
    console.log(msg);
}

log('Starting Force Fix Script...');

async function run() {
    let connection;
    try {
        log('Connecting...');
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'airport_asset_db'
        };
        log(`DB Config Host: ${dbConfig.host}, DB: ${dbConfig.database}`);

        connection = await mysql.createConnection(dbConfig);
        log('Connected!');

        // Check current type
        log('Checking current schema...');
        const [rows1] = await connection.execute(`
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'image_path'
        `, [dbConfig.database]);

        if (rows1.length > 0) {
            log(`Current Type: ${rows1[0].COLUMN_TYPE}`);
        } else {
            log('Column image_path NOT FOUND!');
        }

        // Alter
        log('Running ALTER TABLE assets MODIFY COLUMN image_path LONGTEXT...');
        await connection.execute(`ALTER TABLE assets MODIFY COLUMN image_path LONGTEXT`);
        log('ALTER TABLE executed.');

        // Verify
        const [rows2] = await connection.execute(`
            SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assets' AND COLUMN_NAME = 'image_path'
        `, [dbConfig.database]);

        if (rows2.length > 0) {
            log(`New Type: ${rows2[0].COLUMN_TYPE}`);
        }

        log('SUCCESS: Script finished.');

    } catch (e) {
        log(`ERROR: ${e.message}`);
    } finally {
        if (connection) await connection.end();
        log('Connection closed.');
    }
}

run();
