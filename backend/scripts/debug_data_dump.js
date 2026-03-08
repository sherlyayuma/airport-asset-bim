const Asset = require('./src/models/Asset');

async function debugData() {
    try {
        console.log('\n--- Dumping Asset Names ---');
        const assets = await Asset.getAll({}, 'asc', 50, 0); // Get up to 50
        assets.forEach(a => console.log(`ID: ${a.id}, Name: '${a.nama}'`));

        console.log('\n--- Data Analysis ---');
        const numeric = assets.every(a => !isNaN(a.nama) && !a.nama.includes(' '));
        console.log(`All Numeric: ${numeric}`);

    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

debugData();
