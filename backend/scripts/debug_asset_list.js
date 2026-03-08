const Asset = require('./src/models/Asset');

(async () => {
    try {
        console.log('Testing Asset.countAll...');
        const total = await Asset.countAll({});
        console.log('Total assets:', total);
        console.log('Type of total:', typeof total);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
