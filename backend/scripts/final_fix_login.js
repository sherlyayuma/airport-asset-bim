require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const run = async () => {
    console.log('--- STARTING DIAGNOSIS & FIX ---');
    console.log(`Node Version: ${process.version}`);

    // 1. Check Env
    console.log('Checking Environment Variables...');
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'airport_asset_db'
    };
    console.log(`DB Config: Host=${config.host}, User=${config.user}, DB=${config.database}`);

    let connection;
    try {
        // 2. Connect DB
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to database successfully.');

        // 3. Check Admin
        console.log("Searching for admin 'Asset Management'...");
        const [rows] = await connection.execute("SELECT * FROM admins WHERE username = 'Asset Management'");

        if (rows.length === 0) {
            console.log("⚠️ User 'Asset Management' NOT found. Creating it...");
            // Only insert if not found
            // ... (insert logic matching previous attempts)
            const newPass = 'Angkasapura001';
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPass, salt);
            await connection.execute(
                'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
                ['Asset Management', hash, 'admin']
            );
            console.log("✅ Created 'Asset Management'.");
        } else {
            console.log(`✅ User found. ID: ${rows[0].id}`);
            console.log(`Current Hash in DB: ${rows[0].password_hash}`);
        }

        // 4. Force Update Password
        console.log("🔄 forcing update for password 'AngkasaPura001'...");
        const newPassword = 'AngkasaPura001';
        const salt = await bcrypt.genSalt(10); // Standard salt rounds
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        console.log(`Generated NEW Hash: ${hashedPassword}`);

        await connection.execute(
            "UPDATE admins SET password_hash = ? WHERE username = 'Asset Management'",
            [hashedPassword]
        );
        console.log("✅ Database updated.");

        // 5. Verify IMMEDIATELY
        console.log("🔎 Verifying update...");
        const [verifyRows] = await connection.execute("SELECT * FROM admins WHERE username = 'Asset Management'");
        const storedHash = verifyRows[0].password_hash;

        console.log(`Retrieved Hash:     ${storedHash}`);

        const isMatch = await bcrypt.compare(newPassword, storedHash);
        if (isMatch) {
            console.log("✅ SUCCESS: Script successfully verified the password against the retrieved hash.");
        } else {
            console.error("❌ FAILURE: bcrypt.compare failed inside this script! This implies a library issue.");
        }

    } catch (err) {
        console.error('❌ CRITICAL ERROR:', err);
    } finally {
        if (connection) await connection.end();
        console.log('--- END ---');
    }
};

run();
