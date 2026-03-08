const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, '../migrations/003_alter_quantity_decimal.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration: ' + sql);
        await pool.query(sql);
        console.log('✅ Migration 003 successful');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigration();
