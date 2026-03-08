const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);

  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');
  } catch (err) {
    console.error('❌ Database connection verification failed:', err.message);
  }
});
