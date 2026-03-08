const { getAll } = require('./src/models/Asset');

async function testSorting() {
    try {
        console.log("Testing Sorting Logic via Model directly...");

        console.log("\n--- Sort: NEWEST (default) ---");
        const newest = await getAll({}, 'newest', 3, 0);
        newest.forEach(a => console.log(`ID: ${a.id} | Name: ${a.nama}`));

        console.log("\n--- Sort: NAME ASC ---");
        const asc = await getAll({}, 'asc', 3, 0);
        asc.forEach(a => console.log(`ID: ${a.id} | Name: ${a.nama}`));

        console.log("\n--- Sort: NAME DESC ---");
        const desc = await getAll({}, 'desc', 3, 0);
        desc.forEach(a => console.log(`ID: ${a.id} | Name: ${a.nama}`));

        console.log("\n--- Sort: DATE DESC ---");
        const dateDesc = await getAll({}, 'date_desc', 3, 0);
        dateDesc.forEach(a => console.log(`ID: ${a.id} | Updated: ${a.updated_at}`));

        console.log("\n--- Sort: DATE ASC ---");
        const dateAsc = await getAll({}, 'date_asc', 3, 0);
        dateAsc.forEach(a => console.log(`ID: ${a.id} | Updated: ${a.updated_at}`));

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

testSorting();
