const pool = require('./src/config/db');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const sqlPath = path.join(__dirname, 'src/migrations/001_add_indexes.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        const statements = sql.split(';').filter(s => s.trim());

        for (const statement of statements) {
            console.log('Running:', statement);
            await pool.query(statement);
        }
        console.log('✅ Migration successful');
        process.exit(0);
    } catch (e) {
        if (e.code === 'ER_DUP_KEYNAME') {
            console.log('⚠️ Indexes might already exist, skipping...');
            process.exit(0);
        }
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
})();
