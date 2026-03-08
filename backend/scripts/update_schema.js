require('dotenv').config();
const pool = require('./src/models/db');

async function updateSchema() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to database.');

        const newColumns = [
            "ADD COLUMN sno VARCHAR(50) AFTER asset_id",
            "ADD COLUMN sub_asset VARCHAR(50) AFTER sno",
            "ADD COLUMN type_barang VARCHAR(100) AFTER kategori",
            "ADD COLUMN merk VARCHAR(100) AFTER type_barang",
            "ADD COLUMN serial_no VARCHAR(100) AFTER merk",
            "ADD COLUMN quantity DECIMAL(15,2) DEFAULT 0 AFTER serial_no",
            "ADD COLUMN cap_date DATE AFTER quantity",
            "ADD COLUMN purch_doc VARCHAR(100) AFTER cap_date",
            "ADD COLUMN vendor_name VARCHAR(150) AFTER purch_doc",
            "ADD COLUMN acquis_val DECIMAL(15,2) DEFAULT 0 AFTER vendor_name",
            "ADD COLUMN currency VARCHAR(10) DEFAULT 'IDR' AFTER acquis_val",
            "ADD COLUMN bun VARCHAR(20) AFTER currency",
            "ADD COLUMN accum_dep DECIMAL(15,2) DEFAULT 0 AFTER bun",
            "ADD COLUMN book_val DECIMAL(15,2) DEFAULT 0 AFTER accum_dep",
            "ADD COLUMN monthly_dep DECIMAL(15,2) DEFAULT 0 AFTER book_val",
            "ADD COLUMN dep_key VARCHAR(20) AFTER monthly_dep",
            "ADD COLUMN odep_start DATE AFTER dep_key",
            "ADD COLUMN use_life VARCHAR(50) AFTER odep_start",
            "ADD COLUMN last_ret VARCHAR(50) AFTER use_life",
            "ADD COLUMN pemakai VARCHAR(100) AFTER lokasi",
            "ADD COLUMN cost_center VARCHAR(50) AFTER pemakai",
            "ADD COLUMN ev_1 VARCHAR(100) AFTER cost_center",
            "ADD COLUMN ev_2 VARCHAR(100) AFTER ev_1",
            "ADD COLUMN ev_3 VARCHAR(100) AFTER ev_2",
            "ADD COLUMN ev_4 VARCHAR(100) AFTER ev_3",
            "ADD COLUMN ev_grp_5 VARCHAR(100) AFTER ev_4",
            "ADD COLUMN keterangan TEXT AFTER image_path"
        ];

        for (const col of newColumns) {
            try {
                await connection.query(`ALTER TABLE assets ${col}`);
                console.log(`Executed: ${col}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Skipped (already exists): ${col.split(' ')[2]}`);
                } else {
                    console.error(`Error adding column: ${err.message}`);
                }
            }
        }

        console.log('Schema update completed.');
        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

updateSchema();
