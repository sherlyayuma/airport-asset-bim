
require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'airport_asset_db'
};

const requiredColumns = [
    { name: 'asset_id', type: 'VARCHAR(50) NOT NULL UNIQUE' },
    { name: 'nama', type: 'VARCHAR(255) NOT NULL' },
    { name: 'kategori', type: 'VARCHAR(100)' },
    { name: 'tipe_aset', type: 'VARCHAR(50)' },
    { name: 'lokasi', type: 'VARCHAR(255)' },
    { name: 'kondisi', type: 'ENUM("Baik", "Perbaikan", "Rusak", "Hilang") DEFAULT "Baik"' },
    { name: 'tanggal_beli', type: 'DATE' },
    { name: 'image_path', type: 'TEXT' },
    { name: 'barcode', type: 'VARCHAR(255)' }, // Path to barcode image

    // Additional Specification Columns
    { name: 'sno', type: 'VARCHAR(100)' },
    { name: 'sub_asset', type: 'VARCHAR(100)' },
    { name: 'type_barang', type: 'VARCHAR(100)' },
    { name: 'merk', type: 'VARCHAR(100)' },
    { name: 'serial_no', type: 'VARCHAR(100)' },
    { name: 'quantity', type: 'INT DEFAULT 1' },
    { name: 'cap_date', type: 'DATE' },
    { name: 'purch_doc', type: 'VARCHAR(100)' },
    { name: 'vendor_name', type: 'VARCHAR(255)' },
    { name: 'acquis_val', type: 'DECIMAL(15,2) DEFAULT 0' },
    { name: 'currency', type: 'VARCHAR(10) DEFAULT "IDR"' },
    { name: 'bun', type: 'VARCHAR(20)' },

    // Depreciation & Valuation
    { name: 'accum_dep', type: 'DECIMAL(15,2) DEFAULT 0' },
    { name: 'book_val', type: 'DECIMAL(15,2) DEFAULT 0' },
    { name: 'monthly_dep', type: 'DECIMAL(15,2) DEFAULT 0' },
    { name: 'dep_key', type: 'VARCHAR(50)' },
    { name: 'odep_start', type: 'DATE' },
    { name: 'use_life', type: 'INT DEFAULT 0' }, // in months or years? usually years but let's assume INT
    { name: 'last_ret', type: 'DATE' },

    // Org & Others
    { name: 'pemakai', type: 'VARCHAR(255)' },
    { name: 'cost_center', type: 'VARCHAR(100)' },
    { name: 'ev_1', type: 'VARCHAR(100)' },
    { name: 'ev_2', type: 'VARCHAR(100)' },
    { name: 'ev_3', type: 'VARCHAR(100)' },
    { name: 'ev_4', type: 'VARCHAR(100)' },
    { name: 'ev_grp_5', type: 'VARCHAR(100)' },
    { name: 'keterangan', type: 'TEXT' },
    { name: 'description', type: 'TEXT' }
];

async function updateSchema() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        console.log('Checking columns for table: assets');
        const [existingColumns] = await connection.execute('SHOW COLUMNS FROM assets');
        const existingColumnNames = existingColumns.map(col => col.Field.toLowerCase());

        for (const col of requiredColumns) {
            if (!existingColumnNames.includes(col.name.toLowerCase())) {
                console.log(`Column '${col.name}' is MISSING. Adding...`);
                try {
                    // Start simplified: Just add the column at the end
                    const query = `ALTER TABLE assets ADD COLUMN ${col.name} ${col.type}`;
                    await connection.execute(query);
                    console.log(`✅ Added column: ${col.name}`);
                } catch (addErr) {
                    console.error(`❌ Failed to add column ${col.name}:`, addErr.message);
                }
            } else {
                console.log(`- Column '${col.name}' exists.`);
            }
        }

        console.log('\nSchema update process finished.');

    } catch (err) {
        console.error('Database Error:', err.message);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
