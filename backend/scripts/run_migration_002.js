require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./src/config/db');

const runMigration = async () => {
    const connection = await pool.getConnection();
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'src/migrations/002_normalize_locations.sql'), 'utf8');
        const statements = sql.split(';').filter(s => s.trim());

        console.log('Running migration...');
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    console.log('Executed:', statement.substring(0, 50) + '...');
                } catch (err) {
                    // Ignore "Duplicate column name" error if re-running
                    if (err.code === 'ER_DUP_FIELDNAME') {
                        console.log('Column already exists, skipping ADD COLUMN.');
                    } else if (err.code === 'ER_DUP_KEY' || err.code === 'ER_FK_DUP_NAME') { // Check for duplicate FK or Key
                        console.log('Constraint likely exists, ignoring.');
                    } else {
                        console.warn('Warning executing statement:', err.message);
                    }
                }
            }
        }
        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        connection.release();
        process.exit();
    }
};

runMigration();
