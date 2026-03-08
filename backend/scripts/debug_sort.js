const http = require('http');
const jwt = require('jsonwebtoken');

const secret = 'airport_asset_secret_2026';
const token = jwt.sign({ id: 1, role: 'admin' }, secret, { expiresIn: '1h' });

function makeRequest(sortType) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/assets?limit=5&sort=${sortType}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`\n--- Sort: ${sortType} ---`);
            try {
                const json = JSON.parse(data);
                if (json.assets) {
                    console.log(`Count: ${json.assets.length}`);
                    json.assets.forEach(a => {
                        console.log(`ID: ${a.id}, Name: ${a.nama}, Updated: ${a.updated_at}, Created: ${a.created_at}`);
                    });
                } else {
                    console.log('No assets found or error');
                }
            } catch (e) {
                console.log('❌ Invalid JSON');
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Request failed: ${e.message}`);
    });

    req.end();
}

console.log('Testing Asset Sorting...');
makeRequest('asc');
setTimeout(() => makeRequest('desc'), 1000);
setTimeout(() => makeRequest('date_desc'), 2000);
