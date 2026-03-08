const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = 3001; // Use different port for testing

const server = app.listen(PORT, async () => {
    console.log(`✅ Test Server running on http://localhost:${PORT}`);
    try {
        await pool.query('SELECT 1');
        console.log('✅ Database connection verified');
        setTimeout(() => {
            console.log('✅ Test passed, shutting down...');
            server.close(() => {
                pool.end();
                process.exit(0);
            });
        }, 5000);
    } catch (err) {
        console.error('❌ Test failed:', err.message);
        process.exit(1);
    }
});
