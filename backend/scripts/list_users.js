const pool = require('./src/config/db');

(async () => {
    try {
        const [rows] = await pool.execute('SELECT username, password, role FROM users LIMIT 5');
        console.log('Users:', rows);
        process.exit(0);
    } catch (err) {
        console.error('Error fetching users:', err);
        process.exit(1);
    }
})();
