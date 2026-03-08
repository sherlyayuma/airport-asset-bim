require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        const [rows] = await connection.execute('DESCRIBE assets');
        console.log('Assets Table Schema:');
        rows.forEach(row => {
            console.log(`${row.Field} (${row.Type})`);
        });

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkSchema();
